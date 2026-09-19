import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={cn("h-9 w-9", className)} aria-hidden>
      <defs>
        <linearGradient id="pp-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--mint-deep)" />
          <stop offset="1" stopColor="var(--cadet)" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill="url(#pp-grad)" />
      <path d="M11 28 L20 10 L29 28 L24.5 28 L20 18.5 L15.5 28 Z" fill="var(--navy)" opacity="0.9" />
      <circle cx="20" cy="26" r="2.2" fill="var(--mint-ice)" />
    </svg>
  );
}

export function Wordmark({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <span
      className={cn(
        "font-display text-base font-extrabold tracking-[0.18em]",
        light ? "text-mint-ice" : "text-foreground",
        className,
      )}
    >
      PITCHPILOT <span className={light ? "text-mint-deep" : "text-cadet"}>AI</span>
    </span>
  );
}
