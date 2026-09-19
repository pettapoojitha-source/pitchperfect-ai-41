import { type ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Layers,
  LogOut,
  Menu,
  MonitorPlay,
  PlusCircle,
  Settings,
  ShieldAlert,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LogoMark, Wordmark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { firstName, useProfile, useSession } from "@/hooks/useAuth";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/create", label: "Create Pitch", icon: PlusCircle },
  { to: "/decks", label: "My Decks", icon: Layers },
  { to: "/critic", label: "VC Critic", icon: ShieldAlert },
  { to: "/presentation", label: "Presentation", icon: MonitorPlay },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const { data: profile } = useProfile(user);
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const logout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out");
    navigate({ to: "/login" });
  };

  const isActive = (to: string) => location.pathname === to || location.pathname.startsWith(`${to}/`);
  const name = firstName(profile, user);
  const initials = name.slice(0, 1).toUpperCase();

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon }) => {
        const active = isActive(to);
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className={cn(
              "group relative flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition-colors",
              active ? "text-navy" : "text-mint-ice/70 hover:bg-sidebar-accent hover:text-mint-ice",
            )}
          >
            {active && (
              <motion.span
                layoutId="nav-active"
                className="absolute inset-0 rounded-2xl bg-mint-deep shadow-glow"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <Icon className="relative z-10 h-4 w-4" />
            <span className="relative z-10">{label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const ProfileBlock = () => (
    <div className="mt-auto border-t border-sidebar-border pt-4">
      <Link to="/settings" className="flex items-center gap-3 rounded-2xl px-2 py-2 hover:bg-sidebar-accent">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-mint-deep font-display text-sm font-extrabold text-navy">
          {initials}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-mint-ice">{profile?.full_name || name}</span>
          <span className="block truncate text-xs text-mint-ice/50">{user?.email}</span>
        </span>
      </Link>
      <Button variant="ghost-dark" className="mt-1 w-full justify-start rounded-2xl" onClick={logout}>
        <LogOut className="h-4 w-4" /> Logout
      </Button>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="bg-navy-gradient sticky top-0 hidden h-screen w-64 shrink-0 flex-col p-5 lg:flex">
        <Link to="/dashboard" className="mb-8 flex items-center gap-3 px-1">
          <LogoMark />
          <Wordmark light className="text-sm" />
        </Link>
        <NavLinks />
        <ProfileBlock />
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md lg:hidden">
        <Link to="/dashboard" className="flex items-center gap-2">
          <LogoMark className="h-8 w-8" />
          <Wordmark className="text-xs" />
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu />
        </Button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-navy/50 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="bg-navy-gradient fixed inset-y-0 left-0 z-50 flex w-72 flex-col p-5 lg:hidden"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="mb-8 flex items-center justify-between">
                <Wordmark light className="text-sm" />
                <Button variant="ghost-dark" size="icon" onClick={() => setOpen(false)} aria-label="Close menu">
                  <X />
                </Button>
              </div>
              <NavLinks onNavigate={() => setOpen(false)} />
              <ProfileBlock />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border bg-background/90 px-2 py-2 backdrop-blur-md lg:hidden">
        {NAV.slice(0, 5).map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-xl px-2 py-1 text-[10px] font-semibold",
              isActive(to) ? "text-cadet-deep" : "text-muted-foreground",
            )}
          >
            <Icon className={cn("h-5 w-5", isActive(to) && "text-cadet-deep")} />
            {label.split(" ")[0]}
          </Link>
        ))}
      </nav>

      <main className="min-w-0 flex-1 px-4 pb-24 pt-20 md:px-8 lg:px-10 lg:pb-10 lg:pt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="mx-auto w-full max-w-7xl"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
