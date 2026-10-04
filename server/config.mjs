import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const serverDir = path.dirname(fileURLToPath(import.meta.url));
export const projectRoot = path.resolve(serverDir, "..");
export const workspaceEnvPath = path.resolve(projectRoot, "..", ".env");

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const values = {};
  for (const sourceLine of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = sourceLine.trim();
    if (!line || line.startsWith("#")) continue;
    const normalized = line.startsWith("export ") ? line.slice(7).trim() : line;
    const separator = normalized.indexOf("=");
    if (separator < 1) continue;
    const key = normalized.slice(0, separator).trim();
    let value = normalized.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }
  return values;
}

function booleanValue(value) {
  return /^(1|true|yes|on)$/i.test(String(value || ""));
}

function numberValue(value, fallback, minimum, maximum) {
  if (value === undefined || value === null || String(value).trim() === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(maximum, Math.max(minimum, parsed)) : fallback;
}

export function loadRuntimeConfig(overrides = {}) {
  const fileValues = overrides.skipEnv ? {} : parseEnvFile(workspaceEnvPath);
  const read = (key, fallback = "") => process.env[key] ?? fileValues[key] ?? fallback;
  const apiDisabled = booleanValue(read("AI_DISABLE"));
  const apiKey = apiDisabled ? "" : read("AI_API_KEY");
  const baseUrl = read("AI_URL_KEY");
  const model = read("AI_MODEL_NAME");
  const allowInsecureProvider = booleanValue(read("AI_ALLOW_INSECURE_PROVIDER"));
  const validProviderUrl = (() => {
    try {
      const url = new URL(baseUrl);
      return url.protocol === "https:" || (allowInsecureProvider && ["127.0.0.1", "localhost"].includes(url.hostname));
    } catch (_) { return false; }
  })();

  return Object.freeze({
    apiKey,
    baseUrl,
    model,
    apiDisabled,
    allowInsecureProvider,
    configured: Boolean(!apiDisabled && apiKey && baseUrl && model && validProviderUrl),
    host: read("HOST", "127.0.0.1"),
    port: numberValue(read("PORT"), 4173, 0, 65535),
    timeoutMs: numberValue(read("AI_TIMEOUT_MS", "15000"), 15000, 250, 30000),
    rateLimitWindowMs: numberValue(read("AI_RATE_WINDOW_MS", "60000"), 60000, 1000, 3600000),
    rateLimitMax: numberValue(read("AI_RATE_LIMIT", "8"), 8, 1, 100),
    maxInputChars: 1500,
    maxBodyBytes: 12000,
    ...overrides
  });
}

export function getPublicRuntimeConfig(config) {
  return Object.freeze({
    aiAvailable: Boolean(config.configured),
    aiConfigured: Boolean(config.configured),
    providerReachability: "not_checked",
    maxInputChars: config.maxInputChars,
    retention: "not_stored",
    version: "0.3.0"
  });
}
