import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/common/primitives";
import { supabase } from "@/integrations/supabase/client";
import { useProfile, useSession } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — PitchPilot AI" },
      { name: "description", content: "Manage your name, password and theme." },
      { property: "og:title", content: "Settings — PitchPilot AI" },
      { property: "og:description", content: "Manage your PitchPilot account." },
    ],
  }),
  component: Settings,
});

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
      <h2 className="font-display text-lg font-extrabold">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Settings() {
  const { user } = useSession();
  const { data: profile } = useProfile(user);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [current, setCurrent] = useState("");
  const [pw, setPw] = useState("");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (profile) setName(profile.full_name);
  }, [profile]);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("pp-theme", next ? "dark" : "light");
  };

  const saveName = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ full_name: name.trim() }).eq("id", user.id);
    if (error) return toast.error(error.message);
    await supabase.auth.updateUser({ data: { full_name: name.trim() } });
    qc.invalidateQueries({ queryKey: ["profile"] });
    toast.success("Changes saved ✓");
  };

  const changePassword = async () => {
    if (pw.length < 8) return toast.error("Password must be at least 8 characters.");
    const { error } = await supabase.auth.updateUser({ password: pw, ...(current ? { current_password: current } : {}) } as never);
    if (error) return toast.error(error.message);
    setPw("");
    setCurrent("");
    toast.success("Password updated ✓");
  };

  const logout = async () => {
    await supabase.auth.signOut();
    qc.clear();
    navigate({ to: "/login" });
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow="Settings" title="Your account." subtitle="Keep it simple. Update the essentials and get back to pitching." />
      <div className="grid gap-5">
        <Card title="Profile">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={profile?.email ?? user?.email ?? ""} disabled className="rounded-xl" />
            </div>
          </div>
          <Button onClick={saveName} disabled={!name.trim() || name === profile?.full_name}>Save name</Button>
        </Card>

        <Card title="Change password">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Current password</Label>
              <Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>New password (min 8 chars)</Label>
              <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} className="rounded-xl" />
            </div>
          </div>
          <Button onClick={changePassword} disabled={pw.length < 8}>Update password</Button>
        </Card>

        <Card title="Theme">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Switch between the iced-mint light theme and the navy dark theme.</p>
            <Button variant="outline" onClick={toggleTheme}>
              {dark ? <Sun /> : <Moon />} {dark ? "Light mode" : "Dark mode"}
            </Button>
          </div>
        </Card>

        <Card title="Session">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Signed in as {user?.email}</p>
            <Button variant="critical" onClick={logout}>
              <LogOut /> Logout
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
