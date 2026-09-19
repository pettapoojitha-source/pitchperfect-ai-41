import { z } from "zod";

export const SLIDE_TITLES = [
  "Cover",
  "Problem",
  "Solution",
  "Market Opportunity",
  "Product / How It Works",
  "Business Model",
  "Competition & Differentiation",
  "Go-To-Market",
  "Traction / Validation",
  "Financials & Funding Ask",
  "Team & Vision",
] as const;

export const SlideSchema = z.object({
  number: z.number().int(),
  title: z.string(),
  purpose: z.string().default(""),
  content: z.array(z.string()).default([]),
  keyMetric: z.string().default(""),
  assumptions: z.array(z.string()).default([]),
  missingInformation: z.array(z.string()).default([]),
});

export const DeckSchema = z.object({
  startupName: z.string().min(1),
  tagline: z.string().default(""),
  industry: z.string().default(""),
  oneLiner: z.string().default(""),
  slides: z.array(SlideSchema).length(11),
});

export type Slide = z.infer<typeof SlideSchema>;
export type Deck = z.infer<typeof DeckSchema>;

export const SeveritySchema = z.enum(["critical", "warning", "info"]);
export type Severity = z.infer<typeof SeveritySchema>;

export const HealthStatusSchema = z.enum([
  "Strong",
  "Clear",
  "Needs Evidence",
  "Needs Work",
  "Needs Validation",
  "Missing",
]);
export type HealthStatus = z.infer<typeof HealthStatusSchema>;

export const HEALTH_DIMENSIONS = [
  "Problem Clarity",
  "Market Evidence",
  "Differentiation",
  "Business Model",
  "Traction Evidence",
  "Financial Assumptions",
] as const;
export type HealthDimension = (typeof HEALTH_DIMENSIONS)[number];

export const IssueSchema = z.object({
  id: z.string().optional(),
  slideNumber: z.number().int(),
  category: z.string(),
  severity: SeveritySchema,
  title: z.string(),
  feedback: z.string(),
  whyItMatters: z.string().default(""),
  suggestion: z.string().default(""),
  resolved: z.boolean().optional(),
});
export type Issue = z.infer<typeof IssueSchema>;

export const PitchHealthSchema = z.object({
  dimension: z.string(),
  status: HealthStatusSchema,
  note: z.string().default(""),
});
export type PitchHealthItem = z.infer<typeof PitchHealthSchema>;

export const CritiqueSchema = z.object({
  overallSummary: z.string(),
  issues: z.array(IssueSchema).min(1),
  investorQuestions: z.array(z.string()).default([]),
  pitchHealth: z.array(PitchHealthSchema).default([]),
});
export type Critique = z.infer<typeof CritiqueSchema>;

export const ImprovedSlideSchema = z.object({
  title: z.string(),
  content: z.array(z.string()),
  keyMetric: z.string().default(""),
  assumptions: z.array(z.string()).default([]),
  missingInformation: z.array(z.string()).default([]),
  changeSummary: z.string().default(""),
});
export type ImprovedSlide = z.infer<typeof ImprovedSlideSchema>;

export type CreatePitchInput = {
  description: string;
  industry?: string | undefined;
  targetCustomer?: string | undefined;
  businessModel?: string | undefined;
  startupStage?: string | undefined;
  fundingStage?: string | undefined;
  traction?: string | undefined;
  competitors?: string | undefined;
};

export type CriticPersona = "Angel Investor" | "Seed VC" | "Growth VC" | "Corporate Investor";
export const CRITIC_PERSONAS: CriticPersona[] = [
  "Angel Investor",
  "Seed VC",
  "Growth VC",
  "Corporate Investor",
];

/** Confidence tag derived from bullet text conventions. */
export type ConfidenceTag = "Verified Input" | "Founder Provided" | "AI Estimate" | "Missing Data";

export function tagForText(text: string): ConfidenceTag | null {
  const t = text.toUpperCase();
  if (t.includes("AI ESTIMATE")) return "AI Estimate";
  if (t.includes("NOT PROVIDED") || t.includes("MISSING")) return "Missing Data";
  if (t.includes("FOUNDER")) return "Founder Provided";
  if (t.includes("VERIFIED")) return "Verified Input";
  return null;
}

export type DeckRow = {
  id: string;
  user_id: string;
  startup_name: string;
  industry: string;
  description: string;
  tagline: string;
  deck_data: Deck;
  original_deck_data: Deck | null;
  is_demo: boolean;
  issues_fixed: number;
  created_at: string;
  updated_at: string;
};

export type CritiqueRow = {
  id: string;
  deck_id: string;
  user_id: string;
  critic_persona: string;
  critic_data: Critique;
  created_at: string;
};
