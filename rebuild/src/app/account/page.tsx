"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAuthSession } from "@/hooks/use-auth-session";
import { usePlanTier } from "@/hooks/use-plan-tier";
import { useSessionMetrics } from "@/hooks/use-session-metrics";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import { FOUNDERS_DEADLINE, type PlanTier } from "@/lib/plans";

const ALL_TIERS: PlanTier[] = ["free", "pro", "elite", "founders"];

export default function AccountPage() {
  const authSession = useAuthSession();
  const { tier: guestTier, setTier, entitlements: guestEntitlements } = usePlanTier();
  const tier = authSession.authenticated ? authSession.tier : guestTier;
  const entitlements = authSession.authenticated ? authSession.entitlements : guestEntitlements;
  const { metrics } = useSessionMetrics();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const checkoutStatus =
    typeof window === "undefined"
      ? null
      : new URLSearchParams(window.location.search).get("checkout");

  const authEnabled =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const foundersUtc = useMemo(() => FOUNDERS_DEADLINE.toUTCString(), []);

  async function signIn() {
    if (!authEnabled) return;
    const supabase = getBrowserSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setAuthMessage(error.message);
      return;
    }
    setAuthMessage("Signed in.");
    authSession.refresh();
  }

  async function signUp() {
    if (!authEnabled) return;
    const supabase = getBrowserSupabaseClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      setAuthMessage(error.message);
      return;
    }
    setAuthMessage("Sign-up submitted. Confirm email if verification is enabled.");
    authSession.refresh();
  }

  async function signOut() {
    if (!authEnabled) return;
    const supabase = getBrowserSupabaseClient();
    await supabase.auth.signOut();
    setAuthMessage("Signed out.");
    authSession.refresh();
  }

  return (
    <section className="mx-auto w-full max-w-screen-sm space-y-4 px-4 pb-28 pt-4">
      <header>
        <h1 className="font-display text-2xl font-semibold text-white">Account</h1>
        <p className="mt-2 text-sm text-slate-200/80">
          Auth, entitlement state, session metrics, and monetization controls.
        </p>
      </header>

      {checkoutStatus ? (
        <div className="rounded-xl border border-cyan-300/30 bg-cyan-400/10 p-3 text-xs text-cyan-100">
          Checkout result: {checkoutStatus}.
        </div>
      ) : null}

      <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <h2 className="text-sm font-semibold text-cyan-100">Plan & Entitlements</h2>
        <p className="mt-2 text-xs text-slate-300">Current plan: {tier.toUpperCase()}</p>

        <div className="mt-2 flex flex-wrap gap-2">
          {ALL_TIERS.map((option) => (
            <button
              key={option}
              onClick={() => setTier(option)}
              disabled={authSession.authenticated}
              className={`rounded-full px-3 py-1 text-xs ${
                tier === option ? "bg-cyan-400/30 text-cyan-100" : "bg-slate-800 text-slate-300"
              } disabled:opacity-50`}
            >
              {option}
            </button>
          ))}
        </div>
        {authSession.authenticated ? (
          <p className="mt-2 text-[11px] text-slate-400">
            Plan switches for authenticated users are controlled by Stripe/webhook entitlements.
          </p>
        ) : null}

        <ul className="mt-3 space-y-1 text-xs text-slate-200">
          <li>Ads enabled: {entitlements.adsEnabled ? "Yes" : "No"}</li>
          <li>Max presets: {entitlements.maxPresets === 9999 ? "Unlimited" : entitlements.maxPresets}</li>
          <li>Max programs: {entitlements.maxPrograms === 9999 ? "Unlimited" : entitlements.maxPrograms}</li>
          <li>
            Max waypoints/program: {entitlements.maxWaypoints === 9999 ? "Unlimited" : entitlements.maxWaypoints}
          </li>
          <li>Marketplace import: {entitlements.canImport ? "Enabled" : "Locked"}</li>
          <li>Marketplace publish: {entitlements.canPublish ? "Enabled" : "Locked"}</li>
          <li>Packs access: {entitlements.canAccessPacks ? "Included" : "Purchase required"}</li>
        </ul>
      </article>

      <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <h2 className="text-sm font-semibold text-cyan-100">Auth</h2>
        {authEnabled ? (
          <>
            <p className="mt-1 text-xs text-slate-300">
              Signed in as: {authSession.user?.email ?? "guest"}
              {authSession.loading ? " (syncing session...)" : ""}
            </p>
            <div className="mt-2 grid grid-cols-1 gap-2">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="email@domain.com"
                className="rounded-lg border border-white/15 bg-slate-900/80 px-3 py-2 text-sm text-white"
              />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="password"
                className="rounded-lg border border-white/15 bg-slate-900/80 px-3 py-2 text-sm text-white"
              />
            </div>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => void signIn()}
                className="rounded-lg bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-950"
              >
                Sign In
              </button>
              <button
                onClick={() => void signUp()}
                className="rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-200"
              >
                Sign Up
              </button>
              <button
                onClick={() => void signOut()}
                className="rounded-lg bg-rose-500/80 px-3 py-2 text-xs text-white"
              >
                Sign Out
              </button>
            </div>
          </>
        ) : (
          <p className="mt-2 text-xs text-slate-300">
            Supabase public env vars are not set in this environment. Auth form will activate when
            `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are configured.
          </p>
        )}
        {authMessage ? <p className="mt-2 text-xs text-cyan-100">{authMessage}</p> : null}
      </article>

      <article className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-200">
        <h2 className="text-sm font-semibold text-cyan-100">Metrics</h2>
        <p className="mt-2">Total sessions: {metrics.totalSessions}</p>
        <p>Current streak: {metrics.currentStreak} days</p>
      </article>

      <div className="rounded-2xl border border-amber-400/30 bg-amber-100/10 p-4 text-sm text-amber-100">
        Founders Lifetime deadline: March 31, 2026 11:59 PM PT ({foundersUtc})
      </div>

      <Link
        href="/pricing"
        className="inline-block rounded-lg bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950"
      >
        Manage Plan
      </Link>
    </section>
  );
}
