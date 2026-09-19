import { createFileRoute, Outlet, redirect, useLocation } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/login" });
    return { user: data.user };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const location = useLocation();
  // Presentation mode is fullscreen: no app navigation.
  if (/^\/presentation\/[^/]+/.test(location.pathname)) return <Outlet />;
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
