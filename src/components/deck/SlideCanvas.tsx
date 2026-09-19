import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { tagForText, type Deck, type Slide } from "@/lib/pitch/types";
import { ConfidencePill } from "@/components/common/primitives";

/**
 * Renders a slide so it visually resembles a real 16:9 presentation slide.
 * `scale` variants: "full" (workspace/presentation), "thumb" (sidebar thumbnails).
 */
export function SlideCanvas({
  deck,
  slide,
  variant = "full",
  className,
  showTags = true,
}: {
  deck: Deck;
  slide: Slide;
  variant?: "full" | "thumb" | "present";
  className?: string;
  showTags?: boolean;
}) {
  const isCover = slide.number === 1;
  const thumb = variant === "thumb";
  const present = variant === "present";

  return (
    <div
      className={cn(
        "bg-slide-gradient relative aspect-video w-full overflow-hidden rounded-2xl border border-border text-navy",
        thumb ? "rounded-lg" : "shadow-float",
        present && "rounded-none border-0 md:rounded-3xl",
        className,
      )}
    >
      {/* Decorative brand band */}
      <div className="absolute inset-y-0 left-0 w-[3%] bg-linear-to-b from-mint-deep via-cadet to-cadet-deep" />
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-mint-soft/60 blur-3xl" />

      {isCover ? (
        <div className={cn("relative flex h-full flex-col justify-center", thumb ? "px-[10%]" : "px-[12%]")}>
          <p className={cn("eyebrow text-cadet", thumb ? "text-[4px] tracking-wider" : present ? "text-sm" : "text-[0.65rem]")}>
            Investor Pitch
          </p>
          <h2
            className={cn(
              "font-display font-extrabold leading-[0.95] text-navy",
              thumb ? "mt-1 text-[10px]" : present ? "mt-4 text-6xl md:text-8xl" : "mt-3 text-4xl md:text-6xl",
            )}
          >
            {deck.startupName}
          </h2>
          <p
            className={cn(
              "font-medium text-cadet-deep",
              thumb ? "mt-1 text-[4.5px]" : present ? "mt-6 max-w-3xl text-2xl md:text-3xl" : "mt-4 max-w-xl text-base md:text-xl",
            )}
          >
            {deck.tagline || slide.content[0]}
          </p>
          {!thumb && (
            <div className={cn("mt-8 flex items-center gap-3 text-cadet", present ? "text-base" : "text-xs")}>
              <span className="h-px w-10 bg-cadet/50" />
              {deck.industry}
            </div>
          )}
        </div>
      ) : (
        <div className={cn("relative flex h-full flex-col", thumb ? "px-[9%] py-[7%]" : present ? "px-[9%] py-[6%]" : "px-[8%] py-[6%]")}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className={cn("eyebrow", thumb ? "text-[4px] tracking-wider" : present ? "text-sm" : "text-[0.62rem]")}>
                {String(slide.number).padStart(2, "0")} — {deck.startupName}
              </p>
              <h2
                className={cn(
                  "font-display font-extrabold leading-tight text-navy",
                  thumb ? "mt-0.5 line-clamp-2 text-[7px]" : present ? "mt-3 text-4xl md:text-6xl" : "mt-2 text-xl md:text-3xl",
                )}
              >
                {slide.title}
              </h2>
            </div>
            {slide.keyMetric && !thumb && (
              <div
                className={cn(
                  "shrink-0 rounded-2xl bg-navy px-4 py-3 text-mint-ice shadow-soft",
                  present ? "max-w-sm px-6 py-4" : "max-w-[40%]",
                )}
              >
                <p className={cn("eyebrow text-mint-deep", present ? "text-xs" : "text-[0.55rem]")}>Key metric</p>
                <p className={cn("font-display font-bold leading-snug", present ? "text-lg" : "text-xs md:text-sm")}>
                  {slide.keyMetric}
                </p>
              </div>
            )}
          </div>

          <ul className={cn("flex-1 space-y-1", thumb ? "mt-1.5" : present ? "mt-8 space-y-4" : "mt-5 space-y-2.5")}>
            {slide.content.slice(0, thumb ? 4 : 6).map((line, i) => {
              const tag = tagForText(line);
              return (
                <motion.li
                  key={i}
                  initial={thumb ? false : { opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className={cn("flex items-start gap-3", thumb ? "gap-1" : "")}
                >
                  <span
                    className={cn(
                      "mt-[0.55em] shrink-0 rounded-full bg-mint-deep",
                      thumb ? "h-[3px] w-[3px]" : present ? "h-2.5 w-2.5" : "h-2 w-2",
                    )}
                  />
                  <span
                    className={cn(
                      "leading-snug text-cadet-deep",
                      thumb ? "line-clamp-1 text-[4.5px]" : present ? "text-xl md:text-2xl" : "text-sm md:text-base",
                    )}
                  >
                    {line}
                    {showTags && tag && !thumb && <ConfidencePill tag={tag} className="ml-2 align-middle" />}
                  </span>
                </motion.li>
              );
            })}
          </ul>

          {!thumb && (
            <div className={cn("mt-auto flex items-center justify-between text-cadet", present ? "text-sm" : "text-[0.6rem]")}>
              <span>{deck.startupName} · Confidential</span>
              <span>
                {slide.number} / {deck.slides.length}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
