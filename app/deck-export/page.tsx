"use client";

import { useEffect, useState } from "react";
import { buildSlides } from "@/lib/deck-generator/slides";
import type { DeckExportPayload } from "@/lib/deck-export/types";

export default function DeckExportPage() {
  const [payload, setPayload] = useState<DeckExportPayload | null>(null);

  useEffect(() => {
    document.body.classList.add("deck-export-mode");
    const receiveDeck = (event: Event) => setPayload((event as CustomEvent<DeckExportPayload>).detail);
    window.addEventListener("deck-export-data", receiveDeck);
    return () => {
      document.body.classList.remove("deck-export-mode");
      window.removeEventListener("deck-export-data", receiveDeck);
    };
  }, []);

  if (!payload) return <div data-deck-export-listening="true" className="p-8">Preparing deck…</div>;
  const slides = buildSlides(payload.slideData);
  return (
    <div className="deck-export-page" data-deck-export-ready="true">
      {slides.map((slide) => (
        <section className="deck-export-slide @container" key={slide.id} style={{ width: 1600, height: 900, position: "relative", overflow: "hidden" }}>
          {slide.node({ slide, updateText: () => {}, updateImage: () => {} })}
        </section>
      ))}
    </div>
  );
}
