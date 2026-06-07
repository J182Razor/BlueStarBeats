"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuthSession } from "@/hooks/use-auth-session";
import { usePlanTier } from "@/hooks/use-plan-tier";
import { useSessionMetrics } from "@/hooks/use-session-metrics";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import { PLANS, type PlanTier } from "@/lib/plans";

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

  const planName = PLANS.find((plan) => plan.tier === tier)?.name ?? "Free";

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
    setAuthMessage("Welcome back.");
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
    setAuthMessage("Account created. Check your email if confirmation is required.");
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
    <section className="mx-auto w-full max-w-screen-sm space-y-5 px-5 pb-32 pt-6">
      <header>
        <h1 className="h-display text-[1.75rem]">Your practice</h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          Your plan, your account, and the shape of your listening.
        </p>
      </header>

      {checkoutStatus ? (
        <div className="card-gold text-xs">
          {checkoutStatus === "success"
            ? "Your upgrade is complete. Welcome."
            : `Checkout status: ${checkoutStatus}.`}
        </div>
      ) : null}

      <article className="card">
        <div className="flex items-baseline justify-between">
          <h2 className="h-display text-xl">Plan</h2>
          <span className="text-sm text-gold-bright">{planName}</span>
        </div>

        <ul className="mt-3 space-y-1.5 text-sm text-ink-muted">
          <li>
            Library:{" "}
            {entitlements.maxPresets === 9999 ? "unlimited presets" : `${entitlements.maxPresets} presets`}
          </li>
          <li>
            Journeys:{" "}
            {entitlements.maxPrograms === 9999
              ? "unlimited, with unlimited phases"
              : `${entitlements.maxPrograms}, up to ${entitlements.maxWaypoints} phases`}
          </li>
          <li>Market: browse and preview{entitlements.canImport ? ", import, and publish" : " only"}</li>
          <li>Protocol packs: {entitlements.canAccessPacks ? "all included" : "available separately"}</li>
          <li>Sponsor messages: {entitlements.adsEnabled ? "on the free plan" : "none"}</li>
        </ul>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Link href="/pricing" className="btn-gold text-xs">
            Manage Plan
          </Link>
          <span className="text-[11px] text-ink-faint">Change or cancel any time.</span>
        </div>

        {!authSession.authenticated ? (
          <div className="mt-4 border-t border-[var(--hairline-soft)] pt-3">
            <p className="label mb-2">Preview a plan (this device only)</p>
            <div className="flex flex-wrap gap-2">
              {ALL_TIERS.map((option) => (
                <button
                  key={option}
                  onClick={() => setTier(option)}
                  className={`chip text-xs ${tier === option ? "chip-active" : ""}`}
                >
                  {PLANS.find((plan) => plan.tier === option)?.name}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </article>

      <article className="card">
        <h2 className="h-display text-xl">Account</h2>
        {authEnabled ? (
          <>
            <p className="mt-1.5 text-xs text-ink-muted">
              {authSession.user?.email
                ? `Signed in as ${authSession.user.email}`
                : "Sign in to keep your library with you on every device."}
              {authSession.loading ? " · syncing" : ""}
            </p>
            {!authSession.user?.email ? (
              <div className="mt-3 space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="field"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Password"
                  className="field"
                />
              </div>
            ) : null}
            <div className="mt-3 flex gap-2">
              {!authSession.user?.email ? (
                <>
                  <button onClick={() => void signIn()} className="btn-gold text-xs">
                    Sign In
                  </button>
                  <button onClick={() => void signUp()} className="btn-quiet text-xs">
                    Create Account
                  </button>
                </>
              ) : (
                <button onClick={() => void signOut()} className="btn-quiet text-xs">
                  Sign Out
                </button>
              )}
            </div>
          </>
        ) : (
          <p className="mt-2 text-xs text-ink-muted">
            Accounts open soon. Until then, your library lives safely on this device.
          </p>
        )}
        {authMessage ? <p className="mt-2 text-xs text-gold-bright">{authMessage}</p> : null}
      </article>

      <article className="card">
        <h2 className="h-display text-xl">Your listening</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-[var(--hairline-soft)] p-4 text-center">
            <p className="hz-readout text-3xl text-gold-bright">{metrics.totalSessions}</p>
            <p className="mt-1 text-xs text-ink-muted">sessions completed</p>
          </div>
          <div className="rounded-2xl border border-[var(--hairline-soft)] p-4 text-center">
            <p className="hz-readout text-3xl text-gold-bright">{metrics.currentStreak}</p>
            <p className="mt-1 text-xs text-ink-muted">day streak</p>
          </div>
        </div>
      </article>

      <p className="text-center text-[11px] text-ink-faint">
        <Link href="/faq" className="hover:text-ink-muted">
          Questions
        </Link>
        {" · "}
        <Link href="/legal/terms" className="hover:text-ink-muted">
          Terms
        </Link>
        {" · "}
        <Link href="/legal/privacy" className="hover:text-ink-muted">
          Privacy
        </Link>
        {" · "}
        <Link href="/legal/disclaimer" className="hover:text-ink-muted">
          Wellness note
        </Link>
      </p>
    </section>
  );
}
