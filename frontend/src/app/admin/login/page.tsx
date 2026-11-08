"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, loading, login } = useAuth();
  const [email, setEmail] = useState("superadmin@mlca.edu");
  const [password, setPassword] = useState("Admin@12345");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) router.replace("/admin");
  }, [loading, user, router]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await login(email, password);
      toast.success("Welcome back!");
      router.replace("/admin");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Unable to sign in. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="hero-pattern relative flex min-h-screen items-center justify-center bg-burgundy-900 px-4 py-10">
      <div className="mon-pattern absolute inset-0 opacity-20" />
      <div className="relative grid w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-2">
        <div className="relative hidden flex-col justify-between bg-burgundy p-10 text-white md:flex">
          <div className="absolute inset-0 border border-gold/10" />
          <div>
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold font-display text-2xl font-bold text-burgundy-900">M</span>
            <h1 className="mt-8 font-display text-3xl font-bold leading-tight">
              Mon Literature &amp; Culture Association
            </h1>
            <p className="mt-3 text-sm text-white/60">University of Computer Studies - Hpa-An</p>
          </div>
          <div className="relative">
            <ShieldCheck className="h-8 w-8 text-gold" />
            <p className="mt-3 text-sm text-white/70">
              Secure administration portal for managing website content, media, members and settings.
            </p>
          </div>
        </div>

        <div className="p-7 md:p-10">
          <h2 className="font-display text-2xl font-bold text-burgundy-800">Administrator Sign In</h2>
          <p className="mt-1 text-sm text-muted">Enter your credentials to access the dashboard.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="pl-9" required autoComplete="email" />
              </div>
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="pl-9 pr-10"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-stone-400 hover:text-burgundy"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}

            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 rounded-lg border border-gold/30 bg-gold/10 p-3 text-[11px] leading-relaxed text-[#6b4f12]">
            <p className="font-bold uppercase tracking-wide">Demo accounts</p>
            <p>superadmin@mlca.edu / Admin@12345</p>
            <p>editor@mlca.edu / Editor@12345</p>
          </div>
        </div>
      </div>
    </div>
  );
}
