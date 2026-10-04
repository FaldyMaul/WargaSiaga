import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CASE_CAPTURES } from "../assets/js/case-captures.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(here, "../assets/images");

function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&apos;" }[character]));
}

function wrapText(value, limit = 26) {
  const words = value.split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > limit && line) {
      lines.push(line);
      line = word;
    } else line = candidate;
  }
  if (line) lines.push(line);
  return lines;
}

function textLines(lines, x, y, size = 36, lineHeight = 45, weight = 560, color = "#243442") {
  return `<text x="${x}" y="${y}" fill="${color}" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="${size}" font-weight="${weight}">${lines.map((line,index)=>`<tspan x="${x}" dy="${index ? lineHeight : 0}">${escapeXml(line)}</tspan>`).join("")}</text>`;
}

function buildCapture(id, item) {
  let y = 264;
  const bubbles = item.messages.map((message,index) => {
    const lines = wrapText(message);
    const height = Math.max(124, 42 + (lines.length * 45));
    const currentY = y;
    y += height + 25;
    const fill = index === 1 ? "#fff4df" : index === 2 ? "#fff0ec" : "#f4f7f9";
    const stroke = index === 1 ? "#e4a044" : index === 2 ? "#df7d68" : "#d8e1e6";
    const badgeFill = index === 0 ? "#147d70" : index === 1 ? "#b86805" : "#bd391f";
    return `<g>
      <circle cx="118" cy="${currentY + 35}" r="25" fill="${badgeFill}"/>
      <text x="118" y="${currentY + 44}" text-anchor="middle" fill="#fff" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="24" font-weight="800">${index + 1}</text>
      <rect x="158" y="${currentY}" width="516" height="${height}" rx="22" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
      ${textLines(lines,184,currentY + 52)}
      <text x="638" y="${currentY + height - 18}" text-anchor="end" fill="#7a8893" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="17">${escapeXml(item.time)}</text>
    </g>`;
  }).join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000" role="img" aria-labelledby="title description">
  <title id="title">${escapeXml(item.channel)}</title>
  <desc id="description">${escapeXml(item.alt)}</desc>
  <defs>
    <linearGradient id="backdrop" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f4f1ff"/><stop offset=".58" stop-color="#eef7f6"/><stop offset="1" stop-color="#fff7e7"/></linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#243442" flood-opacity=".16"/></filter>
  </defs>
  <rect width="800" height="1000" fill="url(#backdrop)"/>
  <rect x="52" y="32" width="696" height="936" rx="48" fill="#ffffff" stroke="#ccd7dd" stroke-width="2" filter="url(#shadow)"/>
  <rect x="310" y="49" width="180" height="24" rx="12" fill="#172839"/>
  <text x="94" y="102" fill="#44525d" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="18" font-weight="700">${escapeXml(item.time)}</text>
  <g fill="none" stroke="#44525d" stroke-width="5" stroke-linecap="round"><path d="M650 94h8M665 89v10M683 88h20v12h-20z"/></g>
  <rect x="78" y="126" width="644" height="106" rx="24" fill="#f8fafc" stroke="#e0e6ea"/>
  <circle cx="129" cy="179" r="30" fill="#7a5af8"/>
  <path d="M116 180l9 9 19-22" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="178" y="170" fill="#172839" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="23" font-weight="800">${escapeXml(item.sender)}</text>
  <text x="178" y="202" fill="#6c7a85" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="18" font-weight="650">${escapeXml(item.channel)}</text>
  ${bubbles}
  <rect x="82" y="942" width="318" height="34" rx="17" fill="#f4f1ff"/>
  <text x="241" y="965" text-anchor="middle" fill="#5925dc" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="16" font-weight="800" letter-spacing="1.1">REKONSTRUKSI EDUKASI</text>
</svg>`;
}

for (const [id,item] of Object.entries(CASE_CAPTURES)) {
  fs.writeFileSync(path.join(outputDir, `capture-${id}.svg`), buildCapture(id,item), "utf8");
}

console.log(`Generated ${Object.keys(CASE_CAPTURES).length} readable case-capture SVGs in ${outputDir}.`);
