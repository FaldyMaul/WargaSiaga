import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { projectRoot } from "./config.mjs";

const dataSource = fs.readFileSync(path.join(projectRoot, "assets/js/data.js"), "utf8");
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(dataSource, sandbox, { timeout: 1000, filename: "assets/js/data.js" });

export const cards = Object.freeze(sandbox.window.WS_DATA.cards.map((card) => Object.freeze(card)));

export const officialLinks = Object.freeze({
  iasc: Object.freeze({ id: "iasc", label: "IASC — OJK / Satgas PASTI", url: "https://iasc.ojk.go.id/", purpose: "Pelaporan kerugian transaksi finansial" }),
  sipasti: Object.freeze({ id: "sipasti", label: "SIPASTI — OJK", url: "https://sipasti.ojk.go.id/", purpose: "Laporan indikasi aktivitas keuangan ilegal" }),
  cekrekening: Object.freeze({ id: "cekrekening", label: "CekRekening — Komdigi", url: "https://cekrekening.id/", purpose: "Cek atau laporkan rekening; hasil bukan jaminan aman" }),
  aduannomor: Object.freeze({ id: "aduannomor", label: "AduanNomor — Komdigi", url: "https://aduannomor.id/", purpose: "Cek atau laporkan nomor mencurigakan" }),
  aduankonten: Object.freeze({ id: "aduankonten", label: "AduanKonten — Komdigi", url: "https://aduankonten.id/", purpose: "Laporkan konten daring berbahaya" })
});

const stopWords = new Set(["yang", "dan", "atau", "saya", "anda", "dari", "untuk", "dengan", "tidak", "sudah", "agar", "pada", "akan", "oleh", "itu", "ini", "ada", "dalam", "lalu"]);

function words(value) {
  return String(value).replace(/\[[^\]]+DISAMARKAN\]/gi, " ").toLowerCase().match(/[a-z0-9]+/g)?.filter((word) => word.length > 3 && !stopWords.has(word)) || [];
}

export function retrieveCards(text, limit = 3) {
  const inputWords = new Set(words(text));
  return cards
    .map((card) => {
      const searchable = [card.title, card.summary, card.requestedAction, ...card.channels, ...card.contexts, ...card.tactics, ...card.warningSigns].join(" ");
      const score = words(searchable).reduce((total, word) => total + (inputWords.has(word) ? 1 : 0), 0);
      return { card, score };
    })
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map(({ card }) => card);
}

export function toPublicCard(card) {
  return { id: card.id, title: card.title, href: `modus-detail.html?id=${encodeURIComponent(card.id)}` };
}

export function officialIdFromUrl(url) {
  return Object.values(officialLinks).find((link) => link.url === url)?.id || null;
}

export function buildRetrievalContext(retrievedCards) {
  return retrievedCards.map((card) => ({
    id: card.id,
    title: card.title,
    summary: card.summary,
    requestedAction: card.requestedAction,
    warningSigns: card.warningSigns,
    independentChecks: card.independentChecks,
    alreadyActedSteps: card.alreadyActedSteps,
    allowedOfficialLinkIds: card.officialLinks.map((link) => officialIdFromUrl(link.url)).filter(Boolean)
  }));
}
