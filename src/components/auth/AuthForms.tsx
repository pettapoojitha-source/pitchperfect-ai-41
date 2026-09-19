import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Loader2, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEMO_EMAIL, DEMO_PASSWORD, ensureDemoAccount } from "@/lib/demo.functions";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Field({
  id,
  label,
  type = "text",
  value,
  onChange,
  error,
  autoComplete,
  placeholder,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string | undefined;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-bold uppercase tracking-wider text-cadet-deep">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={!!error}
        className="h-11 rounded-xl border-border bg-card/80 text-base focus-visible:ring-mint-deep"
      />
      {error && <p className="text-xs font-medium text-critical">{error}</p>}
    </div>
  );
}

export function DemoButton({ className }: { className?: string }) {
  const navigate = useNavigate();
  const provision = useServerFn(ensureDemoAccount);
  const [loading, setLoading] = useState(false);

  const tryDemo = async () => {
    setLoading(true);
    try {
      const res = await provision();
      if (!res.ok) throw new Error(res.error ?? "Demo unavailable");
      const { error } = await supabase.auth.signInWithPassword({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
      if (error) throw error;
      toast.success("Welcome to the FarmAI demo workspace");
      navigate({ to: "/dashboard" });
    } catch (e) {
      toast.error((e as Error).message || "Demo is temporarily unavailable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="mint" size="lg" className={className} onClick={tryDemo} disabled={loading}>
      {loading ? <Loader2 className="animate-spin" /> : <PlayCircle />}
      {loading ? "Preparing demo…" : "Try Demo →"}
    </Button>
  );
}

export function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!EMAIL_RE.test(email)) errs.email = "Enter a valid email address.";
    if (!password) errs.password = "Enter your password.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      toast.error(error.message.includes("Invalid") ? "Invalid email or password." : error.message);
      return;
    }
    toast.success("Welcome back");
    navigate({ to: "/dashboard" });
  };

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <div>
        <h2 className="font-display text-2xl font-extrabold text-navy">Welcome back</h2>
        <p className="mt-1 text-sm text-muted-foreground">Log in to your pitch workspace.</p>
      </div>
      <Field id="email" label="Email" type="email" value={email} onChange={setEmail} error={errors.email} autoComplete="email" placeholder="founder@startup.com" />
      <Field id="password" label="Password" type="password" value={password} onChange={setPassword} error={errors.password} autoComplete="current-password" placeholder="••••••••" />
      <div className="flex items-center justify-between text-sm">
        <Link to="/forgot-password" className="font-semibold text-cadet-deep hover:underline">
          Forgot Password?
        </Link>
        <Link to="/signup" className="font-semibold text-cadet-deep hover:underline">
          Create New Account
        </Link>
      </div>
      <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="animate-spin" /> : null}
        Login <ArrowRight />
      </Button>
      <div className="relative py-1 text-center text-xs uppercase tracking-widest text-muted-foreground">
        <span className="relative z-10 bg-transparent px-2">or</span>
      </div>
      <DemoButton className="w-full" />
      <p className="text-center text-[11px] text-muted-foreground">
        Demo opens a pre-populated FarmAI workspace for a guided walkthrough.
      </p>
    </form>
  );
}

export function SignupForm() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; password?: string; confirm?: string }>({});

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (fullName.trim().length < 2) errs.fullName = "Enter your full name.";
    if (!EMAIL_RE.test(email)) errs.email = "Enter a valid email address.";
    if (password.length < 8) errs.password = "Password must be at least 8 characters.";
    if (confirm !== password) errs.confirm = "Passwords do not match.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName.trim() }, emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message.toLowerCase().includes("already") ? "An account with this email already exists." : error.message);
      return;
    }
    // With email confirmation off, identities will be present and a session returned.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      toast.error("An account with this email already exists.");
      return;
    }
    if (data.session) {
      toast.success("Account created ✓");
      navigate({ to: "/dashboard" });
    } else {
      toast.success("Account created. Check your email to confirm, then log in.");
      navigate({ to: "/login" });
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div>
        <h2 className="font-display text-2xl font-extrabold text-navy">Create your account</h2>
        <p className="mt-1 text-sm text-muted-foreground">Your first pitch is a few minutes away.</p>
      </div>
      <Field id="name" label="Full Name" value={fullName} onChange={setFullName} error={errors.fullName} autoComplete="name" placeholder="Ada Lovelace" />
      <Field id="email" label="Email" type="email" value={email} onChange={setEmail} error={errors.email} autoComplete="email" placeholder="founder@startup.com" />
      <Field id="password" label="Password" type="password" value={password} onChange={setPassword} error={errors.password} autoComplete="new-password" placeholder="Minimum 8 characters" />
      <Field id="confirm" label="Confirm Password" type="password" value={confirm} onChange={setConfirm} error={errors.confirm} autoComplete="new-password" placeholder="Repeat password" />
      <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="animate-spin" /> : null}
        Create Account <ArrowRight />
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-cadet-deep hover:underline">
          Login
        </Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) {
      toast.error("Enter a valid email address.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
  };

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <div>
        <h2 className="font-display text-2xl font-extrabold text-navy">Reset your password</h2>
        <p className="mt-1 text-sm text-muted-foreground">We'll email you a secure link to set a new one.</p>
      </div>
      {sent ? (
        <div className="rounded-2xl bg-mint-ice p-4 text-sm text-cadet-deep">
          If an account exists for <strong>{email}</strong>, a reset link is on its way.
        </div>
      ) : (
        <>
          <Field id="email" label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" placeholder="founder@startup.com" />
          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : null}
            Send reset link <ArrowRight />
          </Button>
        </>
      )}
      <p className="text-center text-sm">
        <Link to="/login" className="font-semibold text-cadet-deep hover:underline">
          Back to login
        </Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated ✓");
    navigate({ to: "/dashboard" });
  };

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <div>
        <h2 className="font-display text-2xl font-extrabold text-navy">Choose a new password</h2>
      </div>
      <Field id="password" label="New Password" type="password" value={password} onChange={setPassword} autoComplete="new-password" />
      <Field id="confirm" label="Confirm Password" type="password" value={confirm} onChange={setConfirm} autoComplete="new-password" />
      <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="animate-spin" /> : null}
        Update password <ArrowRight />
      </Button>
    </form>
  );
}
