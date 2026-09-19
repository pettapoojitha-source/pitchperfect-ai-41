import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/components/common/primitives";
import { DeckCard } from "@/components/deck/DeckCard";
import { critiquesQuery, decksQuery } from "@/lib/decks";
import { useSession } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/decks")({
  head: () => ({
    meta: [
      { title: "My Decks — PitchPilot AI" },
      { name: "description", content: "All your pitch decks in one place: open, edit, critique, duplicate, export." },
      { property: "og:title", content: "My Decks — PitchPilot AI" },
      { property: "og:description", content: "All your pitch decks in one place." },
    ],
  }),
  component: Decks,
});

function Decks() {
  const { user } = useSession();
  const decks = useQuery(decksQuery);
  const critiques = useQuery(critiquesQuery);
  const list = decks.data ?? [];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        eyebrow="My Decks"
        title="Every pitch you've built."
        subtitle="Only you can see these. Open, refine, challenge and export whenever you're ready."
        actions={
          <Button asChild variant="hero" size="lg">
            <Link to="/create">
              <Plus /> New Pitch
            </Link>
          </Button>
        }
      />
      {decks.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-3xl bg-mint-ice" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          title="No decks yet. Your first pitch starts here."
          description="Describe your startup and PitchPilot will structure the investor story."
          cta="Create Your First Pitch →"
          to="/create"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((d, i) => (
            <DeckCard
              key={d.id}
              deck={d}
              critique={critiques.data?.find((c) => c.deck_id === d.id)}
              index={i}
              userId={user?.id ?? ""}
              full
            />
          ))}
        </div>
      )}
    </div>
  );
}
