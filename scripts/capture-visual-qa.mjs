import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const chromePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const profileDir = path.join(os.tmpdir(), `wargasiaga-qa-chrome-${process.pid}`);
const artifactDir = "C:\\Users\\ZenBook\\.gemini\\antigravity-ide\\brain\\a0ae6a16-f9e0-441a-b39a-4b62b02eb3f6";
const reportDir = path.resolve(projectRoot, "../wargasiaga-dev-report/screenshots");

fs.mkdirSync(profileDir, { recursive: true });
fs.mkdirSync(artifactDir, { recursive: true });
fs.mkdirSync(reportDir, { recursive: true });

const appPort = 4455;
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
  `--remote-debugging-port=0`,
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
    console.log(`Saved screenshot: ${filename} (${buffer.length} bytes)`);
  }

  await call("Page.enable");
  await call("Runtime.enable");

  // 1. Desktop Konsultasi - fixed input disclosure layout (Attachment 1 verification)
  await call("Emulation.setDeviceMetricsOverride", { width: 1280, height: 850, deviceScaleFactor: 1, mobile: false });
  await navigate(`${baseUrl}/konsultasi`);
  await evaluate("document.querySelector('#consult-shell').scrollIntoView({block:'center'})");
  await wait(200);
  await capture("qa-consultasi-options-fixed.png");

  // 2. Desktop Modus - 3 Column default view with categorized filter panel (Attachment 2 verification)
  await navigate(`${baseUrl}/modus`);
  await evaluate("document.documentElement.style.scrollBehavior='auto'; window.scrollTo(0, 520);");
  await wait(300);
  await capture("qa-modus-catalogue-3col.png");

  // 3. Desktop Modus - Compact List View (1 column multi-row)
  await evaluate("document.querySelector('[data-view=\"list\"]').click(); window.scrollTo(0, 520);");
  await wait(300);
  await capture("qa-modus-catalogue-list.png");

  // 4. Modus Detail - Integrated Literacy guidance without PDF draft text
  await navigate(`${baseUrl}/modus-detail?id=bank-otp`);
  await evaluate("const d = document.querySelector('.literacy-reference'); if(d) { d.open = true; d.scrollIntoView({block:'center'}); }");
  await wait(200);
  await capture("qa-modus-detail-integrated.png");

  // 5. Mobile Modus Viewport (390x844)
  await call("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await navigate(`${baseUrl}/konsultasi`);
  await evaluate("document.querySelector('#consult-shell').scrollIntoView({block:'start'})");
  await wait(200);
  await capture("qa-consultasi-mobile-options.png");

  ws.close();
  cleanup();
  console.log("All visual QA captures generated successfully!");
}

main().catch((err) => {
  console.error("Capture failed:", err);
  cleanup();
  process.exit(1);
});
