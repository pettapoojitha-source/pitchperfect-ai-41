import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, CheckCircle2, HelpCircle, Loader2, Pencil, ShieldAlert, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState, SEVERITY_META, SeverityBadge } from "@/components/common/primitives";
import { PitchHealthPanel } from "@/components/deck/PitchHealthPanel";
import { AiUnavailableDialog } from "@/components/common/AiUnavailable";
import { FixDialog } from "@/components/critic/FixDialog";
import { critiqueDeck, improveSlide } from "@/lib/ai.functions";
import { deckCritiqueQuery, deckQuery, saveCritique, updateCritiqueData, updateDeckData } from "@/lib/decks";
import { FARMAI_CRITIQUE } from "@/lib/pitch/demo-data";
import { resolveHealth } from "@/lib/pitch/readiness";
import { CRITIC_PERSONAS, type CriticPersona, type Deck, type ImprovedSlide, type Issue, type Severity, type Slide } from "@/lib/pitch/types";
import { useSession } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/critic/$id")({
  head: () => ({
    meta: [
      { title: "VC Critic — PitchPilot AI" },
      { name: "description", content: "Challenge your pitch with a skeptical investor persona and fix the weak spots with AI." },
      { property: "og:title", content: "VC Critic — PitchPilot AI" },
      { property: "og:description", content: "Let's find the holes before an investor does." },
    ],
  }),
  component: CriticPage,
});

const ORDER: Severity[] = ["critical", "warning", "info"];

function CriticPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const { user } = useSession();
  const deckQ = useQuery(deckQuery(id));
  const critiqueQ = useQuery(deckCritiqueQuery(id));
  const runCritique = useServerFn(critiqueDeck);
  const runImprove = useServerFn(improveSlide);

  const [persona, setPersona] = useState<CriticPersona>("Seed VC");
  const [analyzing, setAnalyzing] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [fix, setFix] = useState<{ issue: Issue; slide: Slide } | null>(null);
  const [improved, setImproved] = useState<ImprovedSlide | null>(null);
  const [improving, setImproving] = useState(false);

  const row = deckQ.data;
  const deck = row?.deck_data;
  const critique = critiqueQ.data;

  if (deckQ.isLoading) return <div className="h-64 animate-pulse rounded-3xl bg-mint-ice" />;
  if (!row || !deck) return <EmptyState title="Deck not found" description="This deck doesn't exist or belongs to another account." cta="Back to My Decks" to="/decks" />;

  const persist = async (data: typeof FARMAI_CRITIQUE, usedPersona: string) => {
    if (!user) return;
    const withIds = { ...data, issues: data.issues.map((i, n) => ({ ...i, id: i.id ?? `${Date.now()}-${n}`, resolved: false })) };
    await saveCritique({ deckId: row.id, userId: user.id, persona: usedPersona, critique: withIds });
    qc.invalidateQueries({ queryKey: ["critique", id] });
    qc.invalidateQueries({ queryKey: ["critiques"] });
    toast.success("Critique complete ✓");
  };

  const challenge = async () => {
    setFailure(null);
    setAnalyzing(true);
    try {
      const res = await runCritique({ data: { deck, persona } });
      if (!res.ok) {
        setFailure(res.error);
        return;
      }
      await persist(res.data, persona);
    } catch (e) {
      setFailure((e as Error).message);
    } finally {
      setAnalyzing(false);
    }
  };

  const openFix = async (issue: Issue) => {
    const slide = deck.slides.find((s) => s.number === issue.slideNumber) ?? deck.slides[0]!;
    setFix({ issue, slide });
    setImproved(null);
    setImproving(true);
    try {
      const res = await runImprove({
        data: { deck, slide, issue: { title: issue.title, feedback: issue.feedback, suggestion: issue.suggestion, category: issue.category } },
      });
      if (!res.ok) {
        setFix(null);
        setFailure(res.error);
        return;
      }
      setImproved(res.data);
    } catch (e) {
      setFix(null);
      setFailure((e as Error).message);
    } finally {
      setImproving(false);
    }
  };

  const applyFix = async () => {
    if (!fix || !improved || !critique) return;
    const nextSlide: Slide = { ...fix.slide, ...improved };
    const nextDeck: Deck = { ...deck, slides: deck.slides.map((s) => (s.number === nextSlide.number ? nextSlide : s)) };
    try {
      await updateDeckData(row.id, nextDeck, { issuesFixedDelta: 1, current: row.issues_fixed });
      const nextCritique = { ...critique.critic_data, issues: critique.critic_data.issues.map((i) => (i.id === fix.issue.id ? { ...i, resolved: true } : i)) };
      await updateCritiqueData(critique.id, nextCritique);
      qc.invalidateQueries({ queryKey: ["deck", id] });
      qc.invalidateQueries({ queryKey: ["decks"] });
      qc.invalidateQueries({ queryKey: ["critique", id] });
      qc.invalidateQueries({ queryKey: ["critiques"] });
      toast.success("Fix applied ✓");
      setFix(null);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const data = critique?.critic_data;
  const health = resolveHealth(deck, data);

  return (
    <div className="bg-navy-gradient grain -m-4 min-h-screen p-6 text-mint-ice md:-m-8 md:p-12">
      <AiUnavailableDialog
        open={!!failure}
        message={failure ?? undefined}
        onRetry={() => { setFailure(null); challenge(); }}
        onDemo={row.is_demo || deck.startupName.toLowerCase().includes("farmai") ? () => { setFailure(null); persist(FARMAI_CRITIQUE, persona); } : undefined}
        demoLabel="Use Demo Critique"
        onClose={() => setFailure(null)}
      />
      <FixDialog open={!!fix} onClose={() => setFix(null)} deck={deck} slide={fix?.slide ?? null} issue={fix?.issue ?? null} improved={improved} loading={improving} onApply={applyFix} />

      <div className="mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow text-mint-deep">{deck.startupName}</p>
            <h1 className="mt-2 font-display text-5xl font-extrabold md:text-7xl">VC CRITIC</h1>
            <p className="mt-3 text-lg text-mint-ice/70">Let's find the holes before an investor does.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Select value={persona} onValueChange={(v) => setPersona(v as CriticPersona)}>
              <SelectTrigger className="h-12 w-52 rounded-full border-mint-ice/20 bg-mint-ice/10 text-mint-ice"><SelectValue /></SelectTrigger>
              <SelectContent>{CRITIC_PERSONAS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
            <Button variant="mint" size="xl" onClick={challenge} disabled={analyzing}>
              {analyzing ? <><Loader2 className="animate-spin" /> Analyzing your pitch…</> : <>{data ? "RE-CHALLENGE" : "CHALLENGE MY PITCH"} <ArrowRight /></>}
            </Button>
          </div>
        </motion.div>

        {!data && !analyzing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-dark mt-12 rounded-3xl p-10 text-center">
            <ShieldAlert className="mx-auto h-10 w-10 text-mint-deep" />
            <h2 className="mt-4 font-display text-2xl font-extrabold">Nothing challenged yet.</h2>
            <p className="mx-auto mt-2 max-w-md text-mint-ice/70">Pick an investor persona and PitchPilot will read all {deck.slides.length} slides looking for weak arguments, unsupported assumptions and missing evidence.</p>
          </motion.div>
        )}

        {analyzing && (
          <div className="glass-dark mt-12 flex items-center gap-4 rounded-3xl p-8">
            <Loader2 className="h-6 w-6 animate-spin text-mint-deep" />
            <div>
              <p className="font-display font-extrabold">Reading the deck as a {persona}…</p>
              <p className="text-sm text-mint-ice/60">Cross-checking claims across slides. This takes about 20–40 seconds.</p>
            </div>
          </div>
        )}

        {data && !analyzing && (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
            <div className="space-y-8">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-dark rounded-3xl p-6">
                <p className="eyebrow text-mint-deep">{critique?.critic_persona} verdict</p>
                <p className="mt-2 text-base leading-relaxed text-mint-ice/90">{data.overallSummary}</p>
              </motion.div>

              {ORDER.map((sev) => {
                const items = data.issues.filter((i) => i.severity === sev);
                if (items.length === 0) return null;
                const meta = SEVERITY_META[sev];
                return (
                  <section key={sev}>
                    <div className="mb-3 flex items-center gap-3">
                      <span className={cn("h-3 w-3 rounded-full", meta.dot)} />
                      <h2 className="font-display text-lg font-extrabold uppercase tracking-wider">{meta.label}</h2>
                      <span className="text-sm text-mint-ice/50">— {meta.description}</span>
                    </div>
                    <div className="space-y-3">
                      <AnimatePresence>
                        {items.map((issue, i) => (
                          <motion.article
                            key={issue.id ?? i}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                            className={cn("rounded-3xl border bg-card p-5 text-foreground shadow-soft", issue.resolved ? "border-mint-deep opacity-80" : meta.border)}
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <SeverityBadge severity={issue.severity} />
                              <span className="eyebrow text-[10px]">{issue.category}</span>
                              <span className="ml-auto text-xs font-semibold text-cadet">Slide {issue.slideNumber}</span>
                            </div>
                            <h3 className="mt-3 font-display text-xl font-extrabold">{issue.title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-foreground">{issue.feedback}</p>
                            <div className="mt-4 grid gap-3 md:grid-cols-2">
                              <div className="rounded-2xl bg-mint-ice p-3">
                                <p className="eyebrow text-[10px]">Why it matters</p>
                                <p className="mt-1 text-sm">{issue.whyItMatters}</p>
                              </div>
                              <div className="rounded-2xl bg-mint-ice p-3">
                                <p className="eyebrow text-[10px]">How to fix it</p>
                                <p className="mt-1 text-sm">{issue.suggestion}</p>
                              </div>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                              {issue.resolved ? (
                                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-cadet-deep"><CheckCircle2 className="h-4 w-4" /> Fixed with AI</span>
                              ) : (
                                <Button variant="hero" size="sm" onClick={() => openFix(issue)} disabled={improving}>
                                  <Wand2 /> FIX WITH AI
                                </Button>
                              )}
                              <Button asChild variant="outline" size="sm">
                                <Link to="/deck/$id" params={{ id: row.id }} search={{ slide: issue.slideNumber, edit: 1 }}>
                                  <Pencil /> EDIT SLIDE
                                </Link>
                              </Button>
                            </div>
                          </motion.article>
                        ))}
                      </AnimatePresence>
                    </div>
                  </section>
                );
              })}

              {data.investorQuestions.length > 0 && (
                <section className="glass-dark rounded-3xl p-6">
                  <h2 className="flex items-center gap-2 font-display text-lg font-extrabold uppercase tracking-wider">
                    <HelpCircle className="h-5 w-5 text-mint-deep" /> Questions an investor may ask
                  </h2>
                  <ul className="mt-4 grid gap-2 md:grid-cols-2">
                    {data.investorQuestions.map((q, i) => (
                      <li key={i} className="rounded-2xl border border-mint-ice/10 bg-mint-ice/5 px-4 py-3 text-sm text-mint-ice/90">“{q}”</li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            <aside className="space-y-4">
              <PitchHealthPanel health={health} />
              <div className="glass-dark rounded-3xl p-5 text-sm text-mint-ice/80">
                <p className="flex items-center gap-2 font-bold text-mint-ice"><Sparkles className="h-4 w-4 text-mint-deep" /> Next step</p>
                <p className="mt-2">Fix the critical issues, then export your deck or rehearse in Presentation Mode.</p>
                <Button asChild variant="mint" className="mt-4 w-full">
                  <Link to="/deck/$id" params={{ id: row.id }}>Back to deck</Link>
                </Button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
