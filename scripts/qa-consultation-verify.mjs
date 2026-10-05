import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const chromePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const profileDir = path.join(os.tmpdir(), `wargasiaga-qa-${Date.now()}`);
const artifactsDir = "C:\\Users\\ZenBook\\.gemini\\antigravity-ide\\brain\\a0ae6a16-f9e0-441a-b39a-4b62b02eb3f6";
const appUrl = "http://127.0.0.1:62929";

fs.mkdirSync(profileDir, { recursive: true });

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
        const pages = await fetch(`http://127.0.0.1:${debugPort}/json/list`).then((res) => res.json());
        const page = pages.find((target) => target.type === "page");
        if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
      }
    } catch (_) {}
    await wait(100);
  }
  throw new Error("Chrome DevTools endpoint did not become ready.");
}

async function run() {
  console.log("Connecting to Chrome DevTools...");
  const wsUrl = await getDebuggerUrl();
  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => { ws.addEventListener("open", resolve); ws.addEventListener("error", reject); });

  let id = 0;
  const pending = new Map();
  const runtimeErrors = [];

  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      message.error ? reject(new Error(message.error.message)) : resolve(message.result);
    }
    if (message.method === "Runtime.exceptionThrown") {
      const desc = message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text;
      console.error("Browser Runtime Exception:", desc);
      runtimeErrors.push(desc);
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

  async function capture(filename) {
    const screenshot = await call("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
    const filePath = path.join(artifactsDir, filename);
    fs.writeFileSync(filePath, Buffer.from(screenshot.data, "base64"));
    console.log(`Saved screenshot: ${filePath}`);
    return filePath;
  }

  try {
    await call("Page.enable");
    await call("Runtime.enable");

    // 1. Test Desktop / Laptop layout (1280x800)
    console.log("\n[Test 1] Testing layout at 1280x800...");
    await call("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
    await call("Page.navigate", { url: `${appUrl}/konsultasi.html` });
    await wait(800);

    const layoutCheck = await evaluate(`(() => {
      const submit = document.getElementById("consult-submit");
      const rect = submit.getBoundingClientRect();
      const inputCol = document.querySelector(".consult-input-col");
      const readyCard = document.querySelector(".consult-ready-card");
      return {
        submitVisible: rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.bottom <= window.innerHeight,
        submitTop: Math.round(rect.top),
        submitBottom: Math.round(rect.bottom),
        windowHeight: window.innerHeight,
        inputColOverflow: window.getComputedStyle(inputCol).overflowY,
        readyCardVisible: readyCard ? !readyCard.classList.contains("hidden") : false
      };
    })()`);
    console.log("Layout check 1280x800:", layoutCheck);
    await capture("qa_konsultasi_ready_desktop.png");

    // 2. Submit initial consultation
    console.log("\n[Test 2] Submitting consultation scenario...");
    await evaluate(`(() => {
      const input = document.getElementById("consult-input");
      const exposureNone = document.querySelector('input[name="exposure"][value="none"]');
      const consent = document.getElementById("consult-consent");
      const form = document.getElementById("consult-form");
      
      input.value = "Saya menerima tawaran kerja paruh waktu via WhatsApp, diminta transfer deposit 100 ribu untuk buka tugas komisi. Apakah aman?";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      exposureNone.checked = true;
      exposureNone.dispatchEvent(new Event("change", { bubbles: true }));
      consent.checked = true;
      form.requestSubmit();
    })()`);

    // Wait for AI / rules result
    let resultRendered = false;
    for (let i = 0; i < 30; i++) {
      await wait(500);
      resultRendered = await evaluate(`!document.getElementById("consult-result").classList.contains("hidden") && document.querySelectorAll(".chat-bubble").length > 0`);
      if (resultRendered) break;
    }
    console.log("Result rendered:", resultRendered);

    const assessmentState = await evaluate(`(() => {
      const res = document.getElementById("consult-result");
      const headline = res.querySelector(".assessment-head h2")?.textContent || "";
      const persona = res.querySelector(".persona-pill strong")?.textContent || "";
      const gauge = res.querySelector(".gauge-badge")?.textContent || "";
      const bubbles = [...document.querySelectorAll(".chat-bubble")].map(b => ({
        role: b.classList.contains("user") ? "user" : "assistant",
        text: b.querySelector("div")?.textContent?.slice(0, 100)
      }));
      return { headline, persona, gauge, bubblesCount: bubbles.length, bubbles };
    })()`);
    console.log("Assessment state:", assessmentState);
    await capture("qa_konsultasi_result_rendered.png");

    // 3. Test Helpdesk Follow-up Chat with "hi"
    console.log("\n[Test 3] Testing Helpdesk chat with 'hi'...");
    await evaluate(`(() => {
      const followupInput = document.getElementById("helpdesk-followup-input");
      const followupForm = document.getElementById("helpdesk-followup-form");
      followupInput.value = "hi";
      followupForm.requestSubmit();
    })()`);

    // Wait for response
    let hiAnswered = false;
    for (let i = 0; i < 20; i++) {
      await wait(500);
      hiAnswered = await evaluate(`(() => {
        const bubbles = document.querySelectorAll("#dialogue-messages .chat-bubble.assistant");
        if (bubbles.length < 2) return false;
        const last = bubbles[bubbles.length - 1].textContent;
        return !last.includes("Menganalisis");
      })()`);
      if (hiAnswered) break;
    }

    const hiResponse = await evaluate(`(() => {
      const bubbles = document.querySelectorAll("#dialogue-messages .chat-bubble");
      const lastBubble = bubbles[bubbles.length - 1];
      return {
        totalBubbles: bubbles.length,
        text: lastBubble?.querySelector("div")?.textContent || lastBubble?.textContent
      };
    })()`);
    console.log("Helpdesk response to 'hi':", hiResponse);
    await evaluate(`document.getElementById("consult-helpdesk-session")?.scrollIntoView({ behavior: "instant", block: "start" });`);
    await wait(200);
    await capture("qa_konsultasi_hi_response.png");

    // 4. Test Helpdesk Follow-up Chat with Domain Query
    console.log("\n[Test 4] Testing Helpdesk chat with 'bagaimana cara cek nomor rekening penipu?'...");
    await evaluate(`(() => {
      const followupInput = document.getElementById("helpdesk-followup-input");
      const followupForm = document.getElementById("helpdesk-followup-form");
      followupInput.value = "bagaimana cara cek rekening penipu?";
      followupForm.requestSubmit();
    })()`);

    let bankAnswered = false;
    for (let i = 0; i < 20; i++) {
      await wait(500);
      bankAnswered = await evaluate(`(() => {
        const bubbles = document.querySelectorAll("#dialogue-messages .chat-bubble.assistant");
        if (bubbles.length < 3) return false;
        const last = bubbles[bubbles.length - 1].textContent;
        return !last.includes("Menganalisis");
      })()`);
      if (bankAnswered) break;
    }

    const bankResponse = await evaluate(`(() => {
      const bubbles = document.querySelectorAll("#dialogue-messages .chat-bubble");
      const lastBubble = bubbles[bubbles.length - 1];
      return {
        totalBubbles: bubbles.length,
        text: lastBubble?.querySelector("div")?.textContent || lastBubble?.textContent
      };
    })()`);
    console.log("Helpdesk response to bank query:", bankResponse);
    await evaluate(`document.getElementById("consult-helpdesk-session")?.scrollIntoView({ behavior: "instant", block: "start" });`);
    await wait(200);
    await capture("qa_konsultasi_bank_response.png");

    // 5. Test Click "Buat Laporan Warga"
    console.log("\n[Test 5] Testing 'Buat Laporan Warga' button click...");
    const prefillBefore = await evaluate(`sessionStorage.getItem("ws-report-prefill")`);
    console.log("SessionStorage prefill before click:", prefillBefore);

    await evaluate(`(() => {
      const btn = document.getElementById("btn-escalate-report");
      if (!btn) throw new Error("Button #btn-escalate-report not found!");
      btn.click();
    })()`);

    await wait(600);
    const postClickState = await evaluate(`(() => ({
      currentUrl: location.href,
      prefill: sessionStorage.getItem("ws-report-prefill"),
      hasStoryInput: !!document.getElementById("report-story"),
      storyVal: document.getElementById("report-story")?.value || ""
    }))()`);
    console.log("Post click escalation state:", postClickState);
    await capture("qa_escalation_laporan_page.png");

    console.log("\nRuntime errors recorded during run:", runtimeErrors);
    if (runtimeErrors.length > 0) {
      console.error("FAIL: Runtime errors were detected!");
      process.exit(1);
    } else {
      console.log("SUCCESS: All QA tests passed with 0 runtime errors!");
    }

  } finally {
    try { ws.close(); } catch (_) {}
    try { chrome.kill(); } catch (_) {}
    await wait(400);
    try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch (_) {}
  }
}

run().catch((err) => {
  console.error("QA script failed:", err);
  try { chrome.kill(); } catch (_) {}
  process.exit(1);
});
