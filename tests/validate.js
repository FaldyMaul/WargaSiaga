const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const failures = [];
const htmlFiles = fs.readdirSync(root).filter((file) => file.endsWith(".html"));

function check(condition, message) {
  if (!condition) failures.push(message);
}

check(htmlFiles.length >= 10, "Expected at least ten HTML pages.");

for (const file of htmlFiles) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  check(/<html lang="id">/.test(source), `${file}: missing Indonesian language declaration.`);
  check(/name="viewport"/.test(source), `${file}: missing viewport metadata.`);
  check(/<title>[^<]+<\/title>/.test(source), `${file}: missing title.`);
  check(/data-page="[^"]+"/.test(source), `${file}: missing page identifier.`);
  check(/<script type="module" src="assets\/js\/main\.js"><\/script>/.test(source), `${file}: missing Vite JavaScript entry module.`);
  check(!/<script defer src="assets\/js\/(?:data|app)\.js"><\/script>/.test(source), `${file}: legacy script tags must be routed through main.js.`);
  check(/<noscript>/.test(source), `${file}: missing no-script fallback.`);
  if (file !== "bantuan-darurat.html") check(/name="theme-color" content="#7a5af8"/.test(source), `${file}: theme color must use the TailAdmin purple token.`);
  check(file === "bantuan-darurat.html" || /<noscript>[\s\S]*href="bantuan-darurat\.html"/.test(source), `${file}: no-script state must link to urgent help.`);

  for (const match of source.matchAll(/href="([^"#]+\.html)(?:[?#][^"]*)?"/g)) {
    check(fs.existsSync(path.join(root, match[1])), `${file}: broken local link to ${match[1]}.`);
  }
}

const dataSource = fs.readFileSync(path.join(root, "assets/js/data.js"), "utf8");
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(dataSource, sandbox);
const cards = sandbox.window.WS_DATA.cards;
check(Array.isArray(cards) && cards.length >= 6, "Expected at least six modus cards.");
check(new Set(cards.map((card) => card.id)).size === cards.length, "Modus IDs must be unique.");

const required = ["id", "slug", "title", "summary", "fictionalExample", "channels", "contexts", "tactics", "requestedAction", "warningSigns", "independentChecks", "alreadyActedSteps", "officialLinks", "sources", "ageGroups", "reviewedAt", "nextReviewAt", "reviewer", "status"];
const allowedAgeGroups = new Set(["kids", "teens", "adults", "elderly"]);
for (const card of cards) {
  for (const field of required) check(Boolean(card[field]), `${card.id || "unknown card"}: missing ${field}.`);
  check(card.warningSigns.length >= 3, `${card.id}: needs at least three warning signs.`);
  check(card.independentChecks.length >= 2, `${card.id}: needs at least two independent checks.`);
  check(card.alreadyActedSteps.length >= 3, `${card.id}: needs at least three post-exposure steps.`);
  check(card.sources.every((source) => /^https:\/\//.test(source.url)), `${card.id}: source URLs must use HTTPS.`);
  check(card.status === "draft", `${card.id}: content must remain draft until expert validation.`);
  check(card.reviewer.includes("validasi ahli"), `${card.id}: reviewer metadata must disclose pending expert validation.`);
  check(card.officialLinks.every((source) => /^https:\/\/(iasc\.ojk\.go\.id|sipasti\.ojk\.go\.id|cekrekening\.id|aduannomor\.id|aduankonten\.id)\/?/.test(source.url)), `${card.id}: official link outside the allowlist.`);
  check(Array.isArray(card.ageGroups) && card.ageGroups.length >= 1, `${card.id}: needs at least one age group.`);
  check(card.ageGroups.every((group) => allowedAgeGroups.has(group)), `${card.id}: contains an unsupported age group.`);
}
for (const group of allowedAgeGroups) check(cards.some((card) => card.ageGroups.includes(group)), `No guide is available for age group ${group}.`);

const appSource = fs.readFileSync(path.join(root, "assets/js/app.js"), "utf8");
const lucideIconSource = fs.readFileSync(path.join(root, "assets/js/lucide-icons.js"), "utf8");
const lucideBuildSource = fs.readFileSync(path.join(root, "scripts/build-lucide-icons.mjs"), "utf8");
const mainSource = fs.readFileSync(path.join(root, "assets/js/main.js"), "utf8");
const styleSource = fs.readFileSync(path.join(root, "assets/css/styles.css"), "utf8");
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const workspacePackageJson = JSON.parse(fs.readFileSync(path.resolve(root, "..", "package.json"), "utf8"));
const serverSource = fs.readFileSync(path.join(root, "server/index.mjs"), "utf8");
const consultServiceSource = fs.readFileSync(path.join(root, "server/consult-service.mjs"), "utf8");
check(!/AI_API_KEY|api[_-]?key\s*[:=]\s*["'][^"']+/i.test(appSource), "Browser JavaScript must not contain an API key.");
check(/import safetyOrbitUrl from "\.\.\/images\/wargasiaga-safety-orbit\.svg\?url"/.test(appSource), "The hero SVG must be part of the Vite asset graph.");
for (const asset of ["wargasiaga-home-check.webp", "wargasiaga-ai-inputs.webp", "wargasiaga-community.webp", "wargasiaga-literasi-data-pribadi.webp"]) {
  check(fs.existsSync(path.join(root, "assets/images", asset)), `Generated web illustration is missing: ${asset}.`);
  check(appSource.includes(`../images/${asset}?url`), `Generated web illustration is not imported: ${asset}.`);
  check(fs.statSync(path.join(root, "assets/images", asset)).size < 200_000, `Generated web illustration is not optimized below 200 KB: ${asset}.`);
}
check(appSource.includes("Bantu orang terdekat") && appSource.includes("bantu-orang-lain.html"), "The help-a-loved-one journey is missing.");
check(/Cuplikan visual dari/.test(appSource) && /Local literacy reference visual/.test(fs.readFileSync(path.join(root, "THIRD_PARTY_NOTICES.md"), "utf8")), "The PDF-derived visual needs visible attribution and a third-party notice.");
check(fs.readdirSync(path.join(root, "assets/images")).filter((file) => /image-prompt\.txt$/.test(file)).length >= 5, "The image regeneration prompt pack is incomplete.");
check(/import \{ LUCIDE_ICONS \} from "\.\/lucide-icons\.js"/.test(appSource), "The app must use the generated local Lucide icon set.");
check(/export const LUCIDE_SOURCE = "local-lucide"/.test(lucideIconSource), "Generated icons must declare their local Lucide source.");
for (const iconName of ["bot", "globeLock", "qrCode", "scanText", "shieldCheck", "sparkles"]) check(lucideIconSource.includes(`"${iconName}"`), `Required Lucide icon missing: ${iconName}.`);
check((lucideBuildSource.match(/"lucide-main"/g) || []).length >= 2, "Lucide generator must read the provided local repository.");
check(mainSource.indexOf('import "./data.js"') < mainSource.indexOf('import "./app.js"'), "Frontend entry must load data before the application.");
check(packageJson.scripts?.dev?.includes("server/index.mjs"), "npm run dev must start the integrated frontend/API server.");
check(packageJson.scripts?.dev === "node server/index.mjs", "The default Windows dev command must avoid unstable watch-mode pipes.");
check(packageJson.scripts?.["dev:watch"] === "node --watch server/index.mjs", "The optional watch-mode command is missing.");
check(workspacePackageJson.scripts?.dev === "npm --prefix wargasiaga-dev run dev", "Workspace-level npm run dev must forward to the application.");
check(packageJson.scripts?.build === "vite build", "npm run build must create the production frontend.");
check(packageJson.scripts?.["icons:build"] === "node scripts/build-lucide-icons.mjs", "The local Lucide rebuild command is missing.");
check(packageJson.scripts?.["test:api"] === "node tests/api-integration.js", "The API integration test command is missing.");
check(fs.existsSync(path.join(root, "vite.config.mjs")), "Vite multi-page configuration is missing.");
check(/createConsultService/.test(serverSource) && /\/api\/consult/.test(serverSource), "The server-side consultation endpoint is missing.");
check(/EADDRINUSE/.test(serverSource) && /Port \$\{requestedPort\} sedang dipakai/.test(serverSource), "Development startup needs a clear port-conflict fallback.");
check(/hmrPort/.test(serverSource) && /clientPort: hmrPort/.test(serverSource), "Vite HMR must use an instance-specific port.");
check(/detectUrgentExposure/.test(consultServiceSource) && /if \(detectUrgentExposure/.test(consultServiceSource), "Server-side urgent bypass is missing.");
check(/buildFeatureRecommendations/.test(consultServiceSource) && /featureRecommendations:/.test(consultServiceSource), "Server-controlled feature routing is missing.");
check(/function analyzeUrl/.test(consultServiceSource) && /fetched:\s*false/.test(consultServiceSource), "Non-fetching URL inspection is missing.");
check(/response_format:\s*\{ type: "json_object" \}/.test(consultServiceSource), "Structured model response mode is missing.");
check(/allowedOfficialIds/.test(consultServiceSource), "Model-provided official links are not constrained by retrieved context.");
check(fs.existsSync(path.join(root, "assets/js/image-analyzer.js")), "Local screenshot OCR module is missing.");
check(fs.existsSync(path.join(root, "public/ocr/worker.min.js")) && fs.existsSync(path.join(root, "public/ocr/lang/ind.traineddata.gz")), "Local OCR runtime assets are missing.");
check(/import\("\.\/image-analyzer\.js"\)/.test(appSource), "Screenshot OCR must remain lazy-loaded.");
const imageAnalyzerSource = fs.readFileSync(path.join(root, "assets/js/image-analyzer.js"), "utf8");
check(/BarcodeDetector/.test(imageAnalyzerSource) && /localOnly:\s*true/.test(imageAnalyzerSource), "Local QR/image privacy contract is missing.");
check(/--brand:\s*#7a5af8/.test(styleSource), "Primary palette must use TailAdmin theme purple #7a5af8.");
check(/--teal:\s*#147d70/.test(styleSource) && /--amber:\s*#b86805/.test(styleSource), "Balanced teal and amber support tokens are missing.");
check(!/--brand:\s*#0b6b57/.test(styleSource), "Legacy green primary token must not remain.");
check(/scroll-padding-top:\s*112px/.test(styleSource) && /scroll-padding-bottom:\s*88px/.test(styleSource), "Sticky navigation focus clearance is missing.");
check(fs.existsSync(path.join(root, "assets/images/wargasiaga-safety-orbit.svg")), "Safety illustration SVG is missing.");
check(/function detectUrgentExposure/.test(appSource), "Deterministic urgent consultation branch was not found.");
check(/sessionStorage\.setItem\("ws-home-question"/.test(appSource) && /sessionStorage\.removeItem\("ws-home-question"/.test(appSource), "Private one-time home-to-AI handoff is missing.");
check(!/\|\| DATA\.cards\[0\]/.test(appSource), "Unknown detail IDs must not fall back to an unrelated guide.");
check(/function redactSensitive/.test(appSource) && /function escapeHtml/.test(appSource), "Safe redaction helpers were not found.");
check(/aria-live="polite"/.test(appSource), "Dynamic result announcements were not found.");
check((appSource.match(/class="form-error hidden"/g) || []).length === 4, "All four interactive forms need accessible error summaries.");
check(appSource.includes("pertanyaan ini perlu dijawab"), "Required questions need the agreed inline Indonesian validation copy.");
check(appSource.includes('value="other">Lainnya — tulis sendiri'), "The citizen report form needs a custom pattern option.");
check(appSource.includes("Lanjutkan Laporan"), "The report continuation button label is missing.");
check(appSource.includes('["reports", "laporan.html", "Lapor Warga"]'), "The primary navigation must use Lapor Warga.");
check(/const AGE_GROUPS =/.test(appSource) && /name="age"/.test(appSource), "The scam catalogue needs an age-first filter.");

const staleSources = ["business-email-compromise-scams/invoice-redirection", "money-recovery-scams/recovery-room-scams"];
for (const staleSource of staleSources) check(!dataSource.includes(staleSource), `Stale source route remains: ${staleSource}`);
const canonicalSources = ["business-email-compromise-scams", "money-recovery-scams", "buying-and-selling-scams"];
for (const canonicalSource of canonicalSources) check(dataSource.includes(canonicalSource), `Canonical source route missing: ${canonicalSource}`);

if (failures.length) {
  console.error(`Validation failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Validation passed: ${htmlFiles.length} pages, ${cards.length} modus cards, local links and content contract checked.`);
