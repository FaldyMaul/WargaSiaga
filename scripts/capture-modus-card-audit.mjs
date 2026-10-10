import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const chromePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const profileDir = path.join(os.tmpdir(), `wargasiaga-card-audit-${process.pid}`);
const artifactDir = "C:\\Users\\ZenBook\\.gemini\\antigravity-ide\\brain\\a0ae6a16-f9e0-441a-b39a-4b62b02eb3f6";
const reportDir = path.resolve(projectRoot, "../wargasiaga-dev-report/screenshots");

fs.mkdirSync(profileDir, { recursive: true });
fs.mkdirSync(artifactDir, { recursive: true });
fs.mkdirSync(reportDir, { recursive: true });

const appPort = 53397;
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
    await wait(200);
  }
  throw new Error("DevTools debugger URL not found");
}

class CdpSession {
  constructor(ws) {
    this.ws = ws;
    this.id = 1;
    this.pending = new Map();
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expr) {
    const res = await this.send("Runtime.evaluate", {
      expression: expr,
      returnByValue: true,
      awaitPromise: true
    });
    return res.result?.value;
  }
}

async function run() {
  console.log("Waiting for test server...");
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`${baseUrl}/health`);
      if (res.ok) break;
    } catch (_) {}
    await wait(200);
  }

  const wsUrl = await getDebuggerUrl();
  const ws = new WebSocket(wsUrl);
  await new Promise((resolve) => { ws.onopen = resolve; });
  const cdp = new CdpSession(ws);

  await cdp.send("Page.enable");
  await cdp.send("DOM.enable");
  await cdp.send("CSS.enable");

  // Desktop 1280x900
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: 1280,
    height: 900,
    deviceScaleFactor: 2,
    mobile: false
  });

  console.log("Navigating to modus catalog...");
  await cdp.send("Page.navigate", { url: `${baseUrl}/modus` });
  await wait(2000);

  // Scroll first card into view
  const clipFirst = await cdp.eval(`(() => {
    const el = document.querySelector(".modus-card");
    if (!el) return null;
    el.scrollIntoView({ block: "center", inline: "nearest" });
    const r = el.getBoundingClientRect();
    return { x: Math.max(0, r.x - 8), y: Math.max(0, r.y - 8), width: r.width + 16, height: r.height + 16, scale: 1 };
  })()`);
  await wait(500);

  if (clipFirst) {
    const shot = await cdp.send("Page.captureScreenshot", {
      format: "png",
      clip: clipFirst
    });
    const buf = Buffer.from(shot.data, "base64");
    fs.writeFileSync(path.join(artifactDir, "audit-card-01-bank-otp.png"), buf);
    fs.writeFileSync(path.join(reportDir, "audit-card-01-bank-otp.png"), buf);
    console.log("Saved screenshot: audit-card-01-bank-otp.png");
  }

  // Scroll whole catalog row into view
  const clipGrid = await cdp.eval(`(() => {
    const el = document.querySelector("#modus-grid");
    if (!el) return null;
    el.scrollIntoView({ block: "start", inline: "nearest" });
    const r = el.getBoundingClientRect();
    return { x: Math.max(0, r.x - 8), y: Math.max(0, r.y - 8), width: r.width + 16, height: Math.min(r.height + 16, 540), scale: 1 };
  })()`);
  await wait(500);

  if (clipGrid) {
    const shot = await cdp.send("Page.captureScreenshot", {
      format: "png",
      clip: clipGrid
    });
    const buf = Buffer.from(shot.data, "base64");
    fs.writeFileSync(path.join(artifactDir, "audit-card-02-catalog-grid.png"), buf);
    fs.writeFileSync(path.join(reportDir, "audit-card-02-catalog-grid.png"), buf);
    console.log("Saved screenshot: audit-card-02-catalog-grid.png");
  }

  // Mobile viewport 390x844
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await wait(800);

  const clipMobile = await cdp.eval(`(() => {
    const el = document.querySelector(".modus-card");
    if (!el) return null;
    el.scrollIntoView({ block: "start", inline: "nearest" });
    const r = el.getBoundingClientRect();
    return { x: Math.max(0, r.x - 4), y: Math.max(0, r.y - 4), width: r.width + 8, height: r.height + 8, scale: 1 };
  })()`);
  await wait(500);

  if (clipMobile) {
    const shot = await cdp.send("Page.captureScreenshot", {
      format: "png",
      clip: clipMobile
    });
    const buf = Buffer.from(shot.data, "base64");
    fs.writeFileSync(path.join(artifactDir, "audit-card-03-mobile-card.png"), buf);
    fs.writeFileSync(path.join(reportDir, "audit-card-03-mobile-card.png"), buf);
    console.log("Saved screenshot: audit-card-03-mobile-card.png");
  }

  console.log("Capture completed.");
  process.exit(0);
}

run().catch((err) => {
  console.error("Audit failed:", err);
  process.exit(1);
});
