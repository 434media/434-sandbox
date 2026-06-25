/* ------------------------------------------------------------------ */
/*  434 Media · Lead Intelligence Platform — mock data + scoring lib   */
/* ------------------------------------------------------------------ */

export type Industry =
  | "Cybersecurity"
  | "Defense Technology"
  | "Healthcare Tech"
  | "Bioscience"
  | "AI / SaaS"
  | "Advanced Manufacturing"
  | "Venture Capital"
  | "Startup Accelerator"
  | "Government Contractor"
  | "Innovation Ecosystem"
  | "Event Production";

export type Location =
  | "San Antonio"
  | "Austin"
  | "Dallas"
  | "Houston"
  | "Texas (other)"
  | "United States";

export type FundingStage =
  | "Series B+"
  | "Series A"
  | "Government Funded"
  | "Seed"
  | "Bootstrapped";

export type EmployeeBand = "10–50" | "50–250" | "250–1000" | "1000+";

export type Grade = "A+" | "A" | "B" | "C" | "D";

export interface Prospect {
  id: string;
  company: string;
  industry: Industry;
  location: Location;
  fundingStage: FundingStage;
  employees: EmployeeBand;
  discoveredAt: Date;
  // Fit sub-scores
  hostsConferences: boolean;
  hostsMeetups: boolean;
  runsWebinars: boolean;
  communityBuilding: boolean;
  // Intent — website signals
  outdatedWebsite: boolean;
  noVideoContent: boolean;
  noPodcast: boolean;
  noLeadCapture: boolean;
  weakSeo: boolean;
  inactiveBlog: boolean;
  weakLinkedIn: boolean;
  noCaseStudies: boolean;
  // Intent — hiring signals
  hiringDemandGen: boolean;
  hiringMktgManager: boolean;
  hiringGrowthMktg: boolean;
  hiringSalesDev: boolean;
  hiringBizDev: boolean;
  // Intent — business signals
  fundingRound: boolean;
  productLaunch: boolean;
  acquisition: boolean;
  expansion: boolean;
  rebrand: boolean;
  newExecutive: boolean;
  // Computed
  fitScore: number;
  intentScore: number;
  finalScore: number;
  grade: Grade;
  estimatedDealValue: number; // USD
}

export interface SearchedProspect extends Prospect {
  summary: string;
  sources: string[];
  contactEmail: string;
  contactPhone: string;
  addresses: string[];
  tailoredEmail: string;
}

/* ---- scoring ---- */
const FIT_INDUSTRY: Partial<Record<Industry, number>> = {
  "Cybersecurity": 25,
  "Defense Technology": 25,
  "Healthcare Tech": 25,
  "Bioscience": 25,
  "AI / SaaS": 20,
  "Advanced Manufacturing": 20,
  "Venture Capital": 20,
  "Government Contractor": 20,
  "Innovation Ecosystem": 20,
  "Startup Accelerator": 15,
  "Event Production": 10,
};

const FIT_LOCATION: Record<Location, number> = {
  "San Antonio": 15,
  "Austin": 12,
  "Dallas": 10,
  "Houston": 10,
  "Texas (other)": 8,
  "United States": 5,
};

const FIT_STAGE: Record<FundingStage, number> = {
  "Series B+": 20,
  "Series A": 15,
  "Government Funded": 12,
  "Seed": 10,
  "Bootstrapped": 5,
};

const FIT_SIZE: Record<EmployeeBand, number> = {
  "10–50": 15,
  "50–250": 12,
  "250–1000": 10,
  "1000+": 5,
};

export function calcFitScore(p: Omit<Prospect, "fitScore" | "intentScore" | "finalScore" | "grade" | "estimatedDealValue">): number {
  const industry = FIT_INDUSTRY[p.industry] ?? 10;
  const location = FIT_LOCATION[p.location];
  const stage = FIT_STAGE[p.fundingStage];
  const size = FIT_SIZE[p.employees];
  const event =
    (p.hostsConferences ? 10 : 0) +
    (p.hostsMeetups ? 5 : 0) +
    (p.runsWebinars ? 5 : 0) +
    (p.communityBuilding ? 5 : 0);
  return Math.min(100, industry + location + stage + size + event);
}

export function calcIntentScore(p: Omit<Prospect, "fitScore" | "intentScore" | "finalScore" | "grade" | "estimatedDealValue">): number {
  const website =
    (p.outdatedWebsite ? 10 : 0) +
    (p.noVideoContent ? 10 : 0) +
    (p.noPodcast ? 10 : 0) +
    (p.noLeadCapture ? 10 : 0) +
    (p.weakSeo ? 10 : 0) +
    (p.inactiveBlog ? 10 : 0) +
    (p.weakLinkedIn ? 10 : 0) +
    (p.noCaseStudies ? 10 : 0);
  const hiring =
    (p.hiringDemandGen ? 20 : 0) +
    (p.hiringMktgManager ? 15 : 0) +
    (p.hiringGrowthMktg ? 15 : 0) +
    (p.hiringSalesDev ? 10 : 0) +
    (p.hiringBizDev ? 10 : 0);
  const business =
    (p.fundingRound ? 25 : 0) +
    (p.productLaunch ? 20 : 0) +
    (p.acquisition ? 20 : 0) +
    (p.expansion ? 20 : 0) +
    (p.rebrand ? 20 : 0) +
    (p.newExecutive ? 15 : 0);
  return Math.min(100, website + hiring + business);
}

export function calcFinalScore(fit: number, intent: number): number {
  return Math.round(fit * 0.6 + intent * 0.4);
}

export function getGrade(final: number): Grade {
  if (final >= 90) return "A+";
  if (final >= 80) return "A";
  if (final >= 70) return "B";
  if (final >= 60) return "C";
  return "D";
}

export function getAutomatedAction(grade: Grade): string {
  switch (grade) {
    case "A+": return "Email + LinkedIn + Call script · CRM record · Notify sales";
    case "A":  return "Generate email · Create follow-up task";
    case "B":  return "Add to nurture campaign";
    default:   return "Store only";
  }
}

/* ---- mock data generator ---- */
const INDUSTRIES: Industry[] = [
  "Cybersecurity", "Defense Technology", "Healthcare Tech", "Bioscience",
  "AI / SaaS", "Advanced Manufacturing", "Venture Capital", "Government Contractor",
  "Innovation Ecosystem", "Startup Accelerator", "Event Production",
];

const LOCATIONS: Location[] = [
  "San Antonio", "Austin", "Dallas", "Houston", "Texas (other)", "United States",
];

const FUNDING_STAGES: FundingStage[] = [
  "Series B+", "Series A", "Government Funded", "Seed", "Bootstrapped",
];

const EMPLOYEE_BANDS: EmployeeBand[] = ["10–50", "50–250", "250–1000", "1000+"];

const COMPANY_NAMES = [
  "Darkhive", "SIGA Technologies", "CrowdStrike", "Shift5", "Narf Industries",
  "Dcode", "CACI International", "Leidos", "Parsons Corp", "Booz Allen Hamilton",
  "Palo Alto Networks", "SentinelOne", "Claroty", "Armis Security", "Dragos",
  "CEVA Biosciences", "Natera", "GenMark Diagnostics", "BioAtla", "Veracyte",
  "Accenture Federal", "Deloitte Government", "SAIC", "ManTech International", "Peraton",
  "Palantir Technologies", "Anduril Industries", "Shield AI", "Rebellion Defense", "Epirus",
  "Capital Factory", "Techstars", "Plug and Play", "Station Houston", "SKY Socially",
  "Roper Technologies", "SPX Technologies", "Curtiss-Wright", "Moog Inc", "TransDigm",
  "H-E-B", "Frost Bank", "Valero Energy", "NuStar Energy", "Rackspace",
  "Forcepoint", "Trustwave", "Digital Defense", "Coalfire", "Rapid7",
  "Austin Ventures", "LiveOak VC", "Silverton Partners", "Mercury Fund", "S3 Ventures",
];

export function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0x100000000;
  };
}

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

function bool(rng: () => number, probability: number): boolean {
  return rng() < probability;
}

export function generateProspects(count: number, seed: number): Prospect[] {
  const rng = seededRng(seed);
  const now = Date.now();
  const usedNames = new Set<string>();

  return Array.from({ length: count }, (_, i) => {
    let name = pick(COMPANY_NAMES, rng);
    let attempts = 0;
    while (usedNames.has(name) && attempts < 10) {
      name = pick(COMPANY_NAMES, rng);
      attempts++;
    }
    if (!usedNames.has(name)) usedNames.add(name);
    if (attempts === 10) name = `${name} ${i + 1}`;

    const industry = pick(INDUSTRIES, rng);
    const location = pick(LOCATIONS, rng);
    const fundingStage = pick(FUNDING_STAGES, rng);
    const employees = pick(EMPLOYEE_BANDS, rng);
    const daysAgo = Math.round(rng() * 90);

    const base = {
      id: `PR-${String(i + 1).padStart(4, "0")}`,
      company: name,
      industry,
      location,
      fundingStage,
      employees,
      discoveredAt: new Date(now - daysAgo * 86_400_000),
      hostsConferences: bool(rng, 0.25),
      hostsMeetups: bool(rng, 0.3),
      runsWebinars: bool(rng, 0.35),
      communityBuilding: bool(rng, 0.28),
      outdatedWebsite: bool(rng, 0.45),
      noVideoContent: bool(rng, 0.55),
      noPodcast: bool(rng, 0.65),
      noLeadCapture: bool(rng, 0.4),
      weakSeo: bool(rng, 0.5),
      inactiveBlog: bool(rng, 0.6),
      weakLinkedIn: bool(rng, 0.5),
      noCaseStudies: bool(rng, 0.55),
      hiringDemandGen: bool(rng, 0.2),
      hiringMktgManager: bool(rng, 0.25),
      hiringGrowthMktg: bool(rng, 0.22),
      hiringSalesDev: bool(rng, 0.28),
      hiringBizDev: bool(rng, 0.24),
      fundingRound: bool(rng, 0.18),
      productLaunch: bool(rng, 0.22),
      acquisition: bool(rng, 0.1),
      expansion: bool(rng, 0.2),
      rebrand: bool(rng, 0.1),
      newExecutive: bool(rng, 0.25),
    };

    const fitScore = calcFitScore(base);
    const intentScore = calcIntentScore(base);
    const finalScore = calcFinalScore(fitScore, intentScore);
    const grade = getGrade(finalScore);

    const dealByGrade: Record<Grade, [number, number]> = {
      "A+": [40000, 80000],
      "A":  [20000, 45000],
      "B":  [10000, 25000],
      "C":  [5000, 15000],
      "D":  [0, 8000],
    };
    const [lo, hi] = dealByGrade[grade];
    const estimatedDealValue = Math.round((lo + rng() * (hi - lo)) / 1000) * 1000;

    return { ...base, fitScore, intentScore, finalScore, grade, estimatedDealValue };
  });
}

/* ---- helpers for search (mock only) ---- */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(hash);
}

function generateSummary(p: Prospect): string {
  const parts: string[] = [];
  const fitParts: string[] = [];
  fitParts.push(`Industry (${p.industry}) is a high-value sector.`);
  fitParts.push(`Location (${p.location}) aligns with our Texas focus.`);
  fitParts.push(`Funding stage (${p.fundingStage}) indicates ${p.fundingStage === 'Series B+' ? 'strong backing' : 'growth potential'}.`);
  fitParts.push(`Employee size (${p.employees}) suggests ${p.employees === '10–50' ? 'agility' : 'established operations'}.`);
  if (p.hostsConferences || p.hostsMeetups || p.runsWebinars || p.communityBuilding) {
    const events = [];
    if (p.hostsConferences) events.push('conferences');
    if (p.hostsMeetups) events.push('meetups');
    if (p.runsWebinars) events.push('webinars');
    if (p.communityBuilding) events.push('community building');
    fitParts.push(`Active in ${events.join(', ')} – strong community engagement.`);
  } else {
    fitParts.push('Limited community engagement signals.');
  }
  parts.push(`Fit score (${p.fitScore}/100): ${fitParts.join(' ')}`);

  const intentParts: string[] = [];
  const websiteIssues = [];
  if (p.outdatedWebsite) websiteIssues.push('outdated website');
  if (p.noVideoContent) websiteIssues.push('no video content');
  if (p.noPodcast) websiteIssues.push('no podcast');
  if (p.noLeadCapture) websiteIssues.push('no lead capture');
  if (p.weakSeo) websiteIssues.push('weak SEO');
  if (p.inactiveBlog) websiteIssues.push('inactive blog');
  if (p.weakLinkedIn) websiteIssues.push('weak LinkedIn presence');
  if (p.noCaseStudies) websiteIssues.push('no case studies');
  if (websiteIssues.length > 0) {
    intentParts.push(`Website signals: ${websiteIssues.join(', ')} – indicates need for marketing improvement.`);
  } else {
    intentParts.push('Website is well-maintained with strong digital presence.');
  }

  const hiring = [];
  if (p.hiringDemandGen) hiring.push('demand gen');
  if (p.hiringMktgManager) hiring.push('marketing manager');
  if (p.hiringGrowthMktg) hiring.push('growth marketing');
  if (p.hiringSalesDev) hiring.push('sales development');
  if (p.hiringBizDev) hiring.push('business development');
  if (hiring.length > 0) {
    intentParts.push(`Hiring for ${hiring.join(', ')} – shows growth investment.`);
  } else {
    intentParts.push('No active hiring signals detected.');
  }

  const business = [];
  if (p.fundingRound) business.push('recent funding round');
  if (p.productLaunch) business.push('product launch');
  if (p.acquisition) business.push('acquisition');
  if (p.expansion) business.push('expansion');
  if (p.rebrand) business.push('rebrand');
  if (p.newExecutive) business.push('new executive hire');
  if (business.length > 0) {
    intentParts.push(`Business events: ${business.join(', ')} – momentum and potential need for external services.`);
  } else {
    intentParts.push('No major business events recently.');
  }
  parts.push(`Intent score (${p.intentScore}/100): ${intentParts.join(' ')}`);
  parts.push(`Final score (${p.finalScore}/100) is weighted 60% fit + 40% intent. Grade: ${p.grade}.`);
  return parts.join('\n\n');
}

function generateSources(p: Prospect): string[] {
  const sources: string[] = ['AI-powered web research (simulated)'];
  if (p.outdatedWebsite || p.noVideoContent || p.noLeadCapture || p.weakSeo || p.inactiveBlog || p.weakLinkedIn || p.noCaseStudies) {
    sources.push('Website content analysis');
  }
  if (p.hiringDemandGen || p.hiringMktgManager || p.hiringGrowthMktg || p.hiringSalesDev || p.hiringBizDev) {
    sources.push('Job posting analysis (LinkedIn, Indeed)');
  }
  if (p.fundingRound || p.productLaunch || p.acquisition || p.expansion || p.rebrand || p.newExecutive) {
    sources.push('Business news and press releases (Crunchbase, Bloomberg)');
  }
  if (p.hostsConferences || p.hostsMeetups || p.runsWebinars || p.communityBuilding) {
    sources.push('Event participation and community activity');
  }
  if (sources.length === 1) sources.push('General industry research');
  return sources;
}

export function generateContactInfo(company: string, location: Location, rng: () => number) {
  const domain = company.toLowerCase().replace(/[^a-z0-9]/g, '');
  const email = `contact@${domain}.com`;
  const areaCode = pick(['210', '512', '214', '713', '817', '469', '830'], rng);
  const prefix = String(100 + Math.floor(rng() * 899));
  const line = String(1000 + Math.floor(rng() * 8999));
  const phone = `+1 (${areaCode}) ${prefix}-${line}`;

  const addressPool: Record<Location, string[]> = {
    "San Antonio": ["123 Alamo Plaza, San Antonio, TX 78205", "456 Riverwalk, San Antonio, TX 78207"],
    "Austin": ["789 Congress Ave, Austin, TX 78701", "1010 Barton Springs, Austin, TX 78704"],
    "Dallas": ["2020 Main St, Dallas, TX 75201", "3030 McKinney Ave, Dallas, TX 75204"],
    "Houston": ["4040 Westheimer, Houston, TX 77027", "5050 Kirby Dr, Houston, TX 77098"],
    "Texas (other)": ["6060 Ranch Rd, Round Rock, TX 78681", "7070 Gateway Blvd, El Paso, TX 79925"],
    "United States": ["123 Broad St, New York, NY 10004", "456 Market St, San Francisco, CA 94103"],
  };
  const primary = pick(addressPool[location] || addressPool["United States"], rng);
  const secondary = rng() > 0.6 ? pick(addressPool[location] || addressPool["United States"], rng) : null;
  const tertiary = rng() > 0.8 ? pick(addressPool[location] || addressPool["United States"], rng) : null;
  const addresses = [primary, secondary, tertiary].filter(Boolean) as string[];

  return { email, phone, addresses };
}

export function generateTailoredEmail(p: Prospect): string {
  let body = `Subject: Strategic partnership opportunity for ${p.company}\n\n`;
  body += `Dear ${p.company} team,\n\n`;
  body += `I hope this message finds you well. We at 434 Media have been following ${p.company}'s impressive growth in the ${p.industry} space. `;
  body += `Our analysis indicates that your company is a top-tier prospect (Grade ${p.grade}) with a strong fit (${p.fitScore}/100) and significant intent signals (${p.intentScore}/100).\n\n`;

  const signals = [];
  if (p.hiringDemandGen || p.hiringMktgManager || p.hiringGrowthMktg) signals.push('your recent hiring for marketing and growth roles');
  if (p.fundingRound) signals.push('your recent funding round');
  if (p.productLaunch) signals.push('your upcoming product launch');
  if (p.expansion) signals.push('your expansion plans');
  if (p.acquisition) signals.push('your acquisition strategy');
  if (p.rebrand) signals.push('your rebranding efforts');
  if (p.newExecutive) signals.push('your new executive appointments');
  if (signals.length > 0) {
    body += `We noticed ${signals.join(', ')}. These developments align perfectly with the services we offer to help companies like yours accelerate their market presence and optimize their lead generation.\n\n`;
  } else {
    body += `We believe there is a strong synergy between our expertise and your current trajectory.\n\n`;
  }

  body += `We would love to schedule a brief call to discuss how we can support your goals. Let me know a time that works for you.\n\n`;
  body += `Looking forward to connecting,\n\n[Your Name]\n434 Media\n[Your Phone]\n[Your Email]`;
  return body;
}

export function createProspectFromSearch(companyName: string): SearchedProspect {
  const seed = hashString(companyName);
  const rng = seededRng(seed);

  const industry = pick(INDUSTRIES, rng);
  const location = pick(LOCATIONS, rng);
  const fundingStage = pick(FUNDING_STAGES, rng);
  const employees = pick(EMPLOYEE_BANDS, rng);
  const bias = companyName.length % 5;

  const base = {
    id: `PR-SEARCH-${Date.now()}-${seed}`,
    company: companyName,
    industry,
    location,
    fundingStage,
    employees,
    discoveredAt: new Date(),
    hostsConferences: bool(rng, 0.2 + bias * 0.05),
    hostsMeetups: bool(rng, 0.25 + (bias % 3) * 0.04),
    runsWebinars: bool(rng, 0.3 + (bias % 4) * 0.03),
    communityBuilding: bool(rng, 0.25 + (bias % 2) * 0.06),
    outdatedWebsite: bool(rng, 0.4 - bias * 0.03),
    noVideoContent: bool(rng, 0.5 - bias * 0.03),
    noPodcast: bool(rng, 0.6 - bias * 0.03),
    noLeadCapture: bool(rng, 0.4 - bias * 0.03),
    weakSeo: bool(rng, 0.5 - bias * 0.03),
    inactiveBlog: bool(rng, 0.6 - bias * 0.03),
    weakLinkedIn: bool(rng, 0.5 - bias * 0.03),
    noCaseStudies: bool(rng, 0.55 - bias * 0.03),
    hiringDemandGen: bool(rng, 0.15 + bias * 0.04),
    hiringMktgManager: bool(rng, 0.2 + bias * 0.04),
    hiringGrowthMktg: bool(rng, 0.18 + bias * 0.04),
    hiringSalesDev: bool(rng, 0.22 + bias * 0.04),
    hiringBizDev: bool(rng, 0.2 + bias * 0.04),
    fundingRound: bool(rng, 0.15 + bias * 0.03),
    productLaunch: bool(rng, 0.18 + bias * 0.03),
    acquisition: bool(rng, 0.08 + bias * 0.02),
    expansion: bool(rng, 0.18 + bias * 0.03),
    rebrand: bool(rng, 0.08 + bias * 0.02),
    newExecutive: bool(rng, 0.2 + bias * 0.03),
  };

  const fitScore = calcFitScore(base);
  const intentScore = calcIntentScore(base);
  const finalScore = calcFinalScore(fitScore, intentScore);
  const grade = getGrade(finalScore);

  const dealByGrade: Record<Grade, [number, number]> = {
    "A+": [40000, 80000],
    "A":  [20000, 45000],
    "B":  [10000, 25000],
    "C":  [5000, 15000],
    "D":  [0, 8000],
  };
  const [lo, hi] = dealByGrade[grade];
  const estimatedDealValue = Math.round((lo + rng() * (hi - lo)) / 1000) * 1000;

  const prospect: Prospect = { ...base, fitScore, intentScore, finalScore, grade, estimatedDealValue };

  const summary = generateSummary(prospect);
  const sources = generateSources(prospect);
  const { email, phone, addresses } = generateContactInfo(companyName, location, rng);
  const tailoredEmail = generateTailoredEmail(prospect);

  return { ...prospect, summary, sources, contactEmail: email, contactPhone: phone, addresses, tailoredEmail };
}

/* ---- aggregation helpers ---- */
export function kpis(prospects: Prospect[]) {
  const total = prospects.length;
  const aPlus = prospects.filter(p => p.grade === "A+");
  const aGrade = prospects.filter(p => p.grade === "A");
  const bGrade = prospects.filter(p => p.grade === "B");
  const pipelineValue = [...aPlus, ...aGrade].reduce((sum, p) => sum + p.estimatedDealValue, 0);
  return {
    total,
    aPlusCount: aPlus.length,
    aCount: aGrade.length,
    bCount: bGrade.length,
    pipelineValue,
    avgFinalScore: total ? Math.round(prospects.reduce((s, p) => s + p.finalScore, 0) / total) : 0,
  };
}

export function gradeCounts(prospects: Prospect[]) {
  const grades: Grade[] = ["A+", "A", "B", "C", "D"];
  const total = prospects.length;
  return grades.map((g) => {
    const count = prospects.filter(p => p.grade === g).length;
    return { grade: g, count, pct: total ? (count / total) * 100 : 0 };
  });
}

export function scoreDistribution(prospects: Prospect[], binCount: number, field: "finalScore" | "fitScore" | "intentScore" = "finalScore") {
  const step = 100 / binCount;
  return Array.from({ length: binCount }, (_, i) => {
    const from = Math.round(i * step);
    const to = Math.round((i + 1) * step);
    return { from, to, count: prospects.filter(p => p[field] >= from && p[field] < to).length };
  });
}

export function scatterPoints(prospects: Prospect[]) {
  return prospects.map(p => ({ x: p.intentScore, y: p.fitScore, grade: p.grade, company: p.company }));
}

export function topProspects(prospects: Prospect[], count: number, sortBy: "score" | "recent" | "deal") {
  return [...prospects]
    .sort((a, b) => {
      if (sortBy === "score") return b.finalScore - a.finalScore;
      if (sortBy === "deal") return b.estimatedDealValue - a.estimatedDealValue;
      return b.discoveredAt.getTime() - a.discoveredAt.getTime();
    })
    .slice(0, count);
}

export function ageInDays(date: Date) {
  return Math.floor((Date.now() - date.getTime()) / 86_400_000);
}

export const GRADE_COLORS: Record<Grade, { bg: string; text: string; border: string }> = {
  "A+": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  "A":  { bg: "bg-teal-50",   text: "text-teal-700",   border: "border-teal-200" },
  "B":  { bg: "bg-sky-50",    text: "text-sky-700",    border: "border-sky-200" },
  "C":  { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200" },
  "D":  { bg: "bg-rose-50",   text: "text-rose-700",   border: "border-rose-200" },
};

export const INDUSTRY_COLORS: Partial<Record<Industry, string>> = {
  "Cybersecurity":        "bg-violet-100 text-violet-700",
  "Defense Technology":   "bg-indigo-100 text-indigo-700",
  "Healthcare Tech":      "bg-teal-100 text-teal-700",
  "Bioscience":           "bg-green-100 text-green-700",
  "AI / SaaS":            "bg-blue-100 text-blue-700",
  "Advanced Manufacturing":"bg-orange-100 text-orange-700",
  "Venture Capital":      "bg-purple-100 text-purple-700",
  "Government Contractor":"bg-amber-100 text-amber-700",
  "Innovation Ecosystem": "bg-cyan-100 text-cyan-700",
  "Startup Accelerator":  "bg-pink-100 text-pink-700",
  "Event Production":     "bg-rose-100 text-rose-700",
};