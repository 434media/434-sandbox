import type { SlideData } from "./slides";
import type { GeneratedDeckContent } from "./types";

/** Maps AI/fallback-generated deck content onto the 12 canonical slide ids. */
export function deckContentToSlideData(deck: GeneratedDeckContent): SlideData[] {
  return [
    { id: "title",      image: "", texts: deck.slide1 as unknown as Record<string, string> },
    { id: "heard",      image: "", texts: deck.slide2 as unknown as Record<string, string> },
    { id: "opportunity",image: "", texts: deck.slide3 as unknown as Record<string, string> },
    { id: "strategy",   image: "", texts: deck.slide4 as unknown as Record<string, string> },
    { id: "plan",       image: "", texts: deck.slide5 as unknown as Record<string, string> },
    { id: "why",        image: "", texts: deck.slide6 as unknown as Record<string, string> },
    { id: "audience",   image: "", texts: deck.slide7 as unknown as Record<string, string> },
    { id: "flow",       image: "", texts: deck.slide8 as unknown as Record<string, string> },
    { id: "success",    image: "", texts: deck.slide9 as unknown as Record<string, string> },
    { id: "metrics",    image: "", texts: deck.slide10 as unknown as Record<string, string> },
    { id: "engagement", image: "", texts: deck.slide11 as unknown as Record<string, string> },
    { id: "nextsteps",  image: "", texts: deck.slide12 as unknown as Record<string, string> },
  ];
}
