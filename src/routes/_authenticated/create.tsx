import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/common/primitives";
import { GenerationOverlay } from "@/components/deck/GenerationOverlay";
import { AiUnavailableDialog } from "@/components/common/AiUnavailable";
import { generateDeck } from "@/lib/ai.functions";
import { createDeck } from "@/lib/decks";
import { DEMO_DESCRIPTION, FARMAI_DECK } from "@/lib/pitch/demo-data";
import type { CreatePitchInput } from "@/lib/pitch/types";
import { useSession } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/create")({
  head: () => ({
    meta: [
      { title: "Create Pitch — PitchPilot AI" },
      { name: "description", content: "Describe your startup and let PitchPilot structure an 11-slide investor story." },
      { property: "og:title", content: "Create Pitch — PitchPilot AI" },
      { property: "og:description", content: "Tell us the idea. We'll structure the story." },
    ],
  }),
  component: CreatePitch,
});

const PLACEHOLDER =
  "Describe your startup in 3–5 sentences. What problem are you solving? Who experiences the problem? What are you building? Who is your target customer? How will you make money?";

const STAGES = ["Idea", "Prototype", "MVP", "Early customers", "Growing revenue", "Scaling"];
const FUNDING = ["Bootstrapped", "Pre-seed", "Seed", "Series A", "Series B+"];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-bold uppercase tracking-[0.14em] text-cadet-deep">{label}</Label>
      {children}
    </div>
  );
}

function CreatePitch() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useSession();
  const gen = useServerFn(generateDeck);

  const [form, setForm] = useState<CreatePitchInput>({ description: "" });
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const set = (k: keyof CreatePitchInput) => (v: string) => setForm((f) => ({ ...f, [k]: v }));
  const len = form.description.trim().length;
  const tooShort = len < 50;

  const persist = async (deck: Awaited<ReturnType<typeof gen>> extends infer R ? (R extends { ok: true; data: infer D } ? D : never) : never, isDemo = false) => {
    if (!user) throw new Error("Not signed in");
    const row = await createDeck({ userId: user.id, description: form.description, deck, isDemo });
    qc.invalidateQueries({ queryKey: ["decks"] });
    setDone(true);
    toast.success("Pitch generated ✓");
    setTimeout(() => navigate({ to: "/deck/$id", params: { id: row.id } }), 1400);
  };

  const submit = async () => {
    if (len < 20) {
      toast.error("Tell us a bit more about the idea first.");
      return;
    }
    setFailure(null);
    setRunning(true);
    setDone(false);
    try {
      const res = await gen({ data: form });
      if (!res.ok) {
        setRunning(false);
        setFailure(res.error);
        return;
      }
      await persist(res.data);
    } catch (e) {
      setRunning(false);
      setFailure((e as Error).message);
    }
  };

  const useDemoData = async () => {
    setFailure(null);
    setRunning(true);
    try {
      await persist(FARMAI_DECK, true);
    } catch (e) {
      setRunning(false);
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <GenerationOverlay active={running} done={done} />
      <AiUnavailableDialog
        open={!!failure}
        message={failure ?? undefined}
        onRetry={() => {
          setFailure(null);
          submit();
        }}
        onDemo={useDemoData}
        onClose={() => setFailure(null)}
      />

      <PageHeader eyebrow="Create Pitch" title="LET'S BUILD YOUR PITCH." subtitle="Tell us the idea. We'll structure the story." />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl border border-border bg-card p-6 shadow-soft md:p-8"
      >
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold uppercase tracking-[0.14em] text-cadet-deep">Your startup</Label>
          <button
            type="button"
            className="text-xs font-semibold text-cadet underline-offset-4 hover:underline"
            onClick={() => setForm((f) => ({ ...f, description: DEMO_DESCRIPTION, industry: "Agriculture Technology" }))}
          >
            Use the FarmAI example
          </button>
        </div>
        <Textarea
          value={form.description}
          onChange={(e) => set("description")(e.target.value)}
          placeholder={PLACEHOLDER}
          rows={7}
          className="mt-2 resize-none rounded-2xl border-border bg-offwhite text-base leading-relaxed focus-visible:ring-mint-deep md:text-lg"
        />
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className={tooShort ? "text-warning" : "text-cadet-deep"}>
            {tooShort ? `Minimum recommended: 50 characters` : "Great — that's enough to work with."}
          </span>
          <span className="tabular-nums text-muted-foreground">{len} characters</span>
        </div>

        <div className="mt-8 border-t border-border pt-6">
          <p className="mb-4 text-sm font-semibold text-foreground">
            Optional details <span className="font-normal text-muted-foreground">— the more you share, the fewer assumptions the AI must make.</span>
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Industry">
              <Input value={form.industry ?? ""} onChange={(e) => set("industry")(e.target.value)} placeholder="e.g. Agriculture Technology" className="rounded-xl" />
            </Field>
            <Field label="Target customer">
              <Input value={form.targetCustomer ?? ""} onChange={(e) => set("targetCustomer")(e.target.value)} placeholder="e.g. Smallholder farmers in India" className="rounded-xl" />
            </Field>
            <Field label="Business model">
              <Input value={form.businessModel ?? ""} onChange={(e) => set("businessModel")(e.target.value)} placeholder="e.g. Monthly subscription per farm" className="rounded-xl" />
            </Field>
            <Field label="Competitors">
              <Input value={form.competitors ?? ""} onChange={(e) => set("competitors")(e.target.value)} placeholder="e.g. CropIn, Plantix" className="rounded-xl" />
            </Field>
            <Field label="Startup stage">
              <Select value={form.startupStage ?? ""} onValueChange={set("startupStage")}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select stage" /></SelectTrigger>
                <SelectContent>{STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Funding stage">
              <Select value={form.fundingStage ?? ""} onValueChange={set("fundingStage")}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select funding stage" /></SelectTrigger>
                <SelectContent>{FUNDING.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <div className="md:col-span-2">
              <Field label="Current traction (facts only)">
                <Textarea
                  value={form.traction ?? ""}
                  onChange={(e) => set("traction")(e.target.value)}
                  placeholder="e.g. 40 pilot farmers, 2 letters of intent. Leave blank if none — the AI will mark traction as not provided rather than invent it."
                  rows={2}
                  className="rounded-xl"
                />
              </Field>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-cadet" /> Facts stay facts. Estimates and gaps are labeled — never invented.
          </p>
          <Button variant="hero" size="xl" onClick={submit} disabled={running || len < 20}>
            GENERATE MY PITCH <ArrowRight />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
