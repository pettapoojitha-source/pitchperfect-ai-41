import { createFileRoute } from "@tanstack/react-router";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ResetPasswordForm } from "@/components/auth/AuthForms";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — PitchPilot AI" },
      { name: "description", content: "Set a new password for your PitchPilot AI account." },
      { property: "og:title", content: "Reset Password — PitchPilot AI" },
      { property: "og:description", content: "Set a new password for your PitchPilot AI account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AuthLayout>
      <ResetPasswordForm />
    </AuthLayout>
  ),
});
