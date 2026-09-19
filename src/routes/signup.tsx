import { createFileRoute } from "@tanstack/react-router";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignupForm } from "@/components/auth/AuthForms";
import { useRedirectIfSignedIn } from "./index";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create Account — PitchPilot AI" },
      { name: "description", content: "Create your PitchPilot AI account and build your first investor pitch." },
      { property: "og:title", content: "Create Account — PitchPilot AI" },
      { property: "og:description", content: "Create your PitchPilot AI account and build your first investor pitch." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => {
    useRedirectIfSignedIn();
    return (
      <AuthLayout>
        <SignupForm />
      </AuthLayout>
    );
  },
});
