"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DEPARTMENTS } from "@/lib/rbac";
import { Stamp } from "@/components/Stamp";

/**
 * Sign-in — email + password. First ever sign-in bootstraps the admin
 * account from ADMIN_EMAIL / ADMIN_PASSWORD env vars (server-side).
 */
function LoginForm() {
  const search = useSearchParams();
  const next = search.get("next") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Sign-in failed. Check your email and password.");
        return;
      }
      // Full load so the session context picks up the new cookie.
      window.location.href = next.startsWith("/") && !next.startsWith("//") ? next : "/";
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto grid min-h-[72vh] max-w-5xl items-stretch overflow-hidden rounded-2xl border border-line bg-panel shadow-card md:grid-cols-[1fr_1.1fr]">
      <div className="stars relative isolate hidden flex-col justify-between overflow-hidden bg-nil p-8 text-white md:flex">
        <span aria-hidden className="animate-drift-a absolute -left-20 -top-24 -z-10 h-72 w-72 rounded-full bg-gold/30 blur-3xl" />
        <span aria-hidden className="animate-drift-b absolute -bottom-32 -right-16 -z-10 h-80 w-80 rounded-full bg-nil-4/70 blur-3xl" />
        <div>
          <p className="font-display text-[30px] font-semibold tracking-tight">magistick</p>
          <p className="mt-2 max-w-xs text-[14px] leading-relaxed text-white/75">
            One front door for DEJOIY: your apps, your department&rsquo;s updates, your reporting line and your tickets.
          </p>
        </div>
        <ul className="grid grid-cols-4 gap-x-4 gap-y-5" aria-label="Departments">
          {DEPARTMENTS.map((d) => (
            <li key={d.id} className="flex flex-col items-start gap-1.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-md" style={{ backgroundColor: d.dye }}>
                <Stamp dept={d.id} size={18} color="rgba(255,255,255,0.9)" />
              </span>
              <span className="text-[11.5px] leading-tight text-white/70">{d.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-center px-6 py-12 sm:px-10">
        <form onSubmit={submit} className="w-full max-w-sm" noValidate>
          <h1 className="text-[26px] font-semibold tracking-tight text-ink">Sign in</h1>
          <p className="mt-1 text-[14px] text-stone-600">Use your DEJOIY work email.</p>
          {error && (
            <p role="alert" className="mt-5 rounded-lg border border-bad/30 bg-bad-tint px-3.5 py-2.5 text-[13.5px] text-bad">
              {error}
            </p>
          )}
          <label className="mt-6 block">
            <span className="mb-1.5 block text-[13px] font-medium text-stone-700">Work email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@dejoiy.com"
              className="h-11 w-full rounded-lg border border-line bg-panel px-3.5 text-[14px] text-ink placeholder:text-stone-400 focus:border-ember focus:outline-none"
            />
          </label>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-[13px] font-medium text-stone-700">Password</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 w-full rounded-lg border border-line bg-panel px-3.5 text-[14px] text-ink focus:border-ember focus:outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="btn-magic mt-6 h-11 w-full rounded-lg bg-ember text-[14px] font-semibold text-white hover:bg-nil disabled:cursor-wait disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
          <p className="mt-5 text-[12.5px] leading-relaxed text-stone-500">
            Forgot your password? Your team leader or HR can reset it from Admin → People.
          </p>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
