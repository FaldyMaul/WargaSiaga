import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const chromePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const profileDir = path.join(os.tmpdir(), `wargasiaga-qa-btn-${process.pid}`);
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
    await wait(250);
  }

  await call("Page.enable");
  await call("Runtime.enable");
  await call("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });

  console.log("Navigating to /konsultasi...");
  await navigate(`${baseUrl}/konsultasi`);

  // Test 1: Quick prompt button
  console.log("Testing Quick Prompt button...");
  await evaluate(`(() => {
    const btn = document.querySelector('.quick-prompt');
    if (btn) btn.click();
    const radio = document.querySelector('input[name="exposure"][value="none"]');
    if (radio) radio.checked = true;
    const consent = document.querySelector('#consult-consent');
    if (consent) consent.checked = true;
  })()`);
  await wait(200);
  const inputVal = await evaluate("document.querySelector('#consult-input').value");
  console.log("Input value after quick prompt:", inputVal ? "Filled" : "EMPTY (FAIL)");

  // Test 2: Submit consultation
  console.log("Submitting consultation...");
  await evaluate(`(() => {
    document.querySelector('#consult-form').requestSubmit();
  })()`);
  // Check if result is rendered
  for (let i = 0; i < 40; i++) {
    const isFinished = await evaluate("!!document.querySelector('.assessment-head') && !document.querySelector('.ai-loading')");
    if (isFinished) break;
    await wait(500);
  }
  const resultVisible = await evaluate("!!document.querySelector('.assessment-head')");
  console.log("Consult assessment rendered:", resultVisible);

  // Test 3: Test Buat Laporan button (btn-escalate-report)
  console.log("Checking Buat Laporan button (#btn-escalate-report)...");
  const reportBtnExists = await evaluate("!!document.querySelector('#btn-escalate-report')");
  console.log("Button exists in DOM:", reportBtnExists);
  if (!reportBtnExists) {
    const htmlSnippet = await evaluate("document.querySelector('#consult-result')?.innerHTML?.slice(0, 500)");
    console.log("consult-result innerHTML preview:", htmlSnippet);
  }

  if (reportBtnExists) {
    console.log("Clicking #btn-escalate-report...");
    await evaluate("document.querySelector('#btn-escalate-report').click()");
    await wait(800);
    const newPath = await evaluate("location.pathname");
    console.log("Pathname after clicking #btn-escalate-report:", newPath);
    const isLaporPage = newPath.includes("lapor");
    console.log("Navigated to lapor page:", isLaporPage);
    const prefillNotice = await evaluate("!document.querySelector('#prefill-notice')?.classList.contains('hidden')");
    const prefilledStory = await evaluate("document.querySelector('#report-story')?.value || ''");
    console.log("Lapor page prefill notice visible:", prefillNotice);
    console.log("Lapor page prefilled story present:", prefilledStory.length > 0);
  }

  // Test 4: Homoglyph and lookalike detection with rnicrosoft.com
  console.log("\nTesting AI & URL inspection with rnicrosoft.com...");
  await navigate(`${baseUrl}/konsultasi`);
  await evaluate(`(() => {
    document.querySelector('#consult-input').value = 'Saya dapat pesan mencurigakan berisi link rnicrosoft.com minta verifikasi akun';
    document.querySelector('#consult-url').value = 'rnicrosoft.com';
    const radio = document.querySelector('input[name="exposure"][value="none"]');
    if (radio) radio.checked = true;
    const consent = document.querySelector('#consult-consent');
    if (consent) consent.checked = true;
    document.querySelector('#consult-form').requestSubmit();
  })()`);

  for (let i = 0; i < 40; i++) {
    const isFinished = await evaluate("!!document.querySelector('.assessment-head') && !document.querySelector('.ai-loading')");
    if (isFinished) break;
    await wait(500);
  }

  const rnicrosoftAnalysis = await evaluate(`(() => {
    const text = document.querySelector('#consult-result')?.innerText || '';
    const hasHomoglyphWarning = text.toLowerCase().includes('rn') || text.toLowerCase().includes('lookalike') || text.toLowerCase().includes('tiruan') || text.toLowerCase().includes('phishing');
    const hasCardLinks = Array.from(document.querySelectorAll('#consult-result a')).filter(a => a.href.includes('modus-detail')).map(a => a.href);
    return { hasHomoglyphWarning, hasCardLinks, snippet: text.slice(0, 300) };
  })()`);
  console.log("rnicrosoft homoglyph detection present:", rnicrosoftAnalysis.hasHomoglyphWarning);
  console.log("Guide card links present:", rnicrosoftAnalysis.hasCardLinks);

  // Test 5: Helpdesk chatbot interaction
  console.log("\nTesting Helpdesk Chatbot (Percakapan Bantuan)...");
  const chipAvailable = await evaluate("!!document.querySelector('.suggestion-chip')");
  console.log("Suggestion chip available:", chipAvailable);
  if (chipAvailable) {
    const chipText = await evaluate("document.querySelector('.suggestion-chip').textContent.trim()");
    console.log("Clicking suggestion chip:", chipText);
    await evaluate("document.querySelector('.suggestion-chip').click()");
    for (let i = 0; i < 30; i++) {
      const messagesCount = await evaluate("document.querySelectorAll('#dialogue-messages .chat-bubble').length");
      const isLoading = await evaluate("!!document.querySelector('#dialogue-messages .loading-spinner')");
      if (messagesCount >= 2 && !isLoading) break;
      await wait(500);
    }
    const finalMessages = await evaluate(`Array.from(document.querySelectorAll('#dialogue-messages .chat-bubble')).map(m => ({
      sender: m.classList.contains('user') ? 'user' : 'assistant',
      text: m.querySelector('div')?.textContent?.slice(0, 100)
    }))`);
    console.log("Dialogue messages after chip:", finalMessages);
  }

  // Test 6: Selesai dan Periksa Baru button
  console.log("\nTesting Selesai dan Periksa Baru (#helpdesk-reset-btn)...");
  const resetBtnExists = await evaluate("!!document.querySelector('#helpdesk-reset-btn')");
  console.log("Reset button exists:", resetBtnExists);
  if (resetBtnExists) {
    await evaluate("document.querySelector('#helpdesk-reset-btn').click()");
    await wait(400);
    const resultHiddenAfterReset = await evaluate("document.querySelector('#consult-result').classList.contains('hidden')");
    const inputEmpty = await evaluate("document.querySelector('#consult-input').value === ''");
    console.log("Consult result hidden after reset:", resultHiddenAfterReset);
    console.log("Input reset to empty:", inputEmpty);
  }

  // Test 7: Urgent escalation button (#btn-escalate-urgent)
  console.log("\nTesting Urgent Escalation button (#btn-escalate-urgent)...");
  await evaluate(`(() => {
    document.querySelector('#consult-input').value = 'Saya baru saja transfer uang 5 juta ke rekening penipu dan kirim OTP BRI';
    const radio = document.querySelector('input[name="exposure"][value="money"]');
    if (radio) radio.checked = true;
    const consent = document.querySelector('#consult-consent');
    if (consent) consent.checked = true;
    document.querySelector('#consult-form').requestSubmit();
  })()`);

  for (let i = 0; i < 40; i++) {
    const isFinished = await evaluate("!!document.querySelector('.assessment-head') && !document.querySelector('.ai-loading')");
    if (isFinished) break;
    await wait(500);
  }

  const urgentBtnExists = await evaluate("!!document.querySelector('#btn-escalate-urgent')");
  console.log("Urgent button exists:", urgentBtnExists);
  if (urgentBtnExists) {
    console.log("Clicking #btn-escalate-urgent...");
    await evaluate("document.querySelector('#btn-escalate-urgent').click()");
    await wait(800);
    const urgentPath = await evaluate("location.pathname");
    console.log("Pathname after urgent click:", urgentPath);
    const isUrgentPage = urgentPath.includes("bantuan-darurat");
    console.log("Navigated to bantuan-darurat page:", isUrgentPage);
  }

  await call("Browser.close");
  ws.close();
}

run().catch(err => {
  console.error("Button audit error:", err);
  process.exitCode = 1;
}).finally(async () => {
  chrome.kill();
  await wait(200);
  try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch (_) {}
  process.exit(process.exitCode || 0);
});
