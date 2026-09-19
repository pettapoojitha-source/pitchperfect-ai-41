import { CloudOff, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function AiUnavailableDialog({
  open,
  message,
  onRetry,
  onDemo,
  onClose,
  demoLabel = "Continue with Demo Data",
}: {
  open: boolean;
  message?: string | undefined;
  onRetry: () => void;
  onDemo?: (() => void) | undefined;
  onClose: () => void;
  demoLabel?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-3xl sm:max-w-md">
        <DialogHeader>
          <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-warning-soft text-warning">
            <CloudOff className="h-6 w-6" />
          </span>
          <DialogTitle className="font-display text-xl font-extrabold">AI is temporarily unavailable.</DialogTitle>
          <DialogDescription>
            {message || "We couldn't reach PitchPilot AI just now."} You can try again, or keep moving with the
            curated demo data so nothing blocks you.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <Button variant="hero" className="flex-1" onClick={onRetry}>
            <RefreshCw /> Try Again
          </Button>
          {onDemo && (
            <Button variant="mint" className="flex-1" onClick={onDemo}>
              <Sparkles /> {demoLabel}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
