import type { IntakeFormData, GeneratedDeckContent } from "./types";

/** Template-based deck content used when AI generation is unavailable or fails. */
export function buildFallbackDeck(intake: IntakeFormData): GeneratedDeckContent {
  const channels = intake.channels.join(", ") || "Paid Search, Paid Social, Display";
  const channelBullets = intake.channels.length > 0
    ? intake.channels.map(c => `• ${c}`).join("\n")
    : "• Paid Search\n• Paid Social\n• Display\n• Pre-Roll";

  return {
    slide1: {
      company: intake.companyName || intake.objective || "Your Growth Plan",
      subtitle: `Custom Media Strategy For ${intake.geography || "Your Market"}`,
      tagline: "Reaching High-Intent Customers Through Data-Driven Media",
    },
    slide2: {
      challenge: `• Current channels aren't delivering consistent, scalable results\n• Limited brand awareness in ${intake.geography || "the target market"}\n• Increasing competition requires a smarter media approach`,
      opportunity: `• Growing consumer demand in ${intake.geography || "your market"}\n• Untapped audience segments ready to engage and convert\n• Data-driven media can unlock measurable, repeatable ROI`,
      outcome: `• Increase qualified ${intake.objective === "E-Commerce Sales" ? "sales and revenue" : "leads and conversions"}\n• Reduce cost per acquisition over time\n• Build lasting brand recognition in ${intake.geography || "the market"}`,
    },
    slide3: {
      headline: `${intake.objective || "Your Goal"} — The moment is now.`,
      bullets: `• Consumer behavior is shifting in your favor right now\n• Competition is underinvesting in data-driven digital media\n• 434 Media has the tools, network, and track record to execute\n• The window to capture market share is open — let's move`,
    },
    slide4: {
      line1: `Acquire high-intent consumers through ${channels} with precision targeting.`,
      line2: "Build trust through relevant, educational content that guides decisions.",
      line3: "Retain and re-engage customers for compounding lifetime value.",
    },
    slide5: {
      channels,
      budget: intake.budget || "TBD",
      geography: intake.geography || "Local / Regional",
      audience: intake.audience || "Your core target audience",
    },
    slide6: {
      point1: intake.usp || "A differentiated value proposition drives higher conversion rates.",
      point2: intake.whyNow || "The market timing creates a clear first-mover advantage.",
      point3: intake.audience ? `${intake.audience} is reachable and ready to engage.` : "An engaged audience is already searching for this solution.",
    },
    slide7: {
      primary: intake.audience || "Core demographic with high purchase intent and brand affinity.",
      geography: intake.geography || "Target market and surrounding areas.",
      notes: intake.notes || "Targeting parameters to be refined during the strategy session.",
    },
    slide8: {
      steps: intake.objective === "E-Commerce Sales"
        ? "Discovery\nProduct Browse\nProduct View\nAdd to Cart\nCheckout\nRepeat Purchase\nBrand Advocate"
        : "Awareness\nSearch Intent\nWebsite Visit\nLead Form\nConsultation\nCustomer\nReferral",
    },
    slide9: {
      title: `${intake.objective || "Growth"} Success Story`,
      challenge: "Client faced stagnant lead volume and rising cost per acquisition.",
      solution: `Deployed integrated ${channels} campaign with audience-first creative strategy.`,
      outcome: "42% reduction in cost per lead. 3.1× increase in qualified conversions over 90 days.",
    },
    slide10: {
      kpi1: intake.objective === "E-Commerce Sales" ? "Return on Ad Spend" : "Cost Per Lead",
      kpi2: intake.objective === "E-Commerce Sales" ? "Cost Per Purchase" : "Lead-to-Close Rate",
      kpi3: intake.objective === "Brand Awareness" ? "Brand Search Lift" : "Conversion Rate",
      budget: intake.budget || "To be confirmed",
      channels,
    },
    slide11: {
      strategy: "• Brand Strategy & Positioning\n• Campaign Planning & Architecture\n• Audience Research & Segmentation\n• Competitive Intelligence",
      acquisition: channelBullets,
      optimization: "• A/B Testing & Creative Optimization\n• Conversion Rate Optimization\n• Real-Time Reporting & Analytics\n• Budget Pacing & Allocation",
    },
    slide12: {
      step1: "Kick-off call to align on goals, timeline, and creative direction.",
      step2: "Full media plan and strategy brief delivered within 5 business days.",
      step3: "Campaign launch with live reporting dashboard and weekly check-ins.",
      closing: intake.notes || `Let's build a media strategy that drives real results for ${intake.companyName || "your business"}.`,
    },
  };
}
