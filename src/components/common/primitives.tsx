import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { AlertTriangle, CheckCircle2, CircleAlert, Info, Sparkles, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ConfidenceTag, HealthStatus, Severity } from "@/lib/pitch/types";
import { statusTone } from "@/lib/pitch/readiness";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
    >
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="text-3xl font-extrabold leading-[1.05] text-foreground md:text-5xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-xl text-base text-muted-foreground md:text-lg">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </motion.div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  delay = 0,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon: LucideIcon;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="card-hover rounded-3xl border border-border bg-card p-5 shadow-soft"
    >
      <div className="flex items-center justify-between">
        <p className="eyebrow">{label}</p>
        <span className="rounded-xl bg-mint-ice p-2 text-cadet-deep">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-extrabold text-foreground">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </motion.div>
  );
}

export function EmptyState({
  title,
  description,
  cta,
  to,
  onClick,
  icon: Icon = Sparkles,
}: {
  title: string;
  description: string;
  cta?: string;
  to?: string;
  onClick?: () => void;
  icon?: LucideIcon;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="grain relative overflow-hidden rounded-3xl border border-dashed border-mint-deep bg-mint-gradient p-10 text-center md:p-16"
    >
      <div className="relative z-10 mx-auto max-w-md">
        <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-card text-cadet-deep shadow-soft">
          <Icon className="h-7 w-7" />
        </span>
        <h3 className="font-display text-2xl font-extrabold text-foreground">{title}</h3>
        <p className="mt-2 text-muted-foreground">{description}</p>
        {cta && to && (
          <Button asChild variant="hero" size="lg" className="mt-6">
            <Link to={to}>{cta}</Link>
          </Button>
        )}
        {cta && onClick && (
          <Button variant="hero" size="lg" className="mt-6" onClick={onClick}>
            {cta}
          </Button>
        )}
      </div>
    </motion.div>
  );
}

const TAG_STYLES: Record<ConfidenceTag, string> = {
  "Verified Input": "bg-success-soft text-cadet-deep border-mint-deep",
  "Founder Provided": "bg-info-soft text-info border-info/30",
  "AI Estimate": "bg-warning-soft text-warning border-warning/40",
  "Missing Data": "bg-critical-soft text-critical border-critical/30",
};

export function ConfidencePill({ tag, className }: { tag: ConfidenceTag; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        TAG_STYLES[tag],
        className,
      )}
    >
      {tag}
    </span>
  );
}

export const SEVERITY_META: Record<
  Severity,
  { label: string; description: string; icon: LucideIcon; dot: string; text: string; soft: string; border: string }
> = {
  critical: {
    label: "Critical",
    description: "Issues that should be addressed before pitching.",
    icon: CircleAlert,
    dot: "bg-critical",
    text: "text-critical",
    soft: "bg-critical-soft",
    border: "border-critical/30",
  },
  warning: {
    label: "Warning",
    description: "Potential investor questions.",
    icon: AlertTriangle,
    dot: "bg-warning",
    text: "text-warning",
    soft: "bg-warning-soft",
    border: "border-warning/40",
  },
  info: {
    label: "Info",
    description: "Improvement opportunities.",
    icon: Info,
    dot: "bg-info",
    text: "text-info",
    soft: "bg-info-soft",
    border: "border-info/30",
  },
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  const m = SEVERITY_META[severity];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider",
        m.soft,
        m.text,
        m.border,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", m.dot)} />
      {m.label}
    </span>
  );
}

export function HealthPill({ status }: { status: HealthStatus }) {
  const tone = statusTone(status);
  const styles = {
    success: "bg-success-soft text-cadet-deep border-mint-deep",
    warning: "bg-warning-soft text-warning border-warning/40",
    critical: "bg-critical-soft text-critical border-critical/30",
    info: "bg-info-soft text-info border-info/30",
  }[tone];
  const Icon = tone === "success" ? CheckCircle2 : tone === "critical" ? CircleAlert : AlertTriangle;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold", styles)}>
      <Icon className="h-3 w-3" />
      {status}
    </span>
  );
}

export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("eyebrow", className)}>{children}</p>;
}
