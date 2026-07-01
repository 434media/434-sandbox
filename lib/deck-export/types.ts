import type { SlideData } from "@/lib/deck-generator/slides";

export type DeckExportPayload = {
  projectId: string;
  projectName: string;
  slideData: SlideData[];
};

export type EmailDeckRequest = DeckExportPayload & {
  clientName: string;
  clientEmail: string;
  message?: string;
};
