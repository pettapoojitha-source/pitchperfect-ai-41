import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ShieldAlert } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/primitives";
import { critiquesQuery, decksQuery } from "@/lib/decks";

export const Route = createFileRoute("/_authenticated/critic/")({
  head: () => ({
    meta: [
      { title: "VC Critic — PitchPilot AI" },
      { name: "description", content: "Let's find the holes before an investor does." },
      { property: "og:title", content: "VC Critic — PitchPilot AI" },
      { property: "og:description", content: "Let's find the holes before an investor does." },
    ],
  }),
  component: CriticPicker,
});

function CriticPicker() {
  const decks = useQuery(decksQuery);
  const critiques = useQuery(critiquesQuery);
  const list = decks.data ?? [];
  return (
    <div className="bg-navy-gradient grain -m-4 min-h-[calc(100vh)] p-6 text-mint-ice md:-m-8 md:p-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-5xl">
        <p className="eyebrow text-mint-deep">Signature feature</p>
        <h1 className="mt-2 font-display text-5xl font-extrabold md:text-7xl">VC CRITIC</h1>
        <p className="mt-3 text-lg text-mint-ice/70">Let's find the holes before an investor does. Choose a deck to challenge.</p>
        {list.length === 0 && !decks.isLoading ? (
          <div className="mt-10">
            <EmptyState title="No decks to challenge yet." description="Create a pitch first, then bring it here for a skeptical review." cta="Create Your First Pitch →" to="/create" icon={ShieldAlert} />
          </div>
        ) : (
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {list.map((d, i) => {
              const c = critiques.data?.find((x) => x.deck_id === d.id);
              return (
                <motion.div key={d.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-dark flex items-center justify-between gap-4 rounded-3xl p-5">
                  <div className="min-w-0">
                    <p className="truncate font-display text-xl font-extrabold">{d.startup_name}</p>
                    <p className="text-sm text-mint-ice/60">
                      {d.industry} · {c ? `${c.critic_data.issues.length} issues by ${c.critic_persona}` : "Not challenged yet"}
                    </p>
                  </div>
                  <Button asChild variant="mint">
                    <Link to="/critic/$id" params={{ id: d.id }}>
                      <ShieldAlert /> {c ? "Review" : "Challenge"}
                    </Link>
                  </Button>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
