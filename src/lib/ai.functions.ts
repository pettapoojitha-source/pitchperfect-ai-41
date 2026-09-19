import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { DeckSchema, SlideSchema, type Critique, type Deck, type ImprovedSlide } from "@/lib/pitch/types";

export type AiResult<T> = { ok: true; data: T } | { ok: false; error: string; status: number };

async function guard<T>(fn: () => Promise<T>): Promise<AiResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (error) {
    const { AiUnavailableError } = await import("@/lib/pitch/ai.server");
    if (error instanceof AiUnavailableError) return { ok: false, error: error.message, status: error.status };
    console.error("[PitchPilot AI] unexpected", error);
    return { ok: false, error: "AI returned an unexpected response.", status: 500 };
  }
}

// Simple per-user, per-action in-memory throttle (best effort on stateless workers).
const lastCall = new Map<string, number>();
function throttle(key: string, ms: number) {
  const now = Date.now();
  const prev = lastCall.get(key) ?? 0;
  if (now - prev < ms) throw Object.assign(new Error("Please wait a moment before trying again."), { status: 429 });
  lastCall.set(key, now);
}

const CreateInput = z.object({
  description: z.string().min(20),
  industry: z.string().optional(),
  targetCustomer: z.string().optional(),
  businessModel: z.string().optional(),
  startupStage: z.string().optional(),
  fundingStage: z.string().optional(),
  traction: z.string().optional(),
  competitors: z.string().optional(),
});

export const generateDeck = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CreateInput.parse(input))
  .handler(async ({ data, context }): Promise<AiResult<Deck>> => {
    try {
      throttle(`gen:${context.userId}`, 4000);
    } catch (e) {
      return { ok: false, error: (e as Error).message, status: 429 };
    }
    return guard(async () => {
      const { generateDeckWithAi } = await import("@/lib/pitch/ai.server");
      return generateDeckWithAi(data);
    });
  });

const CritiqueInput = z.object({
  deck: DeckSchema,
  persona: z.enum(["Angel Investor", "Seed VC", "Growth VC", "Corporate Investor"]),
});

export const critiqueDeck = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CritiqueInput.parse(input))
  .handler(async ({ data, context }): Promise<AiResult<Critique>> => {
    try {
      throttle(`critic:${context.userId}`, 4000);
    } catch (e) {
      return { ok: false, error: (e as Error).message, status: 429 };
    }
    return guard(async () => {
      const { critiqueDeckWithAi } = await import("@/lib/pitch/ai.server");
      return critiqueDeckWithAi(data.deck, data.persona);
    });
  });

const ImproveInput = z.object({
  deck: DeckSchema,
  slide: SlideSchema,
  issue: z.object({ title: z.string(), feedback: z.string(), suggestion: z.string(), category: z.string() }),
});

export const improveSlide = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ImproveInput.parse(input))
  .handler(async ({ data }): Promise<AiResult<ImprovedSlide>> =>
    guard(async () => {
      const { improveSlideWithAi } = await import("@/lib/pitch/ai.server");
      return improveSlideWithAi(data.deck, data.slide, data.issue);
    }),
  );

const AskInput = z.object({
  deck: DeckSchema,
  question: z.string().min(1).max(2000),
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })).default([]),
});

export const askPilot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AskInput.parse(input))
  .handler(async ({ data }): Promise<AiResult<string>> =>
    guard(async () => {
      const { askPilotWithAi } = await import("@/lib/pitch/ai.server");
      return askPilotWithAi(data.deck, data.question, data.history);
    }),
  );
