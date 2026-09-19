import { motion } from "motion/react";
import { HealthPill } from "@/components/common/primitives";
import type { PitchHealthItem } from "@/lib/pitch/types";
import { readinessLabel, readinessPercent } from "@/lib/pitch/readiness";
import { cn } from "@/lib/utils";

export function PitchHealthPanel({ health, compact = false, className }: { health: PitchHealthItem[]; compact?: boolean; className?: string }) {
  const pct = readinessPercent(health);
  return (
    <div className={cn("rounded-3xl border border-border bg-card p-5 shadow-soft", className)}>
      <div className="flex items-center justify-between">
        <p className="eyebrow">Pitch Health</p>
        <span className="font-display text-sm font-extrabold text-cadet-deep">{pct}%</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-mint-ice">
        <motion.div
          className="h-full rounded-full bg-linear-to-r from-cadet-deep via-cadet to-mint-deep"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </div>
      <p className="mt-1.5 text-xs font-semibold text-muted-foreground">{readinessLabel(pct)}</p>
      <ul className={cn("mt-4 divide-y divide-border", compact && "text-sm")}>
        {health.map((h, i) => (
          <motion.li
            key={h.dimension}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center justify-between gap-3 py-2.5"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{h.dimension.replace(" Evidence", "").replace(" Clarity", "").replace(" Assumptions", "")}</p>
              {!compact && h.note && <p className="truncate text-xs text-muted-foreground">{h.note}</p>}
            </div>
            <HealthPill status={h.status} />
          </motion.li>
        ))}
      </ul>
      <p className="mt-3 text-[10px] leading-snug text-muted-foreground">
        AI-generated pitch diagnostic — not investment advice.
      </p>
    </div>
  );
}
