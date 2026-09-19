import { Link, useNavigate } from "@tanstack/react-router";
import { formatDistanceToNow, format } from "date-fns";
import { motion } from "motion/react";
import { Copy, Download, ExternalLink, MoreHorizontal, Pencil, ShieldAlert, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CritiqueRow, DeckRow } from "@/lib/pitch/types";
import { deleteDeck, duplicateDeck } from "@/lib/decks";
import { exportPptx } from "@/lib/export/pptx";
import { cn } from "@/lib/utils";

export function DeckCard({
  deck,
  critique,
  index = 0,
  userId,
  full = false,
}: {
  deck: DeckRow;
  critique?: CritiqueRow | undefined;
  index?: number;
  userId: string;
  full?: boolean;
}) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const openIssues = critique?.critic_data.issues.filter((i) => !i.resolved).length ?? 0;
  const status = critique
    ? openIssues === 0
      ? "All issues resolved"
      : `${openIssues} issue${openIssues === 1 ? "" : "s"} identified`
    : "Not critiqued yet";

  const onDuplicate = async () => {
    try {
      await duplicateDeck(deck, userId);
      qc.invalidateQueries({ queryKey: ["decks"] });
      toast.success("Deck duplicated ✓");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };
  const onDelete = async () => {
    if (!confirm(`Delete ${deck.startup_name}? This cannot be undone.`)) return;
    try {
      await deleteDeck(deck.id);
      qc.invalidateQueries({ queryKey: ["decks"] });
      qc.invalidateQueries({ queryKey: ["critiques"] });
      toast.success("Deck deleted");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };
  const onExport = async () => {
    try {
      await exportPptx(deck.deck_data);
      toast.success("PowerPoint exported ✓");
    } catch (e) {
      toast.error("Export failed. Please try again.");
      console.error(e);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="card-hover group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-soft"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-mint-deep via-cadet to-cadet-deep opacity-70" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-display text-xl font-extrabold text-foreground">{deck.startup_name}</h3>
            {deck.is_demo && (
              <span className="rounded-full bg-mint-ice px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cadet-deep">
                Demo
              </span>
            )}
          </div>
          <p className="truncate text-sm font-medium text-cadet">{deck.industry || "Industry not set"}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Deck actions">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-2xl">
            <DropdownMenuItem onClick={() => navigate({ to: "/deck/$id", params: { id: deck.id } })}>
              <ExternalLink className="mr-2 h-4 w-4" /> Open
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate({ to: "/deck/$id", params: { id: deck.id }, search: { edit: 1 } })}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate({ to: "/critic/$id", params: { id: deck.id } })}>
              <ShieldAlert className="mr-2 h-4 w-4" /> Critique
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="mr-2 h-4 w-4" /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExport}>
              <Download className="mr-2 h-4 w-4" /> Export PPTX
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-critical focus:text-critical">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <dl className={cn("mt-4 grid gap-x-4 gap-y-2 text-xs", full ? "grid-cols-2" : "grid-cols-2")}>
        <div>
          <dt className="text-muted-foreground">Slides</dt>
          <dd className="font-semibold text-foreground">{deck.deck_data.slides.length} slides</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Critique</dt>
          <dd className={cn("font-semibold", critique ? (openIssues ? "text-warning" : "text-cadet-deep") : "text-muted-foreground")}>
            {status}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Created</dt>
          <dd className="font-semibold text-foreground">{format(new Date(deck.created_at), "MMM d, yyyy")}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Last edited</dt>
          <dd className="font-semibold text-foreground">
            {formatDistanceToNow(new Date(deck.updated_at), { addSuffix: true }).replace("less than a minute ago", "just now")}
          </dd>
        </div>
      </dl>

      <div className="mt-5 flex gap-2">
        <Button asChild size="sm" className="flex-1">
          <Link to="/deck/$id" params={{ id: deck.id }}>
            Open
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="flex-1">
          <Link to="/critic/$id" params={{ id: deck.id }}>
            Critique
          </Link>
        </Button>
        <Button size="sm" variant="ghost" onClick={onExport} aria-label="Export">
          <Download />
        </Button>
      </div>
    </motion.article>
  );
}
