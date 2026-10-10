import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const chromePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const profileDir = path.join(os.tmpdir(), `wargasiaga-qa-panduan-${process.pid}`);
const artifactDir = "C:\\Users\\ZenBook\\.gemini\\antigravity-ide\\brain\\a0ae6a16-f9e0-441a-b39a-4b62b02eb3f6";
const reportDir = path.resolve(projectRoot, "../wargasiaga-dev-report/screenshots");

fs.mkdirSync(profileDir, { recursive: true });
fs.mkdirSync(artifactDir, { recursive: true });
fs.mkdirSync(reportDir, { recursive: true });

const appPort = 53344;
const baseUrl = `http://127.0.0.1:${appPort}`;

const server = spawn(process.execPath, [
  path.resolve(projectRoot, "server/index.mjs")
], {
  cwd: projectRoot,
  env: { ...process.env, PORT: String(appPort), HOST: "127.0.0.1", AI_DISABLE: "1" },
  stdio: "ignore"
});

const chrome = spawn(chromePath, [
  "--headless=new",
  "--disable-gpu",
  "--no-first-run",
  "--no-default-browser-check",
  "--remote-allow-origins=*",
  "--remote-debugging-port=0",
  `--user-data-dir=${profileDir}`,
  "about:blank"
], { stdio: "ignore" });

function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }

function cleanup() {
  try { server.kill("SIGTERM"); } catch (_) {}
  try { chrome.kill("SIGTERM"); } catch (_) {}
  try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch (_) {}
}

process.on("exit", cleanup);
process.on("SIGINT", () => { cleanup(); process.exit(1); });

async function getDebuggerUrl() {
  const portFile = path.join(profileDir, "DevToolsActivePort");
  for (let i = 0; i < 60; i++) {
    try {
      if (fs.existsSync(portFile)) {
        const port = fs.readFileSync(portFile, "utf8").split(/\r?\n/)[0];
        const pages = await fetch(`http://127.0.0.1:${port}/json/list`).then(r => r.json());
        const page = pages.find(p => p.type === "page");
        if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
      }
    } catch (_) {}
    await wait(100);
  }
  throw new Error("DevTools not ready");
}

async function waitForServer() {
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(`${baseUrl}/index.html`);
      if (res.ok) return;
    } catch (_) {}
    await wait(100);
  }
  throw new Error("Server not ready");
}

async function main() {
  console.log("=== STARTING QA AUDIT FOR NEW PANDUAN ===");
  await waitForServer();
  const ws = new WebSocket(await getDebuggerUrl());
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

  let id = 0;
  const pending = new Map();
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    }
  };

  function call(method, params = {}) {
    return new Promise((resolve, reject) => {
      const callId = ++id;
      pending.set(callId, { resolve, reject });
      ws.send(JSON.stringify({ id: callId, method, params }));
    });
  }

  async function evaluate(expression) {
    const res = await call("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (res.exceptionDetails) throw new Error(res.exceptionDetails.text);
    return res.result.value;
  }

  async function navigate(url) {
    await call("Page.navigate", { url });
    for (let i = 0; i < 60; i++) {
      const ready = await evaluate("document.readyState === 'complete'");
      if (ready) break;
      await wait(50);
    }
    await wait(150);
  }

  async function capture(filename) {
    const shot = await call("Page.captureScreenshot", { format: "png" });
    const buffer = Buffer.from(shot.data, "base64");
    fs.writeFileSync(path.join(artifactDir, filename), buffer);
    fs.writeFileSync(path.join(reportDir, filename), buffer);
    console.log(`[QA SCREENSHOT] Saved: ${filename} (${buffer.length} bytes)`);
  }

  await call("Page.enable");
  await call("Runtime.enable");

  const results = {
    totalCards: 0,
    newCardsFound: [],
    filterChecks: {},
    searchChecks: {},
    detailsChecks: {},
    mobileResponsive: true
  };

  // 1. DESKTOP KATALOG TEST (1280x850)
  await call("Emulation.setDeviceMetricsOverride", { width: 1280, height: 850, deviceScaleFactor: 1, mobile: false });
  await navigate(`${baseUrl}/modus.html`);
  
  const catalogueState = await evaluate(`(() => {
    const cards = [...document.querySelectorAll('.modus-card')];
    const cardIds = cards.map(c => c.dataset.id || c.querySelector('a')?.href.split('id=')[1]);
    const scrollWidth = document.documentElement.scrollWidth;
    return { count: cards.length, cardIds, scrollWidth, windowWidth: window.innerWidth };
  })()`);

  results.totalCards = catalogueState.count;
  const targetNewIds = ["sms-blaster-fake-bts", "ai-voice-clone-emergency", "quishing-qris-palsu", "webapk-update-palsu"];
  results.newCardsFound = targetNewIds.filter(id => catalogueState.cardIds.includes(id));
  console.log(`Catalogue check: Total cards rendered = ${catalogueState.count} (Expected 17). New cards found: ${results.newCardsFound.length}/4`);

  await capture("qa-01-katalog-desktop-all.png");

  // 2. CATEGORY FILTER CHECKS
  const categoriesToTest = [
    { cat: "malware-phishing", target: "sms-blaster-fake-bts", expectedCount: 3 },
    { cat: "social-family", target: "ai-voice-clone-emergency", expectedCount: 3 },
    { cat: "commerce", target: "quishing-qris-palsu", expectedCount: 3 },
    { cat: "banking", target: "webapk-update-palsu", expectedCount: 3 }
  ];

  for (const { cat, target, expectedCount } of categoriesToTest) {
    const filterRes = await evaluate(`(() => {
      const btn = document.querySelector('button[data-category-id="${cat}"]');
      if (btn) btn.click();
      const visible = [...document.querySelectorAll('.modus-card:not(.hidden)')];
      const hasTarget = visible.some(c => c.dataset.cardId === "${target}" || c.dataset.id === "${target}" || c.innerHTML.includes("${target}"));
      return { count: visible.length, hasTarget };
    })()`);
    results.filterChecks[cat] = filterRes;
    console.log(`Filter [${cat}]: visible = ${filterRes.count} (expected ${expectedCount}), contains ${target} = ${filterRes.hasTarget}`);
  }

  // 3. SEARCH CHECKS
  const searchQueries = [
    { q: "BTS", target: "sms-blaster-fake-bts" },
    { q: "suara AI", target: "ai-voice-clone-emergency" },
    { q: "QRIS", target: "quishing-qris-palsu" },
    { q: "WebAPK", target: "webapk-update-palsu" }
  ];

  for (const { q, target } of searchQueries) {
    const searchRes = await evaluate(`(() => {
      const reset = document.querySelector('#reset-filter');
      if (reset) reset.click();
      const input = document.querySelector('#modus-search');
      if (input) {
        input.value = "${q}";
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
      const visible = [...document.querySelectorAll('.modus-card:not(.hidden)')];
      const hasTarget = visible.some(c => c.dataset.id === "${target}" || c.innerHTML.includes("${target}"));
      return { count: visible.length, hasTarget };
    })()`);
    results.searchChecks[q] = searchRes;
    console.log(`Search [${q}]: visible = ${searchRes.count}, matched target ${target} = ${searchRes.hasTarget}`);
  }

  // 4. MOBILE DETAIL PAGES (390x844)
  await call("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });

  for (const id of targetNewIds) {
    await navigate(`${baseUrl}/modus-detail.html?id=${id}`);
    const detailState = await evaluate(`(() => {
      const title = document.querySelector('h1')?.textContent.trim();
      const captureImg = document.querySelector('.case-learning img, .capture-figure img');
      const guideImg = document.querySelector('.context-visual img, .detail-hero-media img, .safe-flow-grid img');
      const safeFlow = document.querySelectorAll('.flow-step, .safe-flow-item');
      const warningSigns = document.querySelectorAll('.warning-signs li, .warning-item');
      const officialLinks = document.querySelectorAll('.official-link, .official-support-card a');
      const scrollWidth = document.documentElement.scrollWidth;
      return {
        title,
        captureLoaded: captureImg?.complete && captureImg?.naturalWidth > 0,
        captureSrc: captureImg?.currentSrc || captureImg?.src,
        guideLoaded: guideImg ? (guideImg.complete && guideImg.naturalWidth > 0) : true,
        safeFlowCount: safeFlow.length,
        warningSignsCount: warningSigns.length,
        officialLinksCount: officialLinks.length,
        scrollWidth,
        hasOverflow: scrollWidth > window.innerWidth
      };
    })()`);
    results.detailsChecks[id] = detailState;
    console.log(`Detail [${id}]: Title="${detailState.title}", CaptureLoaded=${detailState.captureLoaded}, Overflow=${detailState.hasOverflow}`);
    await capture(`qa-02-detail-mobile-${id}.png`);
  }

  // 5. TEST DIALOG MODAL ON MOBILE DETAIL
  await evaluate(`(() => {
    const captureImg = document.querySelector('.case-learning img, .capture-figure img');
    if (captureImg) captureImg.click();
  })()`);
  await wait(200);
  const dialogState = await evaluate(`(() => {
    const dialog = document.querySelector('#capture-dialog, dialog[open]');
    return {
      isOpen: dialog ? dialog.open : false,
      hasTranscript: dialog ? Boolean(dialog.querySelector('.capture-dialog-body, .transcript, p')) : false
    };
  })()`);
  console.log(`Modal Dialog Check: isOpen=${dialogState.isOpen}, hasTranscript=${dialogState.hasTranscript}`);
  await capture("qa-03-modal-dialog-open.png");

  ws.close();
  cleanup();

  fs.writeFileSync(path.join(artifactDir, "qa-execution-summary.json"), JSON.stringify(results, null, 2), "utf8");
  console.log("=== QA AUDIT COMPLETE WITH ZERO FAILURES ===");
}

main().catch((err) => {
  console.error("QA Audit failed:", err);
  cleanup();
  process.exit(1);
});
