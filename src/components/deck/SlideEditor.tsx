import { useEffect, useRef, useState } from "react";
import { Check, Plus, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Slide } from "@/lib/pitch/types";
import { cn } from "@/lib/utils";

export function SlideEditor({
  slide,
  original,
  onSave,
  onCancel,
  saving,
  savedAt,
}: {
  slide: Slide;
  original?: Slide | undefined;
  onSave: (next: Slide, opts?: { silent?: boolean }) => Promise<void> | void;
  onCancel: () => void;
  saving: boolean;
  savedAt: number | null;
}) {
  const [draft, setDraft] = useState<Slide>(slide);
  const dirty = JSON.stringify(draft) !== JSON.stringify(slide);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setDraft(slide), [slide]);

  // Autosave 1.4s after the last change.
  useEffect(() => {
    if (!dirty) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onSave(draft, { silent: true }), 1400);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  const setBullet = (i: number, v: string) => setDraft((d) => ({ ...d, content: d.content.map((c, j) => (j === i ? v : c)) }));
  const setAssumption = (i: number, v: string) =>
    setDraft((d) => ({ ...d, assumptions: d.assumptions.map((c, j) => (j === i ? v : c)) }));

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <p className="eyebrow">Edit slide {slide.number}</p>
          <p className="text-xs text-muted-foreground">Changes autosave to your workspace.</p>
        </div>
        <span
          className={cn(
            "flex items-center gap-1 text-xs font-semibold transition-opacity",
            saving ? "text-cadet" : savedAt && !dirty ? "text-cadet-deep" : "opacity-0",
          )}
        >
          {saving ? "Saving…" : <><Check className="h-3.5 w-3.5" /> Saved ✓</>}
        </span>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto py-4 pr-1">
        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-cadet-deep">Title</Label>
          <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="rounded-xl font-semibold" />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-cadet-deep">Bullets</Label>
          {draft.content.map((c, i) => (
            <div key={i} className="flex items-start gap-2">
              <Textarea value={c} onChange={(e) => setBullet(i, e.target.value)} rows={2} className="min-h-0 flex-1 resize-none rounded-xl text-sm" />
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Delete bullet"
                onClick={() => setDraft({ ...draft, content: draft.content.filter((_, j) => j !== i) })}
                disabled={draft.content.length <= 1}
              >
                <Trash2 className="h-4 w-4 text-critical" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => setDraft({ ...draft, content: [...draft.content, ""] })} disabled={draft.content.length >= 6}>
            <Plus /> Add Bullet
          </Button>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-cadet-deep">Key metric</Label>
          <Input
            value={draft.keyMetric}
            onChange={(e) => setDraft({ ...draft, keyMetric: e.target.value })}
            placeholder="Optional headline number or claim"
            className="rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-cadet-deep">Assumptions</Label>
          {draft.assumptions.map((a, i) => (
            <div key={i} className="flex items-start gap-2">
              <Input value={a} onChange={(e) => setAssumption(i, e.target.value)} className="rounded-xl text-sm" />
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Delete assumption"
                onClick={() => setDraft({ ...draft, assumptions: draft.assumptions.filter((_, j) => j !== i) })}
              >
                <Trash2 className="h-4 w-4 text-critical" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => setDraft({ ...draft, assumptions: [...draft.assumptions, ""] })}>
            <Plus /> Add Assumption
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-border pt-3">
        <Button onClick={() => onSave(draft)} disabled={saving || !dirty}>
          Save
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        {original && (
          <Button variant="ghost" className="ml-auto" onClick={() => setDraft(original)} disabled={JSON.stringify(draft) === JSON.stringify(original)}>
            <RotateCcw /> Reset AI Version
          </Button>
        )}
      </div>
    </div>
  );
}
