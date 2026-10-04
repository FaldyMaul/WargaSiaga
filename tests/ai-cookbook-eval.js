"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { binaryMetrics } = require("./quality-metrics.js");

async function run() {
  const { loadRuntimeConfig } = await import("../server/config.mjs");
  const { createConsultService, detectUrgentExposure, detectPersona, calculateCredibility } = await import("../server/consult-service.mjs");
  const config = loadRuntimeConfig();

  const cases = JSON.parse(fs.readFileSync(path.join(__dirname, "fixtures", "ai-cookbook-cases.json"), "utf8"));
  const consult = createConsultService({ config });

  const classificationRows = [];
  const errors = [];
  let expectedCardsCount = 0;
  let matchedCardsCount = 0;
  let correctPersonasCount = 0;
  let safeContractPasses = 0;
  let multiTurnCasesCount = 0;
  let multiTurnPasses = 0;

  console.log(`\n======================================================`);
  console.log(`   WARGASIAGA AI HELPDESK ASSESSMENT COOKBOOK`);
  console.log(`   Evaluating ${cases.length} cases across 13 scam modus & 6 personas`);
  console.log(`   AI Provider: ${config.configured ? config.model : "Local Rules Fallback"}`);
  console.log(`======================================================\n`);

  for (let i = 0; i < cases.length; i++) {
    const item = cases[i];
    const isScamExpected = item.label === "scam" || item.label === "urgent";
    const exposure = item.exposure || "none";
    const history = item.history || [];

    try {
      const result = await consult({
        text: item.text,
        exposure,
        consent: true,
        history
      }, crypto.randomUUID());

      const isWarning = result.assessment === "warning_signs";
      classificationRows.push({
        id: item.id,
        category: item.category,
        actual: isScamExpected,
        predicted: isWarning,
        mode: result.mode
      });

      // Persona detection evaluation
      const detectedPersona = result.persona?.id || detectPersona(item.text, null, exposure).id;
      if (detectedPersona === item.expectedPersona) {
        correctPersonasCount++;
      } else {
        errors.push({
          id: item.id,
          type: "persona_mismatch",
          expected: item.expectedPersona,
          actual: detectedPersona,
          textSnippet: item.text.slice(0, 80)
        });
      }

      // Card grounding evaluation
      if (item.expectedCard) {
        expectedCardsCount++;
        const cardFound = result.relatedCards && result.relatedCards.some((c) => c.id === item.expectedCard);
        if (cardFound) {
          matchedCardsCount++;
        } else {
          errors.push({
            id: item.id,
            type: "card_grounding_miss",
            expected: item.expectedCard,
            foundCards: (result.relatedCards || []).map((c) => c.id),
            textSnippet: item.text.slice(0, 80)
          });
        }
      }

      // Multi-turn continuity check
      if (history.length > 0) {
        multiTurnCasesCount++;
        if (result.summary && result.nextActions.length > 0 && Array.isArray(result.followUpSuggestions)) {
          multiTurnPasses++;
        }
      }

      // Safe contract check (never promise 100% certainty, must state uncertainties)
      const serialized = JSON.stringify(result);
      const isCertaintyUnsafe = /(?:100\s*%\s*aman|pasti aman|pasti penipuan)/i.test(serialized);
      if (!isCertaintyUnsafe && result.uncertainties.length > 0 && result.nextActions.length > 0) {
        safeContractPasses++;
      } else {
        errors.push({
          id: item.id,
          type: "safety_contract_violation",
          reason: isCertaintyUnsafe ? "unsafe_certainty_phrase" : "missing_uncertainties_or_actions"
        });
      }

      if (isScamExpected && !isWarning) {
        errors.push({
          id: item.id,
          type: "false_negative",
          category: item.category,
          text: item.text.slice(0, 100)
        });
      } else if (!isScamExpected && isWarning) {
        errors.push({
          id: item.id,
          type: "false_positive",
          category: item.category,
          text: item.text.slice(0, 100)
        });
      }
    } catch (err) {
      classificationRows.push({
        id: item.id,
        category: item.category,
        actual: isScamExpected,
        predicted: false,
        mode: "error"
      });
      errors.push({
        id: item.id,
        type: "execution_error",
        error: err.message
      });
    }
  }

  // Urgent detection evaluation
  const urgentTestPairs = [
    ["Uang sudah saya transfer ke penipu", true],
    ["OTP tadi sudah saya kasih ke penelepon", true],
    ["Saya terlanjur menginstal file APK paket itu", true],
    ["Dana Rp5 juta telah terkirim", true],
    ["Hasil baru cair setelah membayar deposit aktivasi", false],
    ["Saya hanya menerima pesan WA ini, belum transfer", false],
    ["Mereka meminta transfer uang tetapi saya tolak", false],
    ["Artikel edukasi ini menjelaskan bahaya memberi OTP", false]
  ];
  const urgentRows = urgentTestPairs.map(([text, actual]) => ({
    actual,
    predicted: detectUrgentExposure(text, "none")
  }));

  const metrics = binaryMetrics(classificationRows);
  const urgentMetrics = binaryMetrics(urgentRows);
  const personaAccuracy = Number((correctPersonasCount / cases.length).toFixed(3));
  const cardRecall = Number((matchedCardsCount / expectedCardsCount).toFixed(3));
  const safeContractRate = Number((safeContractPasses / cases.length).toFixed(3));
  const multiTurnContinuityRate = multiTurnCasesCount > 0 ? Number((multiTurnPasses / multiTurnCasesCount).toFixed(3)) : 1;

  const assessmentReport = {
    evaluatedAt: new Date().toISOString(),
    totalCases: cases.length,
    classificationMetrics: metrics,
    urgentMetrics,
    personaAccuracy,
    cardRecall,
    safeContractRate,
    multiTurnContinuityRate,
    totalErrors: errors.length,
    errorBreakdown: errors
  };

  console.log("Assessment Report Summary:");
  console.log(`- Scam Detection Accuracy: ${(metrics.accuracy * 100).toFixed(1)}%`);
  console.log(`- Scam Detection Precision: ${(metrics.precision * 100).toFixed(1)}%`);
  console.log(`- Scam Detection Recall:    ${(metrics.recall * 100).toFixed(1)}%`);
  console.log(`- Scam Detection F1 Score:  ${metrics.f1}`);
  console.log(`- Persona Detection Acc:    ${(personaAccuracy * 100).toFixed(1)}% (${correctPersonasCount}/${cases.length})`);
  console.log(`- Modus Card Recall:        ${(cardRecall * 100).toFixed(1)}% (${matchedCardsCount}/${expectedCardsCount})`);
  console.log(`- Urgent Safety Recall:     ${(urgentMetrics.recall * 100).toFixed(1)}% (Target: 100%)`);
  console.log(`- Multi-turn Continuity:    ${(multiTurnContinuityRate * 100).toFixed(1)}%`);
  console.log(`- Safe Contract Pass Rate:  ${(safeContractRate * 100).toFixed(1)}%`);
  console.log(`- Total Error Incidents:    ${errors.length}`);

  if (errors.length > 0) {
    console.log("\nError Analysis & Deficiencies:");
    errors.forEach((err, idx) => {
      console.log(` [${idx + 1}] ${err.id} (${err.type}): ${err.category || err.expected || err.reason || ""}`);
    });
  } else {
    console.log("\n[PERFECT SCORE] All cookbook benchmark requirements passed!");
  }

  // Write report to artifact / JSON file
  fs.writeFileSync(
    path.join(__dirname, "fixtures", "ai-cookbook-report.json"),
    JSON.stringify(assessmentReport, null, 2),
    "utf8"
  );

  return assessmentReport;
}

run().catch((error) => {
  console.error("Cookbook execution failed:", error.stack || error.message);
  process.exit(1);
});
