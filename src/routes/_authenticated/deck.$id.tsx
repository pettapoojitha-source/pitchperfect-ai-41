import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  MessageSquareText,
  MonitorPlay,
  Pencil,
  Presentation,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EmptyState, SectionLabel } from "@/components/common/primitives";
import { SlideCanvas } from "@/components/deck/SlideCanvas";
import { SlideEditor } from "@/components/deck/SlideEditor";
import { AskPilotSheet } from "@/components/deck/AskPilot";
import { PitchHealthPanel } from "@/components/deck/PitchHealthPanel";
import { deckCritiqueQuery, deckQuery, recordSlideEdit, updateDeckData } from "@/lib/decks";
import { exportPdf, exportPptx } from "@/lib/export/pptx";
import { resolveHealth } from "@/lib/pitch/readiness";
import type { Deck, Slide } from "@/lib/pitch/types";
import { useSession } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const search = z.object({ slide: z.number().int().min(1).max(11).optional(), edit: z.number().optional() });

export const Route = createFileRoute("/_authenticated/deck/$id")({
  validateSearch: (s) => search.parse(s),
  head: () => ({
    meta: [
      { title: "Deck Workspace — PitchPilot AI" },
      { name: "description", content: "Review, edit and refine your 11-slide investor deck." },
      { property: "og:title", content: "Deck Workspace — PitchPilot AI" },
      { property: "og:description", content: "Review, edit and refine your investor deck." },
    ],
  }),
  component: DeckWorkspace,
});

function DeckWorkspace() {
  const { id } = Route.useParams();
  const { slide: initialSlide, edit } = Route.useSearch();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useSession();
  const deckQ = useQuery(deckQuery(id));
  const critiqueQ = useQuery(deckCritiqueQuery(id));

  const [current, setCurrent] = useState(initialSlide ?? 1);
  const [editing, setEditing] = useState(!!edit);
  const [asking, setAsking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [dir, setDir] = useState(1);

  useEffect(() => {
    if (initialSlide) setCurrent(initialSlide);
  }, [initialSlide]);

  const row = deckQ.data;
  const deck = row?.deck_data;
  const health = useMemo(() => (deck ? resolveHealth(deck, critiqueQ.data?.critic_data) : []), [deck, critiqueQ.data]);

  useEffect(() => {
    if (editing) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "TEXTAREA" || (e.target as HTMLElement)?.tagName === "INPUT") return;
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (deckQ.isLoading) return <div className="mx-auto max-w-7xl"><div className="aspect-video w-full animate-pulse rounded-3xl bg-mint-ice" /></div>;
  if (!row || !deck) {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState title="Deck not found" description="This deck doesn't exist or belongs to another account." cta="Back to My Decks" to="/decks" icon={FileText} />
      </div>
    );
  }

  const slide = deck.slides[current - 1]!;
  const originalSlide = row.original_deck_data?.slides[current - 1];
  const slideIssues = critiqueQ.data?.critic_data.issues.filter((i) => i.slideNumber === current) ?? [];

  function go(delta: number) {
    setDir(delta);
    setCurrent((c) => Math.min(deck!.slides.length, Math.max(1, c + delta)));
  }

  const saveSlide = async (next: Slide, opts?: { silent?: boolean }) => {
    setSaving(true);
    try {
      const nextDeck: Deck = { ...deck, slides: deck.slides.map((s) => (s.number === next.number ? next : s)) };
      await updateDeckData(row.id, nextDeck);
      if (user) recordSlideEdit({ deckId: row.id, userId: user.id, slideNumber: next.number, content: next });
      qc.setQueryData(deckQuery(id).queryKey, () => ({ ...row, deck_data: nextDeck, updated_at: new Date().toISOString() }));
      qc.invalidateQueries({ queryKey: ["decks"] });
      setSavedAt(Date.now());
      if (!opts?.silent) toast.success("Changes saved ✓");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const doExport = async (kind: "pptx" | "pdf") => {
    try {
      if (kind === "pptx") {
        await exportPptx(deck);
        toast.success("PowerPoint exported ✓");
      } else {
        await exportPdf(deck);
        toast.success("PDF exported ✓");
      }
    } catch (e) {
      console.error(e);
      toast.error("Export failed. Please try again.");
    }
  };

  return (
    <div className="mx-auto flex max-w-[1500px] flex-col gap-4">
      {/* Top bar */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow">{deck.industry || "Pitch deck"}</p>
          <h1 className="truncate text-2xl font-extrabold md:text-3xl">{deck.startupName}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant={editing ? "hero" : "outline"} onClick={() => setEditing((e) => !e)}>
            <Pencil /> {editing ? "Editing" : "Edit"}
          </Button>
          <Button asChild variant="outline">
            <Link to="/critic/$id" params={{ id: row.id }}>
              <ShieldAlert /> Critique
            </Link>
          </Button>
          <Button variant="outline" onClick={() => setAsking(true)}>
            <MessageSquareText /> Ask AI
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="mint">
                <Download /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl">
              <DropdownMenuItem onClick={() => doExport("pptx")}><Presentation className="mr-2 h-4 w-4" /> PowerPoint (.pptx)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => doExport("pdf")}><FileText className="mr-2 h-4 w-4" /> PDF</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/presentation/$id", params: { id: row.id } })}>
                <MonitorPlay className="mr-2 h-4 w-4" /> Presentation Mode
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-[180px_1fr_320px] xl:grid-cols-[200px_1fr_340px]">
        {/* Thumbnails */}
        <aside className="order-2 flex gap-2 overflow-x-auto lg:order-1 lg:max-h-[calc(100vh-11rem)] lg:flex-col lg:overflow-y-auto lg:pr-1">
          {deck.slides.map((s) => (
            <button
              key={s.number}
              onClick={() => {
                setDir(s.number > current ? 1 : -1);
                setCurrent(s.number);
              }}
              className={cn(
                "group relative w-40 shrink-0 rounded-xl p-1 text-left transition-all lg:w-full",
                s.number === current ? "bg-navy shadow-soft" : "hover:bg-mint-ice",
              )}
            >
              <SlideCanvas deck={deck} slide={s} variant="thumb" />
              <span className={cn("mt-1 block truncate px-1 text-[11px] font-semibold", s.number === current ? "text-mint-ice" : "text-cadet-deep")}>
                {s.number}. {s.title}
              </span>
            </button>
          ))}
        </aside>

        {/* Main slide */}
        <section className="order-1 lg:order-2">
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={slide.number}
                custom={dir}
                initial={{ opacity: 0, x: 40 * dir, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -40 * dir, scale: 0.98 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <SlideCanvas deck={deck} slide={slide} />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <Button variant="outline" onClick={() => go(-1)} disabled={current === 1}>
              <ChevronLeft /> Previous
            </Button>
            <span className="font-display text-sm font-extrabold tracking-wide text-cadet-deep">
              Slide {current} / {deck.slides.length}
            </span>
            <Button variant="outline" onClick={() => go(1)} disabled={current === deck.slides.length}>
              Next <ChevronRight />
            </Button>
          </div>
        </section>

        {/* Right panel */}
        <aside className="order-3 flex flex-col gap-4 lg:max-h-[calc(100vh-11rem)] lg:overflow-y-auto">
          {editing ? (
            <div className="rounded-3xl border border-mint-deep bg-card p-5 shadow-glow lg:min-h-[520px]">
              <SlideEditor slide={slide} original={originalSlide} onSave={saveSlide} onCancel={() => setEditing(false)} saving={saving} savedAt={savedAt} />
            </div>
          ) : (
            <>
              <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
                <SectionLabel>AI Insights</SectionLabel>
                <p className="mt-2 text-sm text-muted-foreground">{slide.purpose || "This slide's role in the investor story."}</p>

                {slide.keyMetric && (
                  <div className="mt-4 rounded-2xl bg-mint-ice p-3">
                    <p className="eyebrow text-[10px]">Key metric</p>
                    <p className="text-sm font-bold text-navy">{slide.keyMetric}</p>
                  </div>
                )}

                {slide.assumptions.length > 0 && (
                  <div className="mt-4">
                    <p className="eyebrow text-[10px] text-warning">Assumptions</p>
                    <ul className="mt-1.5 space-y-1.5 text-sm text-foreground">
                      {slide.assumptions.map((a, i) => (
                        <li key={i} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />{a}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {slide.missingInformation.length > 0 && (
                  <div className="mt-4">
                    <p className="eyebrow text-[10px] text-critical">Missing information</p>
                    <ul className="mt-1.5 space-y-1.5 text-sm text-foreground">
                      {slide.missingInformation.map((a, i) => (
                        <li key={i} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-critical" />{a}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {slideIssues.length > 0 && (
                  <div className="mt-4 border-t border-border pt-4">
                    <p className="eyebrow text-[10px]">VC Critic flagged</p>
                    <ul className="mt-1.5 space-y-1.5">
                      {slideIssues.map((i) => (
                        <li key={i.id ?? i.title} className="text-sm">
                          <Link to="/critic/$id" params={{ id: row.id }} className="font-semibold text-cadet-deep underline-offset-4 hover:underline">
                            {i.title}
                          </Link>
                          {i.resolved && <span className="ml-2 text-xs text-cadet">resolved</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <PitchHealthPanel health={health} compact />
            </>
          )}
        </aside>
      </div>

      <AskPilotSheet open={asking} onOpenChange={setAsking} deck={deck} currentSlide={current} />
    </div>
  );
}
