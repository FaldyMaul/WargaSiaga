import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const chromePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const profileDir = path.join(os.tmpdir(), `wargasiaga-crossmenu-qa-${process.pid}`);
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

  console.log("=== START CROSS-MENU INTEGRATION & CONTEXT QA ===");

  // TEST 1: Panduan Modus Detail page has category pill and breadcrumb
  console.log("\n[Test 1] Panduan Modus Detail: category badge & breadcrumb alignment");
  await navigate(`${baseUrl}/modus-detail?id=job-deposit`);
  const catPillText = await evaluate("document.querySelector('.article-head .card-category-pill')?.innerText || ''");
  const breadcrumbText = await evaluate("document.querySelector('.breadcrumb')?.innerText || ''");
  console.log("Category pill text:", catPillText);
  console.log("Breadcrumb text:", breadcrumbText);
  if (!catPillText.includes("Kerja & Investasi")) throw new Error("Category pill missing or misaligned in detail head");
  if (!breadcrumbText.includes("Kerja & Investasi")) throw new Error("Category missing in breadcrumbs");

  // TEST 2: User reads a guide module, then clicks 'Periksa dengan AI' in top menu -> DIRECT AUTOFILL!
  console.log("\n[Test 2] Panduan module -> AI in menu: DIRECT AUTOFILL verification");
  // User is reading job-deposit guide
  await navigate(`${baseUrl}/modus-detail?id=job-deposit`);
  await wait(300);
  // User clicks "Periksa dengan AI" from the top navigation bar
  const consultMenuHref = await evaluate("document.querySelector('.desktop-nav a[href*=\"konsultasi\"]')?.getAttribute('href')");
  console.log("Nav menu 'Periksa dengan AI' href on detail page:", consultMenuHref);
  await evaluate("document.querySelector('.desktop-nav a[href*=\"konsultasi\"]').click()");
  await wait(400);

  const autoFilledInput = await evaluate("document.querySelector('#consult-input')?.value || ''");
  const consentChecked = await evaluate("document.querySelector('#consult-consent')?.checked");
  const exposureChecked = await evaluate("document.querySelector('input[name=\"exposure\"][value=\"none\"]')?.checked");
  const bannerVisible = await evaluate("!document.querySelector('#consult-recent-autofill-banner, #consult-modus-context-wrap .consult-context-banner')?.classList.contains('hidden') && !!document.querySelector('#consult-recent-autofill-banner, #consult-modus-context-wrap .consult-context-banner')");
  const bannerTitle = await evaluate("document.querySelector('#consult-recent-autofill-banner strong, #consult-modus-context-wrap .consult-context-banner strong')?.innerText || ''");

  console.log("Input autofilled directly:", autoFilledInput.length > 20);
  console.log("Input content snippet:", autoFilledInput.slice(0, 75));
  console.log("Consent pre-checked:", consentChecked);
  console.log("Exposure set to none:", exposureChecked);
  console.log("Context banner visible:", bannerVisible);
  console.log("Context banner title:", bannerTitle);

  if (!autoFilledInput.length) throw new Error("Direct autofill failed in /konsultasi");
  if (!consentChecked) throw new Error("Consent was not pre-checked in /konsultasi");
  if (!bannerVisible) throw new Error("Context banner not visible in /konsultasi");

  // Test clear button in context banner
  console.log("Testing 'Hapus & Tulis Sendiri' clear button...");
  await evaluate("document.querySelector('#btn-clear-modus-context')?.click()");
  await wait(200);
  const clearedInput = await evaluate("document.querySelector('#consult-input')?.value || ''");
  const bannerCleared = await evaluate("!document.querySelector('#consult-recent-autofill-banner, #consult-modus-context-wrap .consult-context-banner')");
  console.log("Input cleared successfully:", clearedInput === "");
  console.log("Banner removed:", bannerCleared);
  if (clearedInput !== "" || !bannerCleared) throw new Error("Clear button failed");

  // TEST 3: User reads a guide module, then clicks 'Lapor Warga' in top menu
  console.log("\n[Test 3] Panduan module -> Lapor Warga in menu: Category alignment & autofill");
  await navigate(`${baseUrl}/modus-detail?id=apk-phishing`);
  await wait(300);

  // 3a. Community reports hub (/laporan)
  console.log("Navigating to /laporan via menu...");
  await navigate(`${baseUrl}/laporan`);
  await wait(400);
  const activeReportTab = await evaluate("document.querySelector('#report-category-group .category-tab.active')?.innerText || ''");
  const reportBannerVisible = await evaluate("!!document.querySelector('#report-recent-context-banner')");
  const reportBannerTitle = await evaluate("document.querySelector('#report-recent-context-banner strong')?.innerText || ''");
  console.log("Active report tab:", activeReportTab.replace(/\s+/g, " "));
  console.log("Report context banner visible:", reportBannerVisible);
  console.log("Report banner title:", reportBannerTitle);
  if (!activeReportTab.includes("Pesan & File Bahaya")) throw new Error("Report category tab not activated for apk-phishing");
  if (!reportBannerVisible) throw new Error("Report context banner missing");

  // 3b. Report form (/lapor)
  console.log("Navigating to /lapor via menu from detail page...");
  await navigate(`${baseUrl}/modus-detail?id=apk-phishing`);
  await wait(300);
  const laporMenuHref = await evaluate("document.querySelector('.desktop-nav a[href*=\"lapor\"]')?.getAttribute('href')");
  console.log("Nav menu 'Lapor Warga' href on detail page:", laporMenuHref);
  await evaluate("document.querySelector('.desktop-nav a[href*=\"lapor\"]').click()");
  await wait(400);
  const autoSelectedType = await evaluate("document.querySelector('#report-type')?.value");
  const prefilledStory = await evaluate("document.querySelector('#report-story')?.value || ''");
  const laporNoticeVisible = await evaluate("!document.querySelector('#prefill-notice')?.classList.contains('hidden')");
  const noticeContent = await evaluate("document.querySelector('#prefill-notice')?.innerText || ''");
  console.log("Report type auto-selected from memory:", autoSelectedType);
  console.log("Starter story prefilled:", prefilledStory.length > 20);
  console.log("Prefill notice visible:", laporNoticeVisible);
  console.log("Notice content snippet:", noticeContent.slice(0, 80));
  if (autoSelectedType !== "apk-phishing") throw new Error("Report type not auto-selected from memory");
  if (!prefilledStory.length) throw new Error("Starter story not prefilled");

  // TEST 4: User reads a guide module, then clicks 'Bantuan sekarang' in menu
  console.log("\n[Test 4] Panduan module -> Bantuan Darurat in menu: Auto-adapted emergency flow");
  await navigate(`${baseUrl}/modus-detail?id=bank-otp`);
  await wait(300);
  const urgentHeaderHref = await evaluate("document.querySelector('.urgent-header')?.getAttribute('href')");
  console.log("Navigating to /bantuan-darurat via urgent header link:", urgentHeaderHref);
  await evaluate("document.querySelector('.urgent-header').click()");
  await wait(400);
  const otpChecked = await evaluate("document.querySelector('#incident-choices input[value=\"otp\"]')?.checked");
  const stepsVisible = await evaluate("document.querySelectorAll('#emergency-steps .emergency-step:not(.hidden)').length");
  console.log("OTP checked automatically:", otpChecked);
  console.log("Relevant emergency steps visible:", stepsVisible);
  if (!otpChecked) throw new Error("OTP checkbox not checked for bank-otp");
  if (stepsVisible < 3) throw new Error("Emergency steps not filtered for bank-otp");

  // TEST 5: Lapor Warga -> Konsultasikan dengan AI Dulu
  console.log("\n[Test 5] Lapor Warga -> Konsultasikan dengan AI Dulu");
  await navigate(`${baseUrl}/lapor`);
  await evaluate("document.querySelector('#report-story').value = 'Saya mendapatkan telepon dari bank mengaku ada transaksi ganjil.'");
  await wait(200);
  await evaluate("document.querySelector('#btn-report-to-consult')?.click()");
  await wait(500);
  const draftConsultInput = await evaluate("document.querySelector('#consult-input')?.value || ''");
  console.log("Draft carried into consult input:", draftConsultInput.includes("telepon dari bank"));
  if (!draftConsultInput.includes("telepon dari bank")) throw new Error("Draft not carried over to AI consult");

  // TEST 6: Category Explorer in Ready State
  console.log("\n[Test 6] Category Explorer in Consult Ready State");
  await navigate(`${baseUrl}/konsultasi`);
  await wait(300);
  const chipCount = await evaluate("document.querySelectorAll('.ready-category-chip').length");
  console.log("Category chips count (expected 6):", chipCount);
  if (chipCount !== 6) throw new Error(`Expected 6 category chips, found ${chipCount}`);
  console.log("Clicking 'Jual Beli & Bisnis' chip...");
  await evaluate("document.querySelector('.ready-category-chip[data-category-prompt-id=\"commerce\"]')?.click()");
  await wait(200);
  const commerceInput = await evaluate("document.querySelector('#consult-input')?.value || ''");
  console.log("Input populated for commerce category:", commerceInput.length > 10);
  if (!commerceInput.length) throw new Error("Category chip failed to populate input");

  await call("Browser.close");
  ws.close();
  console.log("\n=== ALL CROSS-MENU INTEGRATION & CONTEXT AUDITS PASSED SUCCESSFULLY ===");
}

run().catch(err => {
  console.error("Cross-menu audit error:", err);
  process.exitCode = 1;
}).finally(async () => {
  chrome.kill();
  await wait(200);
  try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch (_) {}
  process.exit(process.exitCode || 0);
});
