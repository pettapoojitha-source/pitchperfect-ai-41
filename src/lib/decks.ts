import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import type { Critique, CritiqueRow, Deck, DeckRow } from "@/lib/pitch/types";

const asDeckRow = (r: Record<string, unknown>) => r as unknown as DeckRow;
const asCritiqueRow = (r: Record<string, unknown>) => r as unknown as CritiqueRow;

export async function listDecks(): Promise<DeckRow[]> {
  const { data, error } = await supabase.from("decks").select("*").order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(asDeckRow);
}

export async function getDeck(id: string): Promise<DeckRow | null> {
  const { data, error } = await supabase.from("decks").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? asDeckRow(data) : null;
}

export async function listCritiques(): Promise<CritiqueRow[]> {
  const { data, error } = await supabase.from("critiques").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(asCritiqueRow);
}

export async function latestCritique(deckId: string): Promise<CritiqueRow | null> {
  const { data, error } = await supabase
    .from("critiques")
    .select("*")
    .eq("deck_id", deckId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? asCritiqueRow(data) : null;
}

export const decksQuery = queryOptions({ queryKey: ["decks"], queryFn: listDecks });
export const critiquesQuery = queryOptions({ queryKey: ["critiques"], queryFn: listCritiques });
export const deckQuery = (id: string) => queryOptions({ queryKey: ["deck", id], queryFn: () => getDeck(id) });
export const deckCritiqueQuery = (id: string) =>
  queryOptions({ queryKey: ["critique", id], queryFn: () => latestCritique(id) });

export async function createDeck(args: {
  userId: string;
  description: string;
  deck: Deck;
  isDemo?: boolean;
}): Promise<DeckRow> {
  const { data, error } = await supabase
    .from("decks")
    .insert({
      user_id: args.userId,
      startup_name: args.deck.startupName,
      industry: args.deck.industry,
      description: args.description,
      tagline: args.deck.tagline,
      deck_data: args.deck as unknown as Json,
      original_deck_data: args.deck as unknown as Json,
      is_demo: args.isDemo ?? false,
    })
    .select("*")
    .single();
  if (error) throw error;
  return asDeckRow(data);
}

export async function updateDeckData(id: string, deck: Deck, extra?: { issuesFixedDelta?: number; current?: number }) {
  const patch: {
    deck_data: Json;
    startup_name: string;
    tagline: string;
    industry: string;
    issues_fixed?: number;
  } = {
    deck_data: deck as unknown as Json,
    startup_name: deck.startupName,
    tagline: deck.tagline,
    industry: deck.industry,
  };
  if (extra?.issuesFixedDelta) patch.issues_fixed = (extra.current ?? 0) + extra.issuesFixedDelta;
  const { error } = await supabase.from("decks").update(patch).eq("id", id);
  if (error) throw error;
}

export async function recordSlideEdit(args: { deckId: string; userId: string; slideNumber: number; content: unknown }) {
  const { error } = await supabase.from("slide_edits").insert({
    deck_id: args.deckId,
    user_id: args.userId,
    slide_number: args.slideNumber,
    content: args.content as Json,
  });
  if (error) console.warn("slide edit log failed", error.message);
}

export async function deleteDeck(id: string) {
  const { error } = await supabase.from("decks").delete().eq("id", id);
  if (error) throw error;
}

export async function duplicateDeck(row: DeckRow, userId: string): Promise<DeckRow> {
  const copy: Deck = { ...row.deck_data, startupName: `${row.deck_data.startupName} (copy)` };
  return createDeck({ userId, description: row.description, deck: copy });
}

export async function saveCritique(args: { deckId: string; userId: string; persona: string; critique: Critique }) {
  const { data, error } = await supabase
    .from("critiques")
    .insert({
      deck_id: args.deckId,
      user_id: args.userId,
      critic_persona: args.persona,
      critic_data: args.critique as unknown as Json,
    })
    .select("*")
    .single();
  if (error) throw error;
  return asCritiqueRow(data);
}

export async function updateCritiqueData(id: string, critique: Critique) {
  const { error } = await supabase
    .from("critiques")
    .update({ critic_data: critique as unknown as Json })
    .eq("id", id);
  if (error) throw error;
}
