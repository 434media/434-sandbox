import type { CMSProject, IntakeSubmission } from "@/lib/cms/types";
import { buildFallbackDeck } from "@/lib/deck-generator/fallback";
import { deckContentToSlideData } from "@/lib/deck-generator/deck-content";

type MockStore = { intakes: IntakeSubmission[]; projects: CMSProject[] };
declare global { var __cmsMockStore: MockStore | undefined; }

const now = new Date();
const daysAgo = (days: number) => new Date(now.getTime() - days * 86_400_000).toISOString();

const seedIntakes: IntakeSubmission[] = [
  { id: "demo-txmx", companyName: "TXMX Boxing", objective: "Event Attendance / Tickets", whyNow: "The championship event is six weeks away and ticket sales need momentum.", geography: "San Antonio and South Texas", audience: "Boxing fans ages 18–45 and local families", channels: ["Paid Social", "Display", "Pre-Roll / YouTube"], budget: "$15–50k", competitors: "Regional fight promotions and streaming events", usp: "Authentic Latino boxing culture and hometown talent", notes: "Bilingual creative preferred.", createdAt: daysAgo(5), updatedAt: daysAgo(2), status: "ready", source: "intake-form", leadScore: 82, deckStatus: "generated" },
  { id: "demo-vemos", companyName: "Vemos Vamos", objective: "Brand Awareness", whyNow: "Spring travel planning is beginning now.", geography: "South Texas", audience: "Cultural travelers and families ages 25–55", channels: ["Paid Social", "SEO / GEO", "Display"], budget: "$5–15k", competitors: "State and city tourism campaigns", usp: "Community-led stories and overlooked local destinations", notes: "Feature artists, restaurants, and neighborhood guides.", createdAt: daysAgo(3), updatedAt: daysAgo(3), status: "new", source: "intake-form", leadScore: 67, deckStatus: "not_started" },
  { id: "demo-canvas", companyName: "Digital Canvas", objective: "Lead Generation", whyNow: "A national product launch is planned for the next quarter.", geography: "United States", audience: "Creative directors and marketing managers at growing agencies", channels: ["Paid Search", "Paid Social", "Email"], budget: "$50k+", competitors: "Figma, Canva, and Adobe", usp: "AI-powered briefs and agency-specific collaboration", notes: "Beta customer case studies are available.", createdAt: daysAgo(1), updatedAt: daysAgo(1), status: "qualified", source: "cms", leadScore: 94, deckStatus: "ready_to_generate" },
];

const seedProjects: CMSProject[] = [
  { id: "demo-project-txmx", name: "TXMX Boxing", status: "ready", sourceMode: "intake", intakeId: "demo-txmx", slideData: deckContentToSlideData(buildFallbackDeck(seedIntakes[0])), createdAt: daysAgo(4), updatedAt: daysAgo(2) },
  { id: "demo-project-canvas", name: "Digital Canvas", status: "draft", sourceMode: "intake", intakeId: "demo-canvas", slideData: deckContentToSlideData(buildFallbackDeck(seedIntakes[2])), createdAt: daysAgo(1), updatedAt: daysAgo(0.5) },
];

export function mockStore(): MockStore {
  globalThis.__cmsMockStore ??= { intakes: structuredClone(seedIntakes), projects: structuredClone(seedProjects) };
  return globalThis.__cmsMockStore;
}

export function mockId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}
