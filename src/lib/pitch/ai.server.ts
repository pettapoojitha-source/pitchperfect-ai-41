import { streamText } from "ai";
import type { z } from "zod";
import { createLovableAiGatewayProvider, PITCH_MODEL } from "@/lib/ai-gateway.server";
import {
  CritiqueSchema,
  DeckSchema,
  ImprovedSlideSchema,
  SLIDE_TITLES,
  type CreatePitchInput,
  type Critique,
  type CriticPersona,
  type Deck,
  type ImprovedSlide,
  type Slide,
} from "./types";

export class AiUnavailableError extends Error {
  status: number;
  constructor(message: string, status = 503) {
    super(message);
    this.status = status;
  }
}

const SYSTEM_INSTRUCTION = `You are an expert startup strategist, pitch-deck consultant, market reasoning assistant, and skeptical investor.

Your task is to transform a founder's startup information into a concise investor presentation.

Rules you must follow:
- Be specific to the founder's startup. Never produce generic filler.
- Do not invent factual evidence. Never manufacture customers, revenue, users, partnerships, investors, patents, market share, traction, testimonials or financial performance.
- Separate FOUNDER-PROVIDED information from ASSUMPTIONS and ESTIMATES.
- If information is missing, explicitly identify it in missingInformation and, where the slide depends on it, state it plainly in the content (e.g. "TRACTION NOT PROVIDED", "FUNDING ASK NOT PROVIDED", "TEAM DETAILS NOT PROVIDED") followed by what evidence the founder should collect.
- Any estimated market or financial number must be prefixed with "AI ESTIMATE — VALIDATE BEFORE PRESENTING:" and market sizing must explain the assumptions and methodology.
- Content must be presentation-ready: 3–5 short, strong bullets per slide. No paragraphs.
- Return ONLY valid JSON matching the requested schema. No markdown, no commentary.`;

function extractJson(text: string): unknown {
  let t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence?.[1]) t = fence[1].trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object found in model output");
  return JSON.parse(t.slice(start, end + 1));
}

function classify(error: unknown): AiUnavailableError {
  const anyErr = error as { statusCode?: number; status?: number; message?: string; responseBody?: string };
  const status = anyErr?.statusCode ?? anyErr?.status ?? 503;
  if (status === 402) return new AiUnavailableError("AI credits are exhausted for this workspace. Add credits to continue.", 402);
  if (status === 429) return new AiUnavailableError("AI is rate limited right now. Please try again in a moment.", 429);
  if (status === 401) return new AiUnavailableError("AI is not configured correctly.", 401);
  if (status === 403) return new AiUnavailableError("AI access is currently blocked for this workspace.", 403);
  return new AiUnavailableError("AI is temporarily unavailable.", typeof status === "number" ? status : 503);
}

async function callModel(system: string, prompt: string): Promise<string> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new AiUnavailableError("AI is not configured (missing key).", 401);
  const gateway = createLovableAiGatewayProvider(key);
  try {
    const result = streamText({
      model: gateway(PITCH_MODEL),
      system,
      prompt,
    });
    return await result.text;
  } catch (error) {
    console.error("[PitchPilot AI] gateway error", error);
    throw classify(error);
  }
}

/** Ask the model for JSON, validate with zod, and repair once if invalid. */
async function structured<T>(schema: z.ZodTypeAny, system: string, prompt: string, schemaHint: string): Promise<T> {
  const first = await callModel(system, `${prompt}\n\nJSON schema to follow exactly:\n${schemaHint}`);
  try {
    return schema.parse(extractJson(first)) as T;
  } catch (validationError) {
    const reason = validationError instanceof Error ? validationError.message.slice(0, 1200) : "invalid";
    console.warn("[PitchPilot AI] invalid JSON, attempting repair:", reason);
    const repaired = await callModel(
      system,
      `Your previous output did not match the required JSON schema.\nValidation error:\n${reason}\n\nPrevious output:\n${first.slice(0, 12000)}\n\nReturn corrected JSON only, matching this schema exactly:\n${schemaHint}`,
    );
    return schema.parse(extractJson(repaired)) as T;
  }
}

const DECK_SCHEMA_HINT = `{
  "startupName": string,
  "tagline": string,
  "industry": string,
  "oneLiner": string,
  "slides": [ exactly 11 items, in this order and numbered 1..11:
    ${SLIDE_TITLES.map((t, i) => `${i + 1}. ${t}`).join(", ")}
    each: { "number": number, "title": string (specific headline, not just the section name), "purpose": string, "content": string[] (3-5 bullets), "keyMetric": string ("" if none), "assumptions": string[], "missingInformation": string[] }
  ]
}`;

export function normalizeDeck(deck: Deck): Deck {
  const slides = deck.slides
    .slice(0, 11)
    .map((s, i) => ({ ...s, number: i + 1, title: s.title?.trim() || SLIDE_TITLES[i] || `Slide ${i + 1}` }));
  return { ...deck, slides };
}

export async function generateDeckWithAi(input: CreatePitchInput): Promise<Deck> {
  const optional = [
    ["Industry", input.industry],
    ["Target customer", input.targetCustomer],
    ["Business model", input.businessModel],
    ["Startup stage", input.startupStage],
    ["Funding stage", input.fundingStage],
    ["Current traction", input.traction],
    ["Competitors", input.competitors],
  ]
    .filter(([, v]) => v && v.trim())
    .map(([k, v]) => `- ${k}: ${v}`)
    .join("\n");

  const prompt = `FOUNDER-PROVIDED STARTUP DESCRIPTION:\n"""${input.description.trim()}"""\n\nFOUNDER-PROVIDED DETAILS:\n${optional || "- (none beyond the description)"}\n\nProduce an 11-slide investor deck as JSON. Treat only the text above as founder-provided facts. Everything else is an assumption or estimate and must be labelled as such.`;

  const deck = await structured<Deck>(DeckSchema, SYSTEM_INSTRUCTION, prompt, DECK_SCHEMA_HINT);
  return normalizeDeck(deck);
}

const CRITIC_SYSTEM = `You are a seasoned venture investor reviewing a startup pitch deck. You are rigorous, specific and fair. You find the holes before a real investor does.

Analyse the ENTIRE deck. Look for: weak arguments, unsupported assumptions, vague market size, weak differentiation, unclear business model, unrealistic projections, missing validation, weak go-to-market, unclear target customer, missing unit economics, missing funding logic, inconsistent claims.

Rules:
- Return 5 to 7 issues. Every issue must reference a specific slide number and quote or paraphrase what is on it. No generic criticism.
- severity is exactly one of: "critical", "warning", "info".
- Also produce 5–6 investorQuestions this persona would actually ask, grounded in the deck.
- Also produce pitchHealth: exactly 6 items with dimension names exactly: "Problem Clarity", "Market Evidence", "Differentiation", "Business Model", "Traction Evidence", "Financial Assumptions"; status is one of "Strong", "Clear", "Needs Evidence", "Needs Work", "Needs Validation", "Missing".
- This is a diagnostic, not investment advice.
- Return ONLY JSON.`;

const CRITIC_SCHEMA_HINT = `{
  "overallSummary": string (2-3 sentences),
  "issues": [ { "slideNumber": number, "category": string, "severity": "critical"|"warning"|"info", "title": string, "feedback": string, "whyItMatters": string, "suggestion": string } ] (5-7 items),
  "investorQuestions": string[] (5-6 items),
  "pitchHealth": [ { "dimension": string, "status": string, "note": string } ] (6 items)
}`;

const PERSONA_NOTES: Record<CriticPersona, string> = {
  "Angel Investor": "You invest personal money at the earliest stage. You care most about founder–market fit, problem authenticity, and whether a small cheque can create a meaningful milestone.",
  "Seed VC": "You lead seed rounds. You care about market size credibility, early evidence of demand, a believable go-to-market wedge and a path to Series A metrics.",
  "Growth VC": "You invest in scaling companies. You are unforgiving about unit economics, retention, CAC payback, realistic projections and operational scalability.",
  "Corporate Investor": "You invest strategically on behalf of a large corporation. You care about defensibility, partnership fit, regulatory risk, data rights and how this complements or threatens incumbents.",
};

export function deckToText(deck: Deck): string {
  return deck.slides
    .map(
      (s) =>
        `Slide ${s.number}: ${s.title}\n- ${s.content.join("\n- ")}${s.keyMetric ? `\nKey metric: ${s.keyMetric}` : ""}${s.assumptions.length ? `\nAssumptions: ${s.assumptions.join("; ")}` : ""}${s.missingInformation.length ? `\nMissing: ${s.missingInformation.join("; ")}` : ""}`,
    )
    .join("\n\n");
}

export async function critiqueDeckWithAi(deck: Deck, persona: CriticPersona): Promise<Critique> {
  const prompt = `INVESTOR PERSONA: ${persona}. ${PERSONA_NOTES[persona]}\n\nSTARTUP: ${deck.startupName} — ${deck.oneLiner}\nINDUSTRY: ${deck.industry}\n\nFULL DECK:\n${deckToText(deck)}\n\nReturn the critique as JSON.`;
  const critique = await structured<Critique>(CritiqueSchema, CRITIC_SYSTEM, prompt, CRITIC_SCHEMA_HINT);
  return {
    ...critique,
    issues: critique.issues.slice(0, 7).map((i, idx) => ({ ...i, id: i.id ?? `issue-${Date.now()}-${idx}` })),
  };
}

const IMPROVE_SYSTEM = `${SYSTEM_INSTRUCTION}\n\nYou are now rewriting ONE slide to address a specific investor criticism. Keep the same slide purpose. Make it sharper, more specific and more honest. Do not invent new facts — if the fix requires data the founder has not provided, say what to collect and label estimates. Return ONLY JSON.`;

const IMPROVE_SCHEMA_HINT = `{ "title": string, "content": string[] (3-5 bullets), "keyMetric": string, "assumptions": string[], "missingInformation": string[], "changeSummary": string (one sentence describing what changed) }`;

export async function improveSlideWithAi(
  deck: Deck,
  slide: Slide,
  issue: { title: string; feedback: string; suggestion: string; category: string },
): Promise<ImprovedSlide> {
  const prompt = `STARTUP CONTEXT: ${deck.startupName} — ${deck.oneLiner}\n\nDECK OVERVIEW (for consistency):\n${deckToText(deck).slice(0, 6000)}\n\nSLIDE TO REWRITE (Slide ${slide.number}):\nTitle: ${slide.title}\nPurpose: ${slide.purpose}\nContent:\n- ${slide.content.join("\n- ")}\nKey metric: ${slide.keyMetric}\nAssumptions: ${slide.assumptions.join("; ")}\nMissing: ${slide.missingInformation.join("; ")}\n\nINVESTOR CRITICISM (${issue.category}): ${issue.title}\n${issue.feedback}\nSuggested fix: ${issue.suggestion}\n\nRewrite only this slide as JSON.`;
  return structured<ImprovedSlide>(ImprovedSlideSchema, IMPROVE_SYSTEM, prompt, IMPROVE_SCHEMA_HINT);
}

const ASSISTANT_SYSTEM = `You are PitchPilot AI, a sharp, friendly pitch coach embedded in a founder's pitch-deck workspace. You have the founder's current deck in context. Answer concisely (under 180 words unless asked to rewrite), use short bullets when helpful, reference specific slides by number, never invent facts about the startup, and label any numbers you propose as estimates to validate. Plain text or light markdown only.`;

export async function askPilotWithAi(
  deck: Deck,
  question: string,
  history: { role: "user" | "assistant"; content: string }[],
): Promise<string> {
  const convo = history
    .slice(-8)
    .map((m) => `${m.role === "user" ? "Founder" : "PitchPilot"}: ${m.content}`)
    .join("\n");
  const prompt = `CURRENT DECK (${deck.startupName}):\n${deckToText(deck)}\n\n${convo ? `CONVERSATION SO FAR:\n${convo}\n\n` : ""}Founder: ${question}\nPitchPilot:`;
  return (await callModel(ASSISTANT_SYSTEM, prompt)).trim();
}
