import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/AuthForms";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PitchPilot AI — Turn your idea into a pitch worth remembering" },
      {
        name: "description",
        content:
          "PitchPilot AI generates your investor deck, challenges it with an AI VC Critic, helps you fix the weak points and exports a presentation.",
      },
      { property: "og:title", content: "PitchPilot AI — Build. Challenge. Pitch." },
      {
        property: "og:description",
        content: "Generate the story. Challenge the assumptions. Walk into the pitch prepared.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

/** Redirects signed-in users to the dashboard; otherwise renders the login experience. */
export function useRedirectIfSignedIn() {
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);
}

function Index() {
  useRedirectIfSignedIn();
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
