import type { SlideData } from "@/lib/deck-generator/slides";

export type LeadStatus = "new" | "qualified" | "ready" | "archived";
export type DeckStatus = "not_started" | "ready_to_generate" | "generated";

export interface IntakeData {
  companyName: string;
  objective: string;
  whyNow: string;
  geography: string;
  audience: string;
  channels: string[];
  budget: string;
  competitors: string;
  usp: string;
  notes: string;
}

export interface IntakeSubmission extends IntakeData {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: LeadStatus;
  source: "intake-form" | "cms";
  leadScore: number;
  deckStatus: DeckStatus;
}

export interface CMSProject {
  id: string;
  name: string;
  status: "draft" | "ready" | "exported";
  sourceMode: "intake" | "manual";
  intakeId?: string;
  slideData: SlideData[];
  createdAt: string;
  updatedAt: string;
}

export type DeckProject = CMSProject;

export interface AnalyticsMetrics {
  totalSubmissions: number;
  newLeads: number;
  readyToGenerate: number;
  generatedDecks: number;
  averageLeadScore: number;
}

