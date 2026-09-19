import { HEALTH_DIMENSIONS, type Critique, type Deck, type HealthStatus, type PitchHealthItem } from "./types";

export const HEALTH_WEIGHT: Record<HealthStatus, number> = {
  Strong: 1,
  Clear: 0.85,
  "Needs Evidence": 0.5,
  "Needs Validation": 0.45,
  "Needs Work": 0.4,
  Missing: 0.1,
};

/** Heuristic health when no critique has been run yet — based on the deck itself. */
export function heuristicHealth(deck: Deck): PitchHealthItem[] {
  const slide = (n: number) => deck.slides.find((s) => s.number === n);
  const missing = (n: number) => (slide(n)?.missingInformation.length ?? 0);
  const textOf = (n: number) => [slide(n)?.keyMetric ?? "", ...(slide(n)?.content ?? [])].join(" ").toUpperCase();
  const hasMissingMarker = (n: number) => textOf(n).includes("NOT PROVIDED") || textOf(n).includes("MISSING");
  const hasEstimate = (n: number) => textOf(n).includes("AI ESTIMATE");

  const status = (n: number, estimateStatus: HealthStatus = "Needs Evidence"): HealthStatus => {
    if (hasMissingMarker(n)) return "Missing";
    if (hasEstimate(n)) return estimateStatus;
    if (missing(n) >= 2) return "Needs Work";
    if (missing(n) === 1) return "Clear";
    return "Strong";
  };

  return [
    { dimension: "Problem Clarity", status: status(2), note: "Based on specificity of the problem slide." },
    { dimension: "Market Evidence", status: status(4), note: "Based on labelled estimates and missing inputs." },
    { dimension: "Differentiation", status: status(7, "Needs Work"), note: "Based on the competition slide." },
    { dimension: "Business Model", status: status(6, "Needs Validation"), note: "Based on payer clarity." },
    { dimension: "Traction Evidence", status: status(9), note: "Based on evidence provided." },
    { dimension: "Financial Assumptions", status: status(10, "Needs Validation"), note: "Based on the funding slide." },
  ];
}

export function resolveHealth(deck: Deck, critique?: Critique | null): PitchHealthItem[] {
  if (critique?.pitchHealth?.length) {
    return HEALTH_DIMENSIONS.map(
      (d) => critique.pitchHealth.find((h) => h.dimension === d) ?? { dimension: d, status: "Needs Evidence", note: "" },
    );
  }
  return heuristicHealth(deck);
}

/** 0–100 readiness percentage. Diagnostic only, not an investment score. */
export function readinessPercent(health: PitchHealthItem[]): number {
  if (!health.length) return 0;
  const total = health.reduce((acc, h) => acc + HEALTH_WEIGHT[h.status], 0);
  return Math.round((total / health.length) * 100);
}

export function readinessLabel(pct: number): string {
  if (pct >= 80) return "Investor-ready";
  if (pct >= 60) return "Nearly there";
  if (pct >= 40) return "Needs evidence";
  return "Early draft";
}

export function statusTone(status: HealthStatus): "success" | "warning" | "critical" | "info" {
  switch (status) {
    case "Strong":
    case "Clear":
      return "success";
    case "Missing":
      return "critical";
    case "Needs Work":
      return "warning";
    default:
      return "info";
  }
}
