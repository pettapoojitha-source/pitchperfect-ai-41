import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { SlideCanvas } from "@/components/deck/SlideCanvas";
import { deckQuery } from "@/lib/decks";

export const Route = createFileRoute("/_authenticated/presentation/$id")({
  head: () => ({
    meta: [
      { title: "Presentation — PitchPilot AI" },
      { name: "description", content: "Fullscreen presentation mode for your pitch deck." },
      { property: "og:title", content: "Presentation — PitchPilot AI" },
      { property: "og:description", content: "Present your pitch fullscreen." },
    ],
  }),
  component: PresentationMode,
});

function PresentationMode() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: row, isLoading } = useQuery(deckQuery(id));
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [chrome, setChrome] = useState(true);

  const total = row?.deck_data.slides.length ?? 0;
  const go = (d: number) => {
    setDir(d);
    setI((c) => Math.min(total - 1, Math.max(0, c + d)));
  };
  const exit = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    navigate({ to: "/deck/$id", params: { id }, search: { slide: i + 1 } });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") go(1);
      if (e.key === "ArrowLeft" || e.key === "PageUp") go(-1);
      if (e.key === "Escape") exit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const show = () => {
      setChrome(true);
      clearTimeout(t);
      t = setTimeout(() => setChrome(false), 2500);
    };
    show();
    window.addEventListener("mousemove", show);
    return () => {
      window.removeEventListener("mousemove", show);
      clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    document.documentElement.requestFullscreen?.().catch(() => {});
  }, []);

  if (isLoading || !row) return <div className="bg-navy-gradient fixed inset-0" />;
  const deck = row.deck_data;
  const slide = deck.slides[i]!;

  return (
    <div className="bg-navy-gradient grain fixed inset-0 z-50 flex select-none flex-col items-center justify-center p-4 md:p-10">
      <div className="w-full max-w-[1400px]">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={slide.number}
            initial={{ opacity: 0, x: 80 * dir, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -80 * dir, scale: 0.97 }}
            transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <SlideCanvas deck={deck} slide={slide} variant="present" showTags={false} className="shadow-float" />
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {chrome && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none fixed inset-0">
            <button onClick={exit} className="pointer-events-auto absolute right-5 top-5 flex items-center gap-2 rounded-full bg-mint-ice/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-mint-ice backdrop-blur hover:bg-mint-ice/20">
              <X className="h-4 w-4" /> ESC Exit
            </button>
            <div className="pointer-events-auto absolute inset-x-0 bottom-6 flex items-center justify-center gap-4">
              <button onClick={() => go(-1)} disabled={i === 0} className="flex items-center gap-1 rounded-full bg-mint-ice/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-mint-ice backdrop-blur hover:bg-mint-ice/20 disabled:opacity-30">
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              <span className="font-display text-sm font-extrabold text-mint-ice/80">
                {i + 1} / {total}
              </span>
              <button onClick={() => go(1)} disabled={i === total - 1} className="flex items-center gap-1 rounded-full bg-mint-ice/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-mint-ice backdrop-blur hover:bg-mint-ice/20 disabled:opacity-30">
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed inset-x-0 bottom-0 h-1 bg-mint-ice/10">
        <motion.div className="h-full bg-mint-deep" animate={{ width: `${((i + 1) / total) * 100}%` }} transition={{ ease: "easeOut" }} />
      </div>
    </div>
  );
}
