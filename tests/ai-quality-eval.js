"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { binaryMetrics } = require("./quality-metrics.js");

async function run() {
  const { loadRuntimeConfig } = await import("../server/config.mjs");
  const { createConsultService, detectUrgentExposure } = await import("../server/consult-service.mjs");
  const config = loadRuntimeConfig();
  if (!config.configured) throw new Error("AI provider tidak dikonfigurasi. Periksa .env server tanpa menampilkan nilainya.");
  const cases = JSON.parse(fs.readFileSync(path.join(__dirname, "fixtures", "ai-quality-cases.json"), "utf8"));
  const consult = createConsultService({ config });
  const rows = [];
  const failures = [];
  let groundedExpected = 0;
  let groundedFound = 0;
  let safeContractPasses = 0;

  for (const item of cases) {
    try {
      const result = await consult({ text: item.text, exposure: "none", consent: true }, crypto.randomUUID());
      const predicted = result.assessment === "warning_signs";
      rows.push({ id: item.id, actual: item.label === "scam", predicted, mode: result.mode });
      if (item.expectedCard) {
        groundedExpected += 1;
        if (result.relatedCards.some((card) => card.id === item.expectedCard)) groundedFound += 1;
      }
      if (result.uncertainties.length && result.nextActions.length && !/100\s*%\s*aman|pasti aman/i.test(JSON.stringify(result))) safeContractPasses += 1;
      if (result.mode !== "ai") failures.push(`${item.id}:fallback-${result.mode}`);
    } catch (error) {
      rows.push({ id: item.id, actual: item.label === "scam", predicted: false, mode: "error" });
      failures.push(`${item.id}:${error.code || error.message}`);
    }
  }

  const urgentCases = [
    ["Uang sudah saya transfer", true],
    ["OTP tadi saya kasih kepada penelepon", true],
    ["Saya terlanjur memasang APK kiriman itu", true],
    ["Dana telah terkirim ke rekening tersebut", true],
    ["Hasil baru cair setelah membayar deposit aktivasi", false],
    ["Saya hanya menerima pesan, belum melakukan apa pun", false],
    ["Mereka meminta transfer tetapi saya menolak", false],
    ["Artikel ini membahas contoh OTP yang tidak boleh dibagikan", false],
    ["Saya memeriksa aplikasi resmi tanpa memberikan data", false]
  ].map(([text, actual]) => ({ actual, predicted: detectUrgentExposure(text, "none") }));

  const consultationMetrics = binaryMetrics(rows);
  const urgentMetrics = binaryMetrics(urgentCases);
  const groundedCardRecall = Number((groundedFound / groundedExpected).toFixed(3));
  const safeContractRate = Number((safeContractPasses / cases.length).toFixed(3));
  const validatedAiResponses = rows.filter((row) => row.mode === "ai").length;
  const report = {
    evaluatedAt: new Date().toISOString(),
    providerModelWasLogged: false,
    secretValuesWereLogged: false,
    consultationClassification: consultationMetrics,
    groundedCardRecall,
    groundedCardSupport: groundedExpected,
    safeContractRate,
    deterministicUrgentDetection: urgentMetrics,
    validatedAiResponses,
    totalCases: cases.length,
    failures
  };
  console.log(JSON.stringify(report, null, 2));
  if (consultationMetrics.f1 < 0.85 || consultationMetrics.specificity < 0.8 || groundedCardRecall < 0.8 || safeContractRate < 0.95 || urgentMetrics.f1 < 0.9 || validatedAiResponses / cases.length < 0.9) {
    throw new Error("AI quality gate gagal; lihat metrik di atas.");
  }
}

run().catch((error) => { console.error(error.message); process.exit(1); });
