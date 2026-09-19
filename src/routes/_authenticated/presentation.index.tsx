import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MonitorPlay, Play } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/components/common/primitives";
import { SlideCanvas } from "@/components/deck/SlideCanvas";
import { decksQuery } from "@/lib/decks";

export const Route = createFileRoute("/_authenticated/presentation/")({
  head: () => ({
    meta: [
      { title: "Presentation — PitchPilot AI" },
      { name: "description", content: "Pick a deck and present it fullscreen." },
      { property: "og:title", content: "Presentation — PitchPilot AI" },
      { property: "og:description", content: "Pick a deck and present it fullscreen." },
    ],
  }),
  component: PresentationPicker,
});

function PresentationPicker() {
  const decks = useQuery(decksQuery);
  const list = decks.data ?? [];
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader eyebrow="Presentation" title="Ready to present?" subtitle="Pick a deck. Arrow keys to navigate, ESC to exit." />
      {list.length === 0 && !decks.isLoading ? (
        <EmptyState title="Nothing to present yet." description="Create a pitch first — then walk into the room prepared." cta="Create Your First Pitch →" to="/create" icon={MonitorPlay} />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {list.map((d, i) => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card-hover rounded-3xl border border-border bg-card p-4 shadow-soft">
              <SlideCanvas deck={d.deck_data} slide={d.deck_data.slides[0]!} variant="thumb" className="rounded-2xl" />
              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-display text-lg font-extrabold">{d.startup_name}</p>
                  <p className="text-xs text-muted-foreground">{d.deck_data.slides.length} slides · {d.industry}</p>
                </div>
                <Button asChild variant="hero">
                  <Link to="/presentation/$id" params={{ id: d.id }}>
                    <Play /> Start
                  </Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
