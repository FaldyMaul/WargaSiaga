const { spawn } = require("node:child_process");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const port = 4800 + (process.pid % 500);
const baseUrl = `http://127.0.0.1:${port}`;
const routes = [
  "index.html",
  "modus.html",
  "modus-detail.html?id=bank-otp",
  "konsultasi.html",
  "bantu-orang-lain.html",
  "bantuan-darurat.html",
  "laporan.html",
  "lapor.html",
  "status-laporan.html",
  "tentang.html"
];

const preview = spawn(process.execPath, [
  path.resolve(projectRoot, "server/index.mjs"),
  "--production"
], { cwd: projectRoot, env: { ...process.env, PORT: String(port), HOST: "127.0.0.1", AI_DISABLE: "1" }, stdio: "ignore" });

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitForPreview() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/index.html`);
      if (response.ok) return;
    } catch (_) {}
    await wait(100);
  }
  throw new Error("Vite production preview did not become ready.");
}

async function run() {
  await waitForPreview();
  const healthResponse = await fetch(`${baseUrl}/api/health`);
  const health = await healthResponse.json();
  if (!healthResponse.ok || health.aiAvailable !== false || "apiKey" in health) throw new Error("Production API health contract failed.");
  const assetUrls = new Set();

  for (const route of routes) {
    const url = `${baseUrl}/${route}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${route} returned ${response.status}.`);
    if (!response.headers.get("content-security-policy")?.includes("default-src 'self'")) throw new Error(`${route} is missing the production Content-Security-Policy.`);
    const html = await response.text();
    if (!html.includes('<div id="app"></div>')) throw new Error(`${route} is missing the application mount point.`);

    for (const match of html.matchAll(/(?:src|href)="([^"]+\/assets\/[^"]+)"/g)) {
      assetUrls.add(new URL(match[1], url).href);
    }
  }

  if (assetUrls.size < 2) throw new Error("Production HTML does not reference bundled JavaScript and CSS assets.");
  let javascript = "";
  const javascriptAssetUrls = [];
  for (const assetUrl of assetUrls) {
    const response = await fetch(assetUrl);
    if (!response.ok) throw new Error(`Bundled asset returned ${response.status}: ${assetUrl}`);
    if (assetUrl.endsWith(".js")) {
      javascriptAssetUrls.push(assetUrl);
      javascript += await response.text();
    }
  }
  if (!javascript.includes("data:image/svg+xml")) throw new Error("The safety illustration was not included in the production JavaScript asset graph.");
  if (javascript.includes('src="assets/images/wargasiaga-safety-orbit.svg"')) throw new Error("The production bundle still contains an unresolved source SVG path.");
  const visualAssets = [...new Set([...javascript.matchAll(/wargasiaga-[^"'`]+\.webp/g)].map((match) => match[0]))];
  if (visualAssets.length < 3) throw new Error("The three generated WebP illustrations were not included in the production asset graph.");
  for (const asset of visualAssets) {
    const response = await fetch(new URL(asset, javascriptAssetUrls[0]));
    const body = await response.arrayBuffer();
    if (!response.ok || body.byteLength === 0) throw new Error(`Generated illustration is unavailable: ${asset}`);
  }
  const ocrAssets = ["ocr/worker.min.js", "ocr/lang/ind.traineddata.gz", "ocr/core/tesseract-core-lstm.wasm.js", "ocr/core/tesseract-core-simd-lstm.wasm.js", "ocr/core/tesseract-core-relaxedsimd-lstm.wasm.js"];
  for (const asset of ocrAssets) {
    const response = await fetch(`${baseUrl}/${asset}`);
    const body = await response.arrayBuffer();
    if (!response.ok || body.byteLength === 0) throw new Error(`Local OCR asset is unavailable: ${asset}`);
  }

  console.log(`Production server audit passed: API health, security headers, ${routes.length} routes, bundled assets, safety illustration, and ${ocrAssets.length} local OCR assets are reachable.`);
}

run()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    preview.kill();
    await wait(150);
    process.exit(process.exitCode || 0);
  });
