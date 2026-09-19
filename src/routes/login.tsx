import { createFileRoute } from "@tanstack/react-router";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/AuthForms";
import { useRedirectIfSignedIn } from "./index";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — PitchPilot AI" },
      { name: "description", content: "Log in to your PitchPilot AI workspace or try the FarmAI demo." },
      { property: "og:title", content: "Login — PitchPilot AI" },
      { property: "og:description", content: "Log in to your PitchPilot AI workspace or try the FarmAI demo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => {
    useRedirectIfSignedIn();
    return (
      <AuthLayout>
        <LoginForm />
      </AuthLayout>
    );
  },
});
