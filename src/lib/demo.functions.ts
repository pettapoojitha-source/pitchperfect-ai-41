import { createServerFn } from "@tanstack/react-start";

export const DEMO_EMAIL = "demo@pitchpilot.ai";
export const DEMO_PASSWORD = "PitchPilot-Demo-2026";

/**
 * Ensures the shared demo account exists with the FarmAI deck and critique pre-loaded.
 * Public by design: it only ever provisions the fixed demo account and is idempotent.
 */
export const ensureDemoAccount = createServerFn({ method: "POST" }).handler(
  async (): Promise<{ ok: boolean; email: string; error?: string }> => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { FARMAI_DECK, FARMAI_CRITIQUE, DEMO_DESCRIPTION } = await import("@/lib/pitch/demo-data");

      // Find or create the demo user.
      let userId: string | undefined;
      const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
      userId = list?.users.find((u) => u.email?.toLowerCase() === DEMO_EMAIL)?.id;

      if (!userId) {
        const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
          email: DEMO_EMAIL,
          password: DEMO_PASSWORD,
          email_confirm: true,
          user_metadata: { full_name: "Demo Founder" },
        });
        if (error || !created.user) throw error ?? new Error("Could not create demo user");
        userId = created.user.id;
      } else {
        // Keep the demo password stable even if someone changed it in Settings.
        await supabaseAdmin.auth.admin.updateUserById(userId, { password: DEMO_PASSWORD });
      }

      await supabaseAdmin
        .from("profiles")
        .upsert({ id: userId, full_name: "Demo Founder", email: DEMO_EMAIL }, { onConflict: "id" });

      // Seed the FarmAI deck once.
      const { data: existing } = await supabaseAdmin
        .from("decks")
        .select("id")
        .eq("user_id", userId)
        .eq("is_demo", true)
        .limit(1);

      if (!existing || existing.length === 0) {
        const { data: deck, error: deckError } = await supabaseAdmin
          .from("decks")
          .insert({
            user_id: userId,
            startup_name: FARMAI_DECK.startupName,
            industry: FARMAI_DECK.industry,
            description: DEMO_DESCRIPTION,
            tagline: FARMAI_DECK.tagline,
            deck_data: FARMAI_DECK,
            original_deck_data: FARMAI_DECK,
            is_demo: true,
          })
          .select("id")
          .single();
        if (deckError || !deck) throw deckError ?? new Error("Could not seed demo deck");

        await supabaseAdmin.from("critiques").insert({
          deck_id: deck.id,
          user_id: userId,
          critic_persona: "Seed VC",
          critic_data: FARMAI_CRITIQUE,
        });
      }

      return { ok: true, email: DEMO_EMAIL };
    } catch (error) {
      console.error("[PitchPilot demo] provisioning failed", error);
      return { ok: false, email: DEMO_EMAIL, error: (error as Error).message };
    }
  },
);
