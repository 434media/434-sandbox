import { access } from "node:fs/promises";
import puppeteer from "puppeteer-core";
import type { DeckExportPayload } from "@/lib/deck-export/types";

const localChromePaths = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
];

async function chromeExecutable(): Promise<string> {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) return process.env.PUPPETEER_EXECUTABLE_PATH;
  for (const path of localChromePaths) {
    try { await access(path); return path; } catch {}
  }
  throw new Error("No Chrome executable found. Set PUPPETEER_EXECUTABLE_PATH.");
}

export async function generateDeckPdf(payload: DeckExportPayload, origin: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    executablePath: await chromeExecutable(),
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
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
  const clean = projectName.trim().replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return `${clean || "Pitch_Deck"}.pdf`;
}
