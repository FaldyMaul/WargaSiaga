import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const chromePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const profileDir = path.join(os.tmpdir(), `wargasiaga-pill-audit-${process.pid}`);
const artifactDir = "C:\\Users\\ZenBook\\.gemini\\antigravity-ide\\brain\\a0ae6a16-f9e0-441a-b39a-4b62b02eb3f6";
const reportDir = path.resolve(projectRoot, "../wargasiaga-dev-report/screenshots");

fs.mkdirSync(profileDir, { recursive: true });
fs.mkdirSync(artifactDir, { recursive: true });
fs.mkdirSync(reportDir, { recursive: true });

const appPort = 53399;
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
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`${baseUrl}/index.html`);
      if (res.ok) return;
    } catch (_) {}
    await wait(100);
  }
  throw new Error("Server not ready");
}

async function main() {
  console.log("=== RUNNING EYEBROW / PILL ICON & DOT AUDIT ===");
  await waitForServer();
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
      await wait(50);
    }
    await wait(200);
  }

  async function capture(filename) {
    const shot = await call("Page.captureScreenshot", { format: "png" });
    const buffer = Buffer.from(shot.data, "base64");
    fs.writeFileSync(path.join(artifactDir, filename), buffer);
    fs.writeFileSync(path.join(reportDir, filename), buffer);
    console.log(`[PILL SCREENSHOT] Saved: ${filename} (${buffer.length} bytes)`);
  }

  await call("Page.enable");
  await call("Runtime.enable");
  await call("Emulation.setDeviceMetricsOverride", { width: 1280, height: 850, deviceScaleFactor: 2, mobile: false });

  const pagesToAudit = [
    { name: "home", url: `${baseUrl}/index.html` },
    { name: "modus", url: `${baseUrl}/modus.html` },
    { name: "detail", url: `${baseUrl}/modus-detail.html?id=sms-blaster-fake-bts` },
    { name: "consult", url: `${baseUrl}/konsultasi.html` },
    { name: "urgent", url: `${baseUrl}/bantuan-darurat.html` },
    { name: "family", url: `${baseUrl}/bantu-orang-lain.html` },
    { name: "reports", url: `${baseUrl}/laporan.html` },
    { name: "report-form", url: `${baseUrl}/lapor.html` },
    { name: "report-status", url: `${baseUrl}/status-laporan.html` },
    { name: "about", url: `${baseUrl}/tentang.html` }
  ];

  let totalEyebrows = 0;
  let allHaveIcons = true;
  let allDotsHidden = true;

  for (const p of pagesToAudit) {
    console.log(`Auditing page: ${p.name} (${p.url})...`);
    await navigate(p.url);

    const auditData = await evaluate(`(() => {
      const eyebrows = [...document.querySelectorAll('.eyebrow')];
      return eyebrows.map(el => {
        const svg = el.querySelector('svg');
        const beforeStyle = window.getComputedStyle(el, '::before');
        const text = el.innerText.trim();
        const iconName = svg?.getAttribute('data-icon') || svg?.className?.baseVal || (svg ? 'svg' : null);
        return {
          text,
          hasIcon: Boolean(svg),
          iconName,
          beforeDisplay: beforeStyle.display,
          beforeContent: beforeStyle.content,
          className: el.className
        };
      });
    })()`);

    console.log(`  Found ${auditData.length} eyebrows on ${p.name}:`);
    for (const item of auditData) {
      totalEyebrows++;
      const dotHidden = item.beforeDisplay === 'none' || item.beforeContent === 'none' || item.beforeContent === '""';
      if (!item.hasIcon) {
        allHaveIcons = false;
        console.error(`  [FAIL] Missing icon in eyebrow: "${item.text}" on ${p.name}`);
      }
      if (item.beforeDisplay !== 'none') {
        allDotsHidden = false;
        console.error(`  [FAIL] ::before dot NOT hidden in: "${item.text}" on ${p.name} (display: ${item.beforeDisplay})`);
      }
      console.log(`    ✓ "${item.text}" -> icon: [${item.iconName}], dot hidden: ${item.beforeDisplay === 'none'}`);
    }

    // Specific screenshots matching the user's report
    if (p.name === "home") {
      // 1. Home Asisten Keamanan Warga (Image 1 match)
      await evaluate(`(() => {
        const el = document.querySelector('.eyebrow');
        if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
      })()`);
      await wait(200);
      await capture("audit-pill-01-home-asisten.png");

      // 2. Home Jalur Layanan (Image 2 match)
      await evaluate(`(() => {
        const el = [...document.querySelectorAll('.eyebrow')].find(e => e.innerText.includes('JALUR LAYANAN') || e.innerText.includes('Jalur Layanan'));
        if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
      })()`);
      await wait(200);
      await capture("audit-pill-02-home-jalur-layanan.png");
    } else if (p.name === "reports") {
      // 3. Reports Pantauan Pola Edukasi (Image 3 match)
      await evaluate(`(() => {
        const el = [...document.querySelectorAll('.eyebrow')].find(e => e.innerText.includes('PANTAUAN') || e.innerText.includes('Pantauan'));
        if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
      })()`);
      await wait(200);
      await capture("audit-pill-03-reports-pantauan-pola.png");
    } else if (p.name === "modus") {
      await evaluate(`(() => {
        const el = document.querySelector('.age-selector legend .eyebrow');
        if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
      })()`);
      await wait(200);
      await capture("audit-pill-04-modus-steps.png");
    }
  }

  console.log(`\n=== AUDIT SUMMARY ===`);
  console.log(`Total Eyebrows Checked: ${totalEyebrows}`);
  console.log(`All Have Icons: ${allHaveIcons ? "PASS ✅" : "FAIL ❌"}`);
  console.log(`All Pseudo-element Dots Hidden: ${allDotsHidden ? "PASS ✅" : "FAIL ❌"}`);

  cleanup();
  process.exit(allHaveIcons && allDotsHidden ? 0 : 1);
}

main().catch(err => {
  console.error("Audit failed:", err);
  cleanup();
  process.exit(1);
});
