import type { IntakeData } from "@/lib/cms/types";

/* ================================================================== */
/*  Deck Generator — Shared Type Definitions                           */
/* ================================================================== */

export type IntakeFormData = IntakeData;

/* Per-slide content interfaces — keys match SlideData.texts in CMS */

export interface Slide1Content {
  company: string;
  subtitle: string;
  tagline: string;
}

export interface Slide2Content {
  challenge: string;
  opportunity: string;
  outcome: string;
}

export interface Slide3Content {
  headline: string;
  bullets: string;
}

export interface Slide4Content {
  line1: string;
  line2: string;
  line3: string;
}

export interface Slide5Content {
  channels: string;
  budget: string;
  geography: string;
  audience: string;
}

export interface Slide6Content {
  point1: string;
  point2: string;
  point3: string;
}

export interface Slide7Content {
  primary: string;
  geography: string;
  notes: string;
}

export interface Slide8Content {
  steps: string;
}

export interface Slide9Content {
  title: string;
  challenge: string;
  solution: string;
  outcome: string;
}

export interface Slide10Content {
  kpi1: string;
  kpi2: string;
  kpi3: string;
  budget: string;
  channels: string;
}

export interface Slide11Content {
  strategy: string;
  acquisition: string;
  optimization: string;
}

export interface Slide12Content {
  step1: string;
  step2: string;
  step3: string;
  closing: string;
}

export interface GeneratedDeckContent {
  slide1: Slide1Content;
  slide2: Slide2Content;
  slide3: Slide3Content;
  slide4: Slide4Content;
  slide5: Slide5Content;
  slide6: Slide6Content;
  slide7: Slide7Content;
  slide8: Slide8Content;
  slide9: Slide9Content;
  slide10: Slide10Content;
  slide11: Slide11Content;
  slide12: Slide12Content;
}

export type GenerationStatus = "idle" | "generating" | "done" | "error";

export interface GenerateDeckResponse {
  deck: GeneratedDeckContent;
  source: "ai" | "fallback";
  warning?: string;
}
