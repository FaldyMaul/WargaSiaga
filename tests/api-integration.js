const http = require("node:http");
const assert = require("node:assert/strict");

const silentLogger = { info() {}, warn() {} };

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve(server.address().port));
  });
}

function close(server) {
  server.closeAllConnections?.();
  return new Promise((resolve) => server.close(resolve));
}

async function post(url, payload, headers = {}) {
  return fetch(url, { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: typeof payload === "string" ? payload : JSON.stringify(payload) });
}

async function run() {
  const { loadRuntimeConfig } = await import("../server/config.mjs");
  const { createWargaSiagaServer } = await import("../server/index.mjs");
  const defaults = loadRuntimeConfig({ skipEnv: true });
  assert.equal(defaults.port, 4173);
  assert.equal(defaults.timeoutMs, 15000);
  assert.equal(defaults.rateLimitMax, 8);
  assert.equal(defaults.rateLimitWindowMs, 60000);
  let providerMode = "valid";
  let providerCalls = 0;
  let capturedRequest = null;

  const provider = http.createServer(async (request, response) => {
    providerCalls += 1;
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    capturedRequest = { url: request.url, authorization: request.headers.authorization, body: JSON.parse(Buffer.concat(chunks).toString("utf8")) };
    if (providerMode === "format400" && capturedRequest.body.response_format) {
      response.writeHead(400, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: { code: "unsupported_response_format" } }));
      return;
    }
    if (providerMode === "timeout") {
      setTimeout(() => { if (!response.destroyed) { response.writeHead(200, { "Content-Type": "application/json" }); response.end(JSON.stringify({ choices: [] })); } }, 500);
      return;
    }
    if (providerMode === "failure") {
      response.writeHead(503, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: "unavailable" }));
      return;
    }
    const content = providerMode === "malformed" ? "not-json" : JSON.stringify({
      assessment: "warning_signs",
      summary: "Ada permintaan deposit sebelum pekerjaan dimulai sehingga tawaran perlu dicurigai.",
      observedClues: ["Diminta membayar deposit sebelum mulai bekerja."],
      uncertainties: ["Identitas perekrut dan perusahaan belum terverifikasi."],
      nextActions: ["Jangan membayar dan periksa halaman karier perusahaan secara mandiri."],
      relatedCardIds: ["job-deposit", "id-palsu-dari-model"],
      officialLinkIds: ["cekrekening", "https://evil.example"]
    });
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ choices: [{ message: { content } }] }));
  });
  const providerPort = await listen(provider);

  const config = loadRuntimeConfig({
    skipEnv: true,
    apiKey: "mock-secret-that-must-not-leak",
    baseUrl: `http://127.0.0.1:${providerPort}/v1`,
    model: "mock-model",
    configured: true,
    allowInsecureProvider: true,
    timeoutMs: 120,
    rateLimitMax: 50,
    rateLimitWindowMs: 60000,
    port: 0
  });
  const app = await createWargaSiagaServer({ mode: "test", config, serveFrontend: false, logger: silentLogger });
  const address = await app.listen(0, "127.0.0.1");
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    const healthResponse = await fetch(`${baseUrl}/api/health`);
    const healthText = await healthResponse.text();
    assert.equal(healthResponse.status, 200);
    assert.match(healthResponse.headers.get("x-content-type-options"), /nosniff/);
    assert.ok(!healthText.includes("mock-secret"));
    assert.ok(!healthText.includes("mock-model"));
    assert.equal(JSON.parse(healthText).aiAvailable, true);

    const noConsent = await post(`${baseUrl}/api/consult`, { text: "Saya diminta deposit untuk pekerjaan", exposure: "none", consent: false });
    assert.equal(noConsent.status, 400);
    assert.equal((await noConsent.json()).error.code, "consent_required");

    const rawText = "Hubungi 081234567890 atau saya@email.test, OTP 4321, lalu buka https://evil.example dan bayar deposit.";
    const aiResponse = await post(`${baseUrl}/api/consult`, { text: rawText, exposure: "none", consent: true });
    const aiResult = await aiResponse.json();
    assert.equal(aiResponse.status, 200);
    assert.equal(aiResult.mode, "ai");
    assert.equal(aiResult.relatedCards.length, 1);
    assert.equal(aiResult.relatedCards[0].id, "job-deposit");
    assert.equal(aiResult.featureRecommendations[0].feature, "guide");
    assert.equal(aiResult.featureRecommendations[0].cardId, "job-deposit");
    assert.ok(aiResult.featureRecommendations.some((item) => item.feature === "community-patterns"));
    assert.equal(aiResult.officialLinks.length, 1);
    assert.equal(aiResult.officialLinks[0].url, "https://cekrekening.id/");
    assert.equal(aiResult.redaction.applied, true);
    assert.equal(capturedRequest.authorization, "Bearer mock-secret-that-must-not-leak");
    assert.equal(capturedRequest.url, "/v1/chat/completions");
    const providerBody = JSON.stringify(capturedRequest.body);
    assert.ok(!providerBody.includes("081234567890"));
    assert.ok(!providerBody.includes("saya@email.test"));
    assert.ok(!providerBody.includes("4321"));
    assert.ok(!providerBody.includes("https://evil.example"));
    assert.ok(providerBody.includes("[NOMOR DISAMARKAN]"));
    assert.ok(providerBody.includes("[RAHASIA DISAMARKAN]"));
    assert.ok(providerBody.includes("job-deposit"));

    providerMode = "format400";
    const callsBeforeCompatibility = providerCalls;
    const compatibilityResult = await (await post(`${baseUrl}/api/consult`, { text: "Lowongan meminta deposit", exposure: "none", consent: true })).json();
    assert.equal(compatibilityResult.mode, "ai");
    assert.equal(providerCalls, callsBeforeCompatibility + 2);
    assert.equal(Object.hasOwn(capturedRequest.body, "response_format"), false);
    providerMode = "valid";

    const callsBeforeUrl = providerCalls;
    const urlResponse = await post(`${baseUrl}/api/consult`, { text: "", url: "http://user@xn--pple-43d.example:8080/login?token=private-value", exposure: "none", consent: true });
    const urlResult = await urlResponse.json();
    assert.equal(urlResponse.status, 200);
    assert.equal(urlResult.mode, "ai");
    assert.ok(urlResult.urlAnalysis.signals.some((signal) => signal.code === "embedded_credentials"));
    assert.ok(urlResult.urlAnalysis.signals.some((signal) => signal.code === "punycode"));
    assert.ok(urlResult.urlAnalysis.signals.some((signal) => signal.code === "unusual_port"));
    assert.equal(urlResult.urlAnalysis.fetched, false);
    assert.ok(!JSON.stringify(capturedRequest.body).includes("private-value"));
    assert.equal(providerCalls, callsBeforeUrl + 1);

    const impersonation = await post(`${baseUrl}/api/consult`, { text: "", url: "https://facebook-login.pages.dev/account", exposure: "none", consent: true });
    const impersonationResult = await impersonation.json();
    assert.ok(impersonationResult.urlAnalysis.signals.some((signal) => signal.code === "brand_domain_mismatch"));
    assert.ok(impersonationResult.urlAnalysis.signals.some((signal) => signal.code === "user_hosted_sensitive_page"));
    const officialBrand = await post(`${baseUrl}/api/consult`, { text: "", url: "https://www.facebook.com/help", exposure: "none", consent: true });
    const officialBrandResult = await officialBrand.json();
    assert.ok(!officialBrandResult.urlAnalysis.signals.some((signal) => signal.code === "brand_domain_mismatch"));
    const shortened = await post(`${baseUrl}/api/consult`, { text: "", url: "https://bit.ly/contoh", exposure: "none", consent: true });
    const shortenedResult = await shortened.json();
    assert.ok(shortenedResult.urlAnalysis.signals.some((signal) => signal.code === "shortened_url"));

    const invalidUrl = await post(`${baseUrl}/api/consult`, { text: "", url: "file:///etc/passwd", exposure: "none", consent: true });
    assert.equal(invalidUrl.status, 400);
    assert.equal((await invalidUrl.json()).error.code, "invalid_url_scheme");

    const callsBeforeUrgent = providerCalls;
    const urgentResponse = await post(`${baseUrl}/api/consult`, { text: "Uang sudah saya transfer", exposure: "money", consent: false });
    const urgentResult = await urgentResponse.json();
    assert.equal(urgentResponse.status, 200);
    assert.equal(urgentResult.mode, "urgent");
    assert.equal(urgentResult.featureRecommendations[0].feature, "urgent-help");
    assert.equal(providerCalls, callsBeforeUrgent);
    assert.equal(urgentResult.officialLinks[0].url, "https://iasc.ojk.go.id/");

    providerMode = "malformed";
    const malformedResult = await (await post(`${baseUrl}/api/consult`, { text: "Diminta deposit pekerjaan", exposure: "none", consent: true })).json();
    assert.equal(malformedResult.mode, "rules");
    assert.match(malformedResult.notice, /AI sedang tidak tersedia/);

    providerMode = "failure";
    const failureResult = await (await post(`${baseUrl}/api/consult`, { text: "Diminta membuka tautan", exposure: "none", consent: true })).json();
    assert.equal(failureResult.mode, "rules");

    providerMode = "timeout";
    const timeoutStarted = Date.now();
    const timeoutResult = await (await post(`${baseUrl}/api/consult`, { text: "Diminta membayar sekarang", exposure: "none", consent: true })).json();
    assert.equal(timeoutResult.mode, "rules");
    assert.ok(Date.now() - timeoutStarted < 450);

    const invalidJson = await post(`${baseUrl}/api/consult`, "{invalid");
    assert.equal(invalidJson.status, 400);
    assert.equal((await invalidJson.json()).error.code, "invalid_json");

    const wrongType = await fetch(`${baseUrl}/api/consult`, { method: "POST", headers: { "Content-Type": "text/plain" }, body: "hello" });
    assert.equal(wrongType.status, 415);

    const tooLong = await post(`${baseUrl}/api/consult`, { text: "x".repeat(1501), exposure: "none", consent: true });
    assert.equal(tooLong.status, 413);

    const method = await fetch(`${baseUrl}/api/consult`);
    assert.equal(method.status, 405);

    const limitedConfig = loadRuntimeConfig({ skipEnv: true, apiDisabled: true, configured: false, rateLimitMax: 2, rateLimitWindowMs: 60000, port: 0 });
    const limitedApp = await createWargaSiagaServer({ mode: "test", config: limitedConfig, serveFrontend: false, logger: silentLogger });
    const limitedAddress = await limitedApp.listen(0, "127.0.0.1");
    const limitedUrl = `http://127.0.0.1:${limitedAddress.port}/api/consult`;
    try {
      assert.equal((await post(limitedUrl, { text: "contoh satu", exposure: "none", consent: false })).status, 200);
      assert.equal((await post(limitedUrl, { text: "contoh dua", exposure: "none", consent: false })).status, 200);
      const limited = await post(limitedUrl, { text: "contoh tiga", exposure: "none", consent: false });
      assert.equal(limited.status, 429);
      assert.ok(Number(limited.headers.get("retry-after")) >= 1);
    } finally {
      await limitedApp.close();
    }

    console.log("API integration audit passed: secrets, redaction, grounded URL inspection without fetching, allowlists, urgent bypass, timeout, fallback, validation, and rate limiting.");
  } finally {
    await app.close();
    await close(provider);
  }
}

run().catch((error) => { console.error(error.stack || error.message); process.exit(1); });
