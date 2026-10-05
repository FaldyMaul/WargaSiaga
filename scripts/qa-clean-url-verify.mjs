import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const outputDir = path.resolve(__dirname, "../../wargasiaga-dev-report/screenshots");
fs.mkdirSync(outputDir, { recursive: true });

const chromePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const profileDir = path.join(os.tmpdir(), `wargasiaga-qa-clean-url-${process.pid}`);
const appPort = 62929;
const baseUrl = `http://127.0.0.1:${appPort}`;

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

function wait(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

async function getDebuggerUrl() {
  const portFile = path.join(profileDir, "DevToolsActivePort");
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      if (fs.existsSync(portFile)) {
        const debugPort = fs.readFileSync(portFile, "utf8").split(/\r?\n/)[0];
        const pages = await fetch(`http://127.0.0.1:${debugPort}/json/list`).then(r => r.json());
        const page = pages.find(p => p.type === "page");
        if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
      }
    } catch (_) {}
    await wait(100);
  }
  throw new Error("DevTools not ready");
}

async function run() {
  const ws = new WebSocket(await getDebuggerUrl());
  await new Promise((resolve, reject) => { ws.addEventListener("open", resolve); ws.addEventListener("error", reject); });
  let id = 0;
  const pending = new Map();
  ws.addEventListener("message", (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    }
  });

  function call(method, params = {}) {
    return new Promise((resolve, reject) => {
      const callId = ++id;
      pending.set(callId, { resolve, reject });
      ws.send(JSON.stringify({ id: callId, method, params }));
    });
  }

  async function evaluate(expression) {
    const result = await call("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  }

  async function navigate(url) {
    await call("Page.navigate", { url });
    for (let i = 0; i < 50; i++) {
      const done = await evaluate("document.readyState === 'complete'");
      if (done) break;
      await wait(50);
    }
    await wait(150);
  }

  await call("Page.enable");
  await call("Runtime.enable");
  await call("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });

  const allPages = [
    { name: "Beranda", path: "/" },
    { name: "Modus", path: "/modus" },
    { name: "Detail Modus", path: "/modus-detail?id=bank-otp" },
    { name: "Konsultasi", path: "/konsultasi" },
    { name: "Bantu Orang Lain", path: "/bantu-orang-lain" },
    { name: "Bantuan Darurat", path: "/bantuan-darurat" },
    { name: "Lapor Warga", path: "/laporan" },
    { name: "Formulir Laporan", path: "/lapor" },
    { name: "Status Laporan", path: "/status-laporan" },
    { name: "Tentang", path: "/tentang" }
  ];

  console.log("=== COMPREHENSIVE 10-PAGE CLEAN URL AUDIT ===");
  let grandTotalLinks = 0;
  let grandTotalHtmlLinks = 0;

  for (const page of allPages) {
    await navigate(`${baseUrl}${page.path}`);
    const actualPath = await evaluate("location.pathname");
    const actualHref = await evaluate("location.href");
    const hasHtmlInUrl = actualHref.includes(".html");
    if (hasHtmlInUrl) {
      throw new Error(`FAILURE: ${page.name} url still has .html in address bar: ${actualHref}`);
    }

    const links = await evaluate(`(() => {
      return [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')).filter(h => !h.startsWith('http') && !h.startsWith('tel:') && !h.startsWith('mailto:') && !h.startsWith('#'));
    })()`);
    const badLinks = links.filter(h => h.includes('.html'));
    grandTotalLinks += links.length;
    grandTotalHtmlLinks += badLinks.length;

    console.log(`[PASS] ${page.name.padEnd(18)} URL: ${actualPath.padEnd(20)} Links: ${links.length} (Bad: ${badLinks.length})`);
    if (badLinks.length > 0) {
      console.warn(`       Bad links found:`, badLinks);
      throw new Error(`FAILURE: ${page.name} contains internal links with .html: ${badLinks.join(', ')}`);
    }
  }

  console.log(`\nAudit summary: Checked ${allPages.length} pages, ${grandTotalLinks} total internal links, ${grandTotalHtmlLinks} with .html.`);
  console.log("ALL 10 PAGES HAVE 100% CLEAN PRODUCTION URLS AND ZERO .html LINKS!");
  await call("Browser.close");
  ws.close();
}

run().catch(err => {
  console.error("QA error:", err);
  process.exitCode = 1;
}).finally(async () => {
  chrome.kill();
  await wait(200);
  try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch (_) {}
  process.exit(process.exitCode || 0);
});
