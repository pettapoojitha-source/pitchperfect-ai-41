import { ArrowRight, Check, Loader2, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SlideCanvas } from "@/components/deck/SlideCanvas";
import type { Deck, ImprovedSlide, Issue, Slide } from "@/lib/pitch/types";

export function FixDialog({
  open,
  onClose,
  deck,
  slide,
  issue,
  improved,
  loading,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  deck: Deck;
  slide: Slide | null;
  issue: Issue | null;
  improved: ImprovedSlide | null;
  loading: boolean;
  onApply: () => void;
}) {
  if (!slide || !issue) return null;
  const after: Slide | null = improved ? { ...slide, ...improved } : null;
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-3xl sm:max-w-5xl">
        <DialogHeader>
          <p className="eyebrow">Fix with AI · Slide {slide.number}</p>
          <DialogTitle className="font-display text-2xl font-extrabold">{issue.title}</DialogTitle>
          <DialogDescription>PitchPilot rewrites only this slide. Nothing is applied until you say so.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <div>
            <p className="eyebrow mb-2 text-muted-foreground">Before</p>
            <SlideCanvas deck={deck} slide={slide} showTags={false} className="shadow-soft" />
          </div>
          <ArrowRight className="mx-auto hidden h-6 w-6 text-cadet md:block" />
          <div>
            <p className="eyebrow mb-2 text-cadet-deep">After</p>
            {loading || !after ? (
              <div className="flex aspect-video items-center justify-center rounded-2xl border border-dashed border-mint-deep bg-mint-ice">
                <div className="flex items-center gap-2 text-sm font-semibold text-cadet-deep">
                  <Loader2 className="h-4 w-4 animate-spin" /> Rewriting this slide…
                </div>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
                <SlideCanvas deck={deck} slide={after} showTags={false} className="shadow-glow" />
              </motion.div>
            )}
          </div>
        </div>

        {improved?.changeSummary && (
          <div className="rounded-2xl bg-mint-ice p-4 text-sm">
            <p className="mb-1 flex items-center gap-1.5 font-bold text-cadet-deep">
              <Sparkles className="h-3.5 w-3.5" /> What changed
            </p>
            <p className="text-foreground">{improved.changeSummary}</p>
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            Keep Original
          </Button>
          <Button variant="hero" onClick={onApply} disabled={!improved || loading}>
            <Check /> Apply Fix
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
