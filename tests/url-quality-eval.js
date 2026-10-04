"use strict";

const { binaryMetrics } = require("./quality-metrics.js");

const phishingFeed = "https://raw.githubusercontent.com/openphish/public_feed/refs/heads/main/feed.txt";
const trancoIdUrl = "https://tranco-list.eu/top-1m-id";
const sampleLimit = Math.max(50, Math.min(1000, Number(process.env.URL_EVAL_LIMIT) || 300));

async function fetchLines(url, limit) {
  const response = await fetch(url, { headers: { "User-Agent": "WargaSiaga-quality-evaluation/0.3" }, signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`Dataset tidak tersedia (${response.status}) dari ${new URL(url).hostname}.`);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const lines = [];
  let buffer = "";
  while (lines.length < limit) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split(/\r?\n/);
    buffer = chunks.pop() || "";
    for (const chunk of chunks) {
      if (chunk.trim()) lines.push(chunk.trim());
      if (lines.length >= limit) break;
    }
  }
  await reader.cancel();
  return lines.slice(0, limit);
}

async function run() {
  const { analyzeUrl } = await import("../server/consult-service.mjs");
  const listId = (await (await fetch(trancoIdUrl, { signal: AbortSignal.timeout(15_000) })).text()).trim();
  if (!/^[A-Z0-9]+$/i.test(listId)) throw new Error("ID daftar Tranco tidak valid.");
  const [phishingUrls, trancoRows] = await Promise.all([
    fetchLines(phishingFeed, sampleLimit),
    fetchLines(`https://tranco-list.eu/download/${listId}/1000000`, sampleLimit)
  ]);
  const benignUrls = trancoRows.map((line) => `https://${line.split(",")[1]}/`).filter((url) => !url.endsWith("undefined/"));
  const rows = [
    ...phishingUrls.map((url) => ({ source: "OpenPhish", actual: true, url })),
    ...benignUrls.map((url) => ({ source: `Tranco ${listId}`, actual: false, url }))
  ].map((row) => {
    try {
      const analysis = analyzeUrl(row.url);
      return { ...row, predicted: analysis.signals.length > 0, signals: analysis.signals.map((signal) => signal.code) };
    } catch (_) {
      return { ...row, predicted: true, signals: ["invalid_url"] };
    }
  });
  const metrics = binaryMetrics(rows);
  const signalCounts = {};
  for (const row of rows.filter((item) => item.actual)) for (const signal of row.signals) signalCounts[signal] = (signalCounts[signal] || 0) + 1;
  const report = {
    evaluatedAt: new Date().toISOString(),
    task: "lexical URL triage (not a malware verdict)",
    positiveSource: "OpenPhish community feed",
    negativeSource: `Tranco ${listId} top domains`,
    targetUrlsFetched: false,
    samplesPerClass: Math.min(phishingUrls.length, benignUrls.length),
    metrics,
    positiveSignalCounts: signalCounts,
    limitation: "OpenPhish and Tranco labels measure feed membership/popularity. The test does not prove that an unlisted URL is safe."
  };
  console.log(JSON.stringify(report, null, 2));
  if (metrics.precision < 0.9 || metrics.recall < 0.6 || metrics.f1 < 0.75) throw new Error(`URL quality gate gagal: precision=${metrics.precision}, recall=${metrics.recall}, F1=${metrics.f1}.`);
}

run().catch((error) => { console.error(error.message); process.exit(1); });
