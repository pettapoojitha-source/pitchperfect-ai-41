import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setLoading(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return { session, user: session?.user ?? null, loading };
}

export type Profile = { id: string; full_name: string; email: string; created_at: string };

export function useProfile(user: User | null) {
  return useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Profile> => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return (
        (data as Profile | null) ?? {
          id: user!.id,
          full_name: (user!.user_metadata?.["full_name"] as string) ?? "",
          email: user!.email ?? "",
          created_at: user!.created_at,
        }
      );
    },
  });
}

export function firstName(profile?: Profile | null, user?: User | null): string {
  const name = profile?.full_name || (user?.user_metadata?.["full_name"] as string | undefined) || "";
  const first = name.trim().split(/\s+/)[0];
  if (first) return first;
  return user?.email?.split("@")[0] ?? "Founder";
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
