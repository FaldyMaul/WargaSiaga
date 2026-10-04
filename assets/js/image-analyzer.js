import { createWorker } from "tesseract.js";

const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
const maximumBytes = 5 * 1024 * 1024;
const maximumPixels = 20_000_000;
let workerPromise = null;

function localAsset(path) {
  return new URL(`ocr/${path}`, document.baseURI).href.replace(/\/$/, "");
}

async function getWorker(onProgress) {
  if (!workerPromise) {
    workerPromise = createWorker("ind", 1, {
      workerPath: localAsset("worker.min.js"),
      corePath: localAsset("core"),
      langPath: localAsset("lang"),
      gzip: true,
      logger(message) {
        if (typeof onProgress === "function") onProgress(message);
      }
    }).catch((error) => {
      workerPromise = null;
      throw error;
    });
  }
  return workerPromise;
}

async function detectQrCode(bitmap) {
  if (!("BarcodeDetector" in window)) return [];
  try {
    const supported = await window.BarcodeDetector.getSupportedFormats();
    if (!supported.includes("qr_code")) return [];
    const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
    const results = await detector.detect(bitmap);
    return results.map((result) => String(result.rawValue || "").trim()).filter(Boolean).slice(0, 3);
  } catch (_) {
    return [];
  }
}

function findUrls(text) {
  return [...String(text).matchAll(/(?:https?:\/\/|www\.)[^\s<>{}"']+/gi)].map((match) => match[0].replace(/[),.;]+$/, "")).slice(0, 3);
}

export async function analyzeImageLocally(file, { onProgress } = {}) {
  if (!(file instanceof File)) throw new Error("Pilih file gambar terlebih dahulu.");
  if (!allowedTypes.has(file.type)) throw new Error("Gunakan gambar PNG, JPG, atau WebP.");
  if (file.size > maximumBytes) throw new Error("Ukuran gambar maksimal 5 MB.");

  const bitmap = await createImageBitmap(file);
  try {
    if (bitmap.width * bitmap.height > maximumPixels) throw new Error("Resolusi gambar terlalu besar. Gunakan gambar di bawah 20 megapiksel.");
    const qrValues = await detectQrCode(bitmap);
    const worker = await getWorker(onProgress);
    const result = await worker.recognize(file);
    const text = String(result?.data?.text || "").replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim().slice(0, 1500);
    return {
      text,
      confidence: Math.max(0, Math.min(100, Math.round(Number(result?.data?.confidence) || 0))),
      qrValues,
      detectedUrls: [...new Set([...qrValues, ...findUrls(text)])].slice(0, 3),
      localOnly: true
    };
  } finally {
    bitmap.close();
  }
}

export async function disposeImageAnalyzer() {
  if (!workerPromise) return;
  try { (await workerPromise).terminate(); } catch (_) {}
  workerPromise = null;
}
