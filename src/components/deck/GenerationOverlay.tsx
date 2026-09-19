import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export const GENERATION_STEPS = [
  "Understanding your idea",
  "Identifying the core problem",
  "Structuring the solution",
  "Mapping the market",
  "Building your business model",
  "Preparing your investor story",
] as const;

/**
 * Animated AI workflow. Steps advance on a timer while the request runs; when `done`
 * becomes true, remaining steps complete quickly and the success state shows.
 */
export function GenerationOverlay({ active, done, title = "Generating your pitch" }: { active: boolean; done: boolean; title?: string }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!active) {
      setStep(0);
      return;
    }
    const id = setInterval(() => {
      setStep((s) => Math.min(s + 1, done ? GENERATION_STEPS.length : GENERATION_STEPS.length - 1));
    }, done ? 220 : 2600);
    return () => clearInterval(id);
  }, [active, done]);

  const finished = done && step >= GENERATION_STEPS.length;

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="bg-navy-gradient grain fixed inset-0 z-50 flex items-center justify-center p-6"
        >
          <div className="relative w-full max-w-lg">
            <motion.div
              className="absolute left-1/2 top-0 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/3 rounded-full bg-mint-deep/30 blur-3xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <div className="mb-10 text-center">
              <span className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-mint-deep text-navy shadow-glow">
                <span className="animate-pulse-ring absolute inset-0 rounded-2xl border-2 border-mint-deep" />
                <Sparkles className="h-7 w-7" />
              </span>
              <p className="eyebrow text-mint-deep">PitchPilot AI</p>
              <h2 className="mt-2 font-display text-3xl font-extrabold text-mint-ice">
                {finished ? "Your pitch is ready." : title}
              </h2>
            </div>

            <ol className="space-y-3">
              {GENERATION_STEPS.map((label, i) => {
                const state = i < step ? "done" : i === step && !finished ? "active" : "pending";
                return (
                  <motion.li
                    key={label}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: state === "pending" ? 0.35 : 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      "flex items-center gap-4 rounded-2xl border px-4 py-3 transition-colors",
                      state === "active" && "glass-dark border-mint-deep/60",
                      state === "done" && "border-transparent",
                      state === "pending" && "border-transparent",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        state === "done" && "bg-mint-deep text-navy",
                        state === "active" && "border-2 border-mint-deep text-mint-deep",
                        state === "pending" && "border border-mint-ice/30 text-mint-ice/50",
                      )}
                    >
                      {state === "done" ? <Check className="h-4 w-4" /> : i + 1}
                    </span>
                    <span
                      className={cn(
                        "font-display text-sm font-bold uppercase tracking-[0.18em]",
                        state === "active" ? "text-mint-ice" : "text-mint-ice/80",
                      )}
                    >
                      {label}
                    </span>
                    {state === "active" && (
                      <span className="ml-auto flex gap-1">
                        {[0, 1, 2].map((d) => (
                          <motion.span
                            key={d}
                            className="h-1.5 w-1.5 rounded-full bg-mint-deep"
                            animate={{ opacity: [0.2, 1, 0.2] }}
                            transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }}
                          />
                        ))}
                      </span>
                    )}
                  </motion.li>
                );
              })}
            </ol>

            <div className="mt-8 h-1.5 overflow-hidden rounded-full bg-mint-ice/10">
              <motion.div
                className="h-full rounded-full bg-linear-to-r from-mint-deep to-mint-ice"
                animate={{ width: `${Math.min(100, ((step + (finished ? 0 : 0.5)) / GENERATION_STEPS.length) * 100)}%` }}
                transition={{ ease: "easeOut", duration: 0.6 }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
