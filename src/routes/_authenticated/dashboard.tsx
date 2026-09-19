import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Gauge, Layers, Plus, ShieldCheck, Wrench } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { EmptyState, StatCard } from "@/components/common/primitives";
import { DeckCard } from "@/components/deck/DeckCard";
import { critiquesQuery, decksQuery } from "@/lib/decks";
import { firstName, greeting, useProfile, useSession } from "@/hooks/useAuth";
import { readinessLabel, readinessPercent, resolveHealth } from "@/lib/pitch/readiness";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — PitchPilot AI" },
      { name: "description", content: "Your pitch decks, critiques and readiness at a glance." },
      { property: "og:title", content: "Dashboard — PitchPilot AI" },
      { property: "og:description", content: "Your pitch decks, critiques and readiness at a glance." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useSession();
  const { data: profile } = useProfile(user);
  const decks = useQuery(decksQuery);
  const critiques = useQuery(critiquesQuery);

  const deckList = decks.data ?? [];
  const critiqueList = critiques.data ?? [];
  const latestFor = (deckId: string) => critiqueList.find((c) => c.deck_id === deckId);
  const critiqued = new Set(critiqueList.map((c) => c.deck_id)).size;
  const fixed = deckList.reduce((n, d) => n + (d.issues_fixed ?? 0), 0);
  const readiness =
    deckList.length === 0
      ? 0
      : Math.round(
          deckList.reduce((sum, d) => sum + readinessPercent(resolveHealth(d.deck_data, latestFor(d.id)?.critic_data)), 0) /
            deckList.length,
        );

  return (
    <div className="mx-auto max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between"
      >
        <div>
          <p className="eyebrow mb-2">Dashboard</p>
          <h1 className="text-4xl font-extrabold leading-[1.02] md:text-6xl">
            {greeting()}, <span className="text-gradient">{firstName(profile, user)}.</span>
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">What are you pitching today?</p>
        </div>
        <Button asChild variant="hero" size="xl">
          <Link to="/create">
            <Plus /> CREATE NEW PITCH
          </Link>
        </Button>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Pitches Created" value={deckList.length} icon={Layers} hint="Decks in your workspace" />
        <StatCard label="Decks Critiqued" value={critiqued} icon={ShieldCheck} hint="Challenged by the VC Critic" delay={0.05} />
        <StatCard label="Issues Fixed" value={fixed} icon={Wrench} hint="Fixes applied with AI" delay={0.1} />
        <StatCard
          label="Pitch Readiness"
          value={`${readiness}%`}
          icon={Gauge}
          hint={deckList.length ? readinessLabel(readiness) : "Diagnostic, not investment advice"}
          delay={0.15}
        />
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="font-display text-xl font-extrabold">Recent decks</h2>
        {deckList.length > 0 && (
          <Button asChild variant="link">
            <Link to="/decks">View all →</Link>
          </Button>
        )}
      </div>

      <div className="mt-4">
        {decks.isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-56 animate-pulse rounded-3xl bg-mint-ice" />
            ))}
          </div>
        ) : deckList.length === 0 ? (
          <EmptyState
            title="No decks yet. Your first pitch starts here."
            description="Describe your startup in a few sentences and PitchPilot will structure the investor story for you."
            cta="Create Your First Pitch →"
            to="/create"
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {deckList.slice(0, 6).map((d, i) => (
              <DeckCard key={d.id} deck={d} critique={latestFor(d.id)} index={i} userId={user?.id ?? ""} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
