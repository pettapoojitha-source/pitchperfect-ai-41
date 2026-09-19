import { createFileRoute } from "@tanstack/react-router";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ForgotPasswordForm } from "@/components/auth/AuthForms";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password — PitchPilot AI" },
      { name: "description", content: "Request a password reset link for your PitchPilot AI account." },
      { property: "og:title", content: "Forgot Password — PitchPilot AI" },
      { property: "og:description", content: "Request a password reset link for your PitchPilot AI account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  ),
});
