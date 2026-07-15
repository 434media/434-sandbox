import { access } from "node:fs/promises";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import type { DeckExportPayload } from "@/lib/deck-export/types";

const localChromePaths = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
];

async function localChromeExecutable(): Promise<string | null> {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) return process.env.PUPPETEER_EXECUTABLE_PATH;
  for (const path of localChromePaths) {
    try { await access(path); return path; } catch {}
  }
  return null;
}

// Resolve the render target from trusted server config only. Never derive it
// from the incoming request's origin/Host header — that is client-controllable
// and would let a caller point the headless browser at an internal address (SSRF).
function deckExportOrigin(): string {
  const configured = process.env.DECK_EXPORT_ORIGIN?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export async function generateDeckPdf(payload: DeckExportPayload): Promise<Buffer> {
  const origin = deckExportOrigin();
  const localExecutable = await localChromeExecutable();
  const browser = await puppeteer.launch({
    executablePath: localExecutable ?? await chromium.executablePath(),
    headless: true,
    args: localExecutable
      ? ["--no-sandbox", "--disable-setuid-sandbox"]
      : chromium.args,
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 900, deviceScaleFactor: 1 });
    await page.goto(`${origin}/deck-export`, { waitUntil: "networkidle0", timeout: 60_000 });
    await page.waitForSelector("[data-deck-export-listening='true']", { timeout: 30_000 });
    await page.evaluate((deck) => {
      window.dispatchEvent(new CustomEvent("deck-export-data", { detail: deck }));
    }, payload);
    await page.waitForSelector("[data-deck-export-ready='true']", { timeout: 30_000 });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(Array.from(document.images).map((image) => image.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            image.addEventListener("load", () => resolve(), { once: true });
            image.addEventListener("error", () => resolve(), { once: true });
          })));
    });
    await page.emulateMediaType("print");
    const layout = await page.$$eval(".deck-export-slide", (slides) => slides.map((slide) => {
      const rect = slide.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    }));
    if (layout.length !== 12 || layout.some(({ width, height }) => width !== 1600 || height !== 900)) {
      throw new Error(`Deck export layout is invalid: ${JSON.stringify(layout)}`);
    }
    const pdf = await page.pdf({
      printBackground: true,
      width: "1600px",
      height: "900px",
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

export function safePdfFilename(projectName: string): string {
  // The first replace collapses every run of non-alphanumerics to a single "_",
  // so at most one leading/trailing "_" can remain — a plain "_" (no "+"
  // quantifier) strips it without the polynomial backtracking CodeQL flags.
  const clean = projectName.trim().replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "");
  return `${clean || "Pitch_Deck"}.pdf`;
}
