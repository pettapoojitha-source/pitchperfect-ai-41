import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Send, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { askPilot } from "@/lib/ai.functions";
import type { Deck } from "@/lib/pitch/types";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "How can I strengthen my problem statement?",
  "Why would an investor challenge my market size?",
  "What evidence should I collect before pitching?",
  "Rewrite the current slide more clearly.",
  "Explain my business model in simple terms.",
];

type Msg = { role: "user" | "assistant"; content: string };

export function AskPilotSheet({ open, onOpenChange, deck, currentSlide }: { open: boolean; onOpenChange: (o: boolean) => void; deck: Deck; currentSlide: number }) {
  const ask = useServerFn(askPilot);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  const send = async (q: string) => {
    const question = q.trim();
    if (!question || busy) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content: question }];
    setMessages(next);
    setBusy(true);
    try {
      const res = await ask({
        data: {
          deck,
          question: `${question}\n\n(The founder is currently viewing slide ${currentSlide}: "${deck.slides[currentSlide - 1]?.title}".)`,
          history: messages.slice(-8),
        },
      });
      setMessages([...next, { role: "assistant", content: res.ok ? res.data : `AI is temporarily unavailable. ${res.error}` }]);
    } catch (e) {
      setMessages([...next, { role: "assistant", content: `AI is temporarily unavailable. ${(e as Error).message}` }]);
    } finally {
      setBusy(false);
      setTimeout(() => bottom.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="border-b border-border p-5">
          <SheetTitle className="flex items-center gap-2 font-display text-lg font-extrabold">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-navy text-mint-deep">
              <Sparkles className="h-4 w-4" />
            </span>
            Ask PitchPilot AI
          </SheetTitle>
          <SheetDescription>Has full context of your {deck.startupName} deck. Answers are advice, not investment guidance.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {messages.length === 0 && (
            <div className="space-y-2">
              <p className="eyebrow">Try asking</p>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="block w-full rounded-2xl border border-border bg-card px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:border-mint-deep hover:bg-mint-ice"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "max-w-[92%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  m.role === "user" ? "ml-auto bg-navy text-mint-ice" : "bg-mint-ice text-foreground",
                )}
              >
                {m.content}
              </motion.div>
            ))}
          </AnimatePresence>
          {busy && (
            <div className="flex items-center gap-2 text-xs font-semibold text-cadet">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking through your deck…
            </div>
          )}
          <div ref={bottom} />
        </div>

        <form
          className="flex items-end gap-2 border-t border-border p-4"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={2}
            placeholder="Ask anything about this pitch…"
            className="min-h-0 flex-1 resize-none rounded-xl"
          />
          <Button type="submit" size="icon" variant="hero" disabled={busy || !input.trim()} aria-label="Send">
            <Send />
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
