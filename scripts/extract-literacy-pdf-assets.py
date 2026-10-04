"""Build the QA-approved PDF excerpts used by the local WargaSiaga prototype.

This script deliberately uses fixed, narrow crops. Do not widen them without
repeating the privacy, accuracy, and rights review in report 21.
"""

from pathlib import Path

import pymupdf as fitz
from PIL import Image


APP_ROOT = Path(__file__).resolve().parents[1]
WORKSPACE_ROOT = APP_ROOT.parent
PDF_PATH = WORKSPACE_ROOT / "PANDU_LITERASI_DIGITAL_AZARIA_ZADA_N_BONGKAR_DUNIA_TIPU_TIPU_DIGITAL.pdf"
OUTPUT_DIR = APP_ROOT / "assets" / "images"

# Coordinates are PDF points on 1440 x 810 pages. Only QA-approved regions are
# exported. Page indices are zero based.
EXCERPTS = (
    {
        "page_index": 11,
        "clip": fitz.Rect(965, 320, 1308, 612),
        "filename": "literacy-marketplace-stay-in-app.webp",
    },
    {
        "page_index": 15,
        "clip": fitz.Rect(833, 150, 1325, 515),
        "filename": "literacy-lookalike-domain-table.webp",
    },
)


def export_excerpt(document: fitz.Document, spec: dict) -> None:
    page = document[spec["page_index"]]
    pixmap = page.get_pixmap(matrix=fitz.Matrix(2.4, 2.4), clip=spec["clip"], alpha=False)
    image = Image.frombytes("RGB", (pixmap.width, pixmap.height), pixmap.samples)
    output_path = OUTPUT_DIR / spec["filename"]
    image.save(output_path, "WEBP", quality=86, method=6)
    print(f"{output_path.name}: {image.width}x{image.height}, {output_path.stat().st_size} bytes")


def main() -> None:
    if not PDF_PATH.exists():
        raise FileNotFoundError(f"PDF source not found: {PDF_PATH}")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with fitz.open(PDF_PATH) as document:
        for excerpt in EXCERPTS:
            export_excerpt(document, excerpt)


if __name__ == "__main__":
    main()
