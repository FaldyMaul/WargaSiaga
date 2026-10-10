import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const chromePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const profileDir = path.join(os.tmpdir(), `wargasiaga-prod-full-${process.pid}`);
const artifactDir = "C:\\Users\\ZenBook\\.gemini\antigravity-ide\\brain\\a0ae6a16-f9e0-441a-b39a-4b62b02eb3f6";
const reportDir = path.resolve(projectRoot, "../wargasiaga-dev-report/screenshots");

fs.mkdirSync(profileDir, { recursive: true });
fs.mkdirSync(artifactDir, { recursive: true });
fs.mkdirSync(reportDir, { recursive: true });

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

async function main() {
  console.log("=== COMPREHENSIVE PRODUCTION VERIFICATION AUDIT ===");
  const wsDebuggerUrl = await getDebuggerUrl();
  const ws = new WebSocket(wsDebuggerUrl);
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
      await wait(100);
    }
    await wait(400);
  }

  async function capture(filename) {
    const shot = await call("Page.captureScreenshot", { format: "png" });
    const buffer = Buffer.from(shot.data, "base64");
    fs.writeFileSync(path.join(artifactDir, filename), buffer);
    fs.writeFileSync(path.join(reportDir, filename), buffer);
    console.log(`[PROD SCREENSHOT] Saved: ${filename} (${buffer.length} bytes)`);
  }

  await call("Page.enable");
  await call("Runtime.enable");

  // TEST 1: CATALOGUE GRID WITH SCROLL
  await call("Emulation.setDeviceMetricsOverride", { width: 1280, height: 950, deviceScaleFactor: 1, mobile: false });
  await navigate("https://warga-siaga.id/modus");
  
  // Scroll down to the catalogue cards grid
  await evaluate(`(() => {
    const target = document.querySelector('.modus-card[data-card-id="sms-blaster-fake-bts"]') || document.querySelector('.modus-grid');
    if (target) target.scrollIntoView({ behavior: 'instant', block: 'center' });
  })()`);
  await wait(400);
  await capture("prod-audit-01-new-cards-in-grid.png");

  // TEST 2: ALL 4 NEW DETAIL PAGES
  const newGuideIds = [
    { id: "sms-blaster-fake-bts", name: "SMS Blaster (Fake BTS)" },
    { id: "ai-voice-clone-emergency", name: "Kloning Suara AI Darurat" },
    { id: "quishing-qris-palsu", name: "Quishing & QRIS Tempelan Palsu" },
    { id: "webapk-update-palsu", name: "WebAPK / Update Sistem Palsu" }
  ];

  for (const guide of newGuideIds) {
    console.log(`Verifying production detail page: ${guide.name} (${guide.id})...`);
    await navigate(`https://warga-siaga.id/modus-detail?id=${guide.id}`);
    
    const pageCheck = await evaluate(`(() => {
      const title = document.querySelector('h1')?.innerText || '';
      const heroImg = document.querySelector('.detail-hero img, .guide-hero img, [data-hero-image]')?.src || '';
      const warningSigns = [...document.querySelectorAll('.warning-sign, .risk-point, li')].map(l => l.innerText.trim()).filter(Boolean);
      const captureImg = document.querySelector('.reconstruction-preview img, .capture-card img')?.src || '';
      return {
        title,
        heroImg: heroImg.slice(-50),
        captureImg: captureImg.slice(-50),
        warningSignsCount: warningSigns.length
      };
    })()`);
    console.log(`Detail check for ${guide.id}:`, pageCheck);

    if (guide.id === "sms-blaster-fake-bts") {
      await capture("prod-audit-02-sms-blaster-detail.png");
      // Open dialog modal if present
      await evaluate(`(() => {
        const dialog = document.querySelector('dialog, #capture-dialog');
        const openBtn = document.querySelector('[data-open-capture-dialog], .btn-open-capture, button.view-capture');
        if (openBtn) openBtn.click();
        else if (dialog && typeof dialog.showModal === 'function') dialog.showModal();
      })()`);
      await wait(300);
      await capture("prod-audit-03-sms-blaster-modal.png");
    } else if (guide.id === "ai-voice-clone-emergency") {
      await capture("prod-audit-04-ai-voice-clone-detail.png");
    } else if (guide.id === "quishing-qris-palsu") {
      await capture("prod-audit-05-quishing-qris-detail.png");
    } else if (guide.id === "webapk-update-palsu") {
      await capture("prod-audit-06-webapk-update-detail.png");
    }
  }

  // TEST 3: MOBILE CHECK ON LIVE SITE
  await call("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await navigate("https://warga-siaga.id/modus");
  await evaluate(`(() => {
    const el = document.querySelector('.modus-card[data-card-id="sms-blaster-fake-bts"]');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  })()`);
  await wait(400);
  await capture("prod-audit-07-mobile-card-grid.png");

  console.log("=== ALL PRODUCTION AUDIT STEPS COMPLETED ===");
  cleanup();
  process.exit(0);
}

main().catch(err => {
  console.error("Audit error:", err);
  cleanup();
  process.exit(1);
});
