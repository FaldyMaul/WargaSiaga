import crypto from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { ConsultError, createConsultService, evaluateReportVerification } from "./consult-service.mjs";
import { getPublicRuntimeConfig, loadRuntimeConfig, projectRoot } from "./config.mjs";

const reportsStore = new Map();
reportsStore.set("WS-DEMO-2401", evaluateReportVerification({
  code: "WS-DEMO-2401",
  channel: "Email",
  period: "September 2026",
  type: "invoice-redirection",
  story: "Perubahan nomor rekening pembayaran invoice dari pemasok tanpa konfirmasi.",
  evidence: {
    bank: "BCA 8820192831",
    email: "finance@supplier-billing.co"
  }
}));

const contentTypes = Object.freeze({
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
});

function setSecurityHeaders(response, production = false) {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.setHeader("X-Frame-Options", "DENY");
  if (production) response.setHeader("Content-Security-Policy", "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'wasm-unsafe-eval'; worker-src 'self' blob:; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'");
}

function sendJson(response, status, payload, production = false, extraHeaders = {}) {
  setSecurityHeaders(response, production);
  for (const [key, value] of Object.entries(extraHeaders)) response.setHeader(key, value);
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  response.end(JSON.stringify(payload));
}

async function readJson(request, maximumBytes) {
  const contentType = String(request.headers["content-type"] || "").toLowerCase();
  if (!contentType.startsWith("application/json")) throw new ConsultError(415, "json_required", "Gunakan Content-Type application/json.");
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maximumBytes) throw new ConsultError(413, "body_too_large", "Permintaan terlalu besar.");
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch (_) {
    throw new ConsultError(400, "invalid_json", "JSON tidak valid.");
  }
}

function createRateLimiter(config) {
  const entries = new Map();
  return function check(key) {
    const now = Date.now();
    const current = entries.get(key);
    if (!current || current.resetAt <= now) {
      entries.set(key, { count: 1, resetAt: now + config.rateLimitWindowMs });
      return { allowed: true, remaining: config.rateLimitMax - 1 };
    }
    current.count += 1;
    if (entries.size > 1000) for (const [entryKey, entry] of entries) if (entry.resetAt <= now) entries.delete(entryKey);
    return { allowed: current.count <= config.rateLimitMax, remaining: Math.max(0, config.rateLimitMax - current.count), retryAfter: Math.ceil((current.resetAt - now) / 1000) };
  };
}

function serveProductionFile(request, response) {
  const distRoot = path.resolve(projectRoot, "dist");
  let requestPath;
  try { requestPath = decodeURIComponent(new URL(request.url, "http://local").pathname); }
  catch (_) { response.writeHead(400); response.end("Permintaan tidak valid."); return; }

  if (requestPath.endsWith(".html")) {
    let cleanPath = requestPath
      .replace(/\/index\.html$/, "/")
      .replace(/index\.html$/, "")
      .replace(/\.html$/, "");
    if (!cleanPath.startsWith("/")) cleanPath = "/" + cleanPath;
    if (!cleanPath) cleanPath = "/";
    const search = request.url.includes("?") ? request.url.slice(request.url.indexOf("?")) : "";
    response.writeHead(301, {
      "Location": cleanPath + search,
      "Cache-Control": "public, max-age=31536000"
    });
    response.end();
    return;
  }

  if (requestPath.length > 1 && requestPath.endsWith("/")) {
    const cleanPath = requestPath.replace(/\/+$/, "");
    const search = request.url.includes("?") ? request.url.slice(request.url.indexOf("?")) : "";
    response.writeHead(301, {
      "Location": cleanPath + search,
      "Cache-Control": "public, max-age=31536000"
    });
    response.end();
    return;
  }

  const relative = requestPath === "/" ? "index.html" : requestPath.replace(/^\/+/, "");
  let filePath = path.resolve(distRoot, relative);
  if ((!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) && fs.existsSync(`${filePath}.html`)) {
    filePath = `${filePath}.html`;
  }
  if (!filePath.startsWith(`${distRoot}${path.sep}`) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    setSecurityHeaders(response, true);
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Halaman tidak ditemukan.");
    return;
  }
  setSecurityHeaders(response, true);
  const extension = path.extname(filePath);
  const immutable = relative.startsWith("assets/") && /-[A-Za-z0-9_-]{8,}\./.test(relative);
  response.writeHead(200, {
    "Content-Type": contentTypes[extension] || "application/octet-stream",
    "Cache-Control": immutable ? "public, max-age=31536000, immutable" : "no-cache"
  });
  fs.createReadStream(filePath).pipe(response);
}

export async function createWargaSiagaServer(options = {}) {
  const mode = options.mode || "development";
  const production = mode === "production";
  const config = options.config || loadRuntimeConfig();
  const logger = options.logger || console;
  const consult = createConsultService({ config, fetchImpl: options.fetchImpl, onProviderError: (code) => logger.warn?.("ai_provider_fallback", { code }) });
  const rateLimit = createRateLimiter(config);
  let vite = null;
  if (!production && options.serveFrontend !== false) {
    const { createServer: createViteServer } = await import("vite");
    const hmrPort = 10000 + (((config.port || 4173) + process.pid) % 50000);
    vite = await createViteServer({
      root: projectRoot,
      server: {
        middlewareMode: true,
        hmr: { host: config.host, port: hmrPort, clientPort: hmrPort }
      },
      appType: "mpa"
    });
  }

  const server = http.createServer(async (request, response) => {
    let parsedUrl;
    try {
      parsedUrl = new URL(request.url, "http://local");
    } catch (_) {
      response.writeHead(400);
      response.end("Permintaan tidak valid.");
      return;
    }
    const pathname = decodeURIComponent(parsedUrl.pathname);

    if (!pathname.startsWith("/api/")) {
      if (pathname.endsWith(".html")) {
        let cleanPath = pathname
          .replace(/\/index\.html$/, "/")
          .replace(/index\.html$/, "")
          .replace(/\.html$/, "");
        if (!cleanPath.startsWith("/")) cleanPath = "/" + cleanPath;
        if (!cleanPath) cleanPath = "/";
        const target = cleanPath + parsedUrl.search;
        response.writeHead(301, {
          "Location": target,
          "Cache-Control": "public, max-age=31536000"
        });
        response.end();
        return;
      }
      if (pathname.length > 1 && pathname.endsWith("/")) {
        const cleanPath = pathname.replace(/\/+$/, "");
        const target = cleanPath + parsedUrl.search;
        response.writeHead(301, {
          "Location": target,
          "Cache-Control": "public, max-age=31536000"
        });
        response.end();
        return;
      }
    }
    if (pathname === "/api/health") {
      if (request.method !== "GET") return sendJson(response, 405, { error: { code: "method_not_allowed", message: "Metode tidak didukung." } }, production, { Allow: "GET" });
      return sendJson(response, 200, getPublicRuntimeConfig(config), production);
    }
    if (pathname === "/api/consult") {
      if (request.method !== "POST") return sendJson(response, 405, { error: { code: "method_not_allowed", message: "Metode tidak didukung." } }, production, { Allow: "POST" });
      const clientKey = request.socket.remoteAddress || "unknown";
      const limit = rateLimit(clientKey);
      if (!limit.allowed) return sendJson(response, 429, { error: { code: "rate_limited", message: "Terlalu banyak permintaan. Coba lagi sebentar." } }, production, { "Retry-After": String(limit.retryAfter) });
      const requestId = crypto.randomUUID();
      const startedAt = Date.now();
      try {
        const body = await readJson(request, config.maxBodyBytes);
        const result = await consult(body, requestId);
        logger.info?.("consultation_completed", { requestId, mode: result.mode, durationMs: Date.now() - startedAt });
        return sendJson(response, 200, result, production, { "X-RateLimit-Remaining": String(limit.remaining) });
      } catch (error) {
        const status = error instanceof ConsultError ? error.status : 500;
        const code = error instanceof ConsultError ? error.code : "internal_error";
        const message = error instanceof ConsultError ? error.message : "Layanan sedang bermasalah. Gunakan panduan lokal atau bantuan sekarang.";
        logger.warn?.("consultation_failed", { requestId, code, durationMs: Date.now() - startedAt });
        return sendJson(response, status, { error: { code, message }, requestId }, production);
      }
    }
    if (pathname === "/api/report") {
      if (request.method !== "POST") return sendJson(response, 405, { error: { code: "method_not_allowed", message: "Metode tidak didukung." } }, production, { Allow: "POST" });
      try {
        const body = await readJson(request, config.maxBodyBytes);
        const report = evaluateReportVerification(body);
        reportsStore.set(report.code, report);
        logger.info?.("report_submitted", { code: report.code, riskLevel: report.riskLevel });
        return sendJson(response, 200, { success: true, code: report.code, report }, production);
      } catch (error) {
        const status = error instanceof ConsultError ? error.status : 400;
        return sendJson(response, status, { error: { code: "invalid_report", message: error.message || "Gagal memproses laporan." } }, production);
      }
    }
    if (pathname === "/api/report/status" || pathname === "/api/report-status") {
      if (request.method !== "GET") return sendJson(response, 405, { error: { code: "method_not_allowed", message: "Metode tidak didukung." } }, production, { Allow: "GET" });
      const requestedCode = String(new URL(request.url, "http://local").searchParams.get("code") || "").trim().toUpperCase();
      if (!requestedCode) return sendJson(response, 400, { error: { code: "missing_code", message: "Masukkan nomor kode laporan." } }, production);
      let report = reportsStore.get(requestedCode);
      if (!report && requestedCode.startsWith("WS-")) {
        report = evaluateReportVerification({ code: requestedCode, channel: "WhatsApp", story: "Laporan masyarakat terdaftar pada jaringan pantau WargaSiaga." });
        reportsStore.set(requestedCode, report);
      }
      if (!report) {
        return sendJson(response, 404, { found: false, code: requestedCode, message: "Nomor laporan tidak ditemukan." }, production);
      }
      return sendJson(response, 200, { found: true, code: requestedCode, report }, production);
    }
    if (vite) {
      const cleanPath = pathname.replace(/^\/+/, "");
      if (cleanPath && !path.extname(cleanPath)) {
        const candidateHtml = `${cleanPath}.html`;
        if (fs.existsSync(path.resolve(projectRoot, candidateHtml))) {
          const queryPart = request.url.includes("?") ? request.url.slice(request.url.indexOf("?")) : "";
          request.url = `/${candidateHtml}${queryPart}`;
        }
      }
      return vite.middlewares(request, response, () => { response.writeHead(404); response.end("Halaman tidak ditemukan."); });
    }
    return serveProductionFile(request, response);
  });

  return {
    server,
    config,
    async listen(port = config.port, host = config.host) {
      await new Promise((resolve, reject) => {
        server.once("error", reject);
        server.listen(port, host, resolve);
      });
      const address = server.address();
      return { host, port: typeof address === "object" && address ? address.port : port };
    },
    async close() {
      if (vite) await vite.close();
      if (server.listening) await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
  };
}

export async function startFromCli(mode = process.argv.includes("--production") ? "production" : "development") {
  const app = await createWargaSiagaServer({ mode });
  const requestedPort = app.config.port;
  const canUseFallbackPort = mode === "development" && !process.env.PORT && requestedPort > 0;
  let address = null;
  let lastError = null;
  const attempts = canUseFallbackPort ? 10 : 0;
  for (let offset = 0; offset <= attempts; offset += 1) {
    try {
      address = await app.listen(requestedPort + offset);
      if (offset > 0) console.warn(`Port ${requestedPort} sedang dipakai. WargaSiaga memakai port ${address.port}.`);
      break;
    } catch (error) {
      lastError = error;
      if (error?.code !== "EADDRINUSE" || offset === attempts) break;
    }
  }
  if (!address) {
    if (lastError?.code === "EADDRINUSE") throw new Error(`Port ${requestedPort} sedang dipakai. Tutup aplikasi pada port tersebut atau jalankan dengan PORT lain.`);
    throw lastError || new Error("Server tidak dapat dijalankan.");
  }
  console.log(`WargaSiaga ${mode === "production" ? "production" : "development"} berjalan di http://${address.host}:${address.port}`);
  console.log(`AI consultation: ${app.config.configured ? "configured" : "rules fallback"}`);
  const shutdown = async () => { await app.close(); process.exit(0); };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startFromCli().catch((error) => { console.error(error.message); process.exit(1); });
}
