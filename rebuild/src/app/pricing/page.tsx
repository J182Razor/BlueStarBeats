"use client";

import { useEffect, useState } from "react";
import { usePlanTier } from "@/hooks/use-plan-tier";
import { FOUNDERS_CAP, FOUNDERS_DEADLINE, PLANS, type PlanTier } from "@/lib/plans";

const APP_USER_ID_KEY = "bsb_demo_user_id";

function getLocalUserId() {
  const existing = window.localStorage.getItem(APP_USER_ID_KEY);
  if (existing) return existing;
  const next = `demo-${crypto.randomUUID()}`;
  window.localStorage.setItem(APP_USER_ID_KEY, next);
  return next;
}

export default function PricingPage() {
  const { tier, setTier } = usePlanTier();
  const [loadingTier, setLoadingTier] = useState<PlanTier | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [now, setNow] = useState(0);

  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  const foundersCountdown = (() => {
    if (!now) return "Calculating...";
    const ms = FOUNDERS_DEADLINE.getTime() - now;
    if (ms <= 0) return "Offer ended";
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  })();

  async function startCheckout(nextTier: PlanTier, billing: "monthly" | "yearly" | "lifetime") {
    setLoadingTier(nextTier);
    setStatus(null);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: getLocalUserId(),
          tier: nextTier,
          billing,
        }),
      });

      if (!response.ok) throw new Error("Checkout endpoint unavailable");
      const data = (await response.json()) as { url?: string };

      if (!data.url) throw new Error("No checkout URL returned");
      window.location.href = data.url;
    } catch {
      // Local fallback for dev preview without Stripe env configuration.
      setTier(nextTier);
      setStatus(`Stripe not configured locally. Applied ${nextTier.toUpperCase()} in demo mode.`);
    } finally {
      setLoadingTier(null);
    }
  }

  return (
    <section className="mx-auto w-full max-w-screen-sm space-y-4 px-4 pb-28 pt-4">
      <header>
        <h1 className="font-display text-2xl font-semibold text-white">Pricing</h1>
        <p className="mt-2 text-sm text-slate-200/80">
          Day-1 monetization: subscriptions, one-time founders offer, packs, and gated imports.
        </p>
        <p className="mt-2 text-xs text-cyan-100">
          Current plan: <span className="font-semibold uppercase">{tier}</span>
        </p>
      </header>

      <div className="rounded-2xl border border-amber-300/35 bg-amber-100/10 p-4 text-sm text-amber-100">
        <p className="font-semibold">Founders Lifetime · $149 one-time</p>
        <p className="mt-1">
          Cap: {FOUNDERS_CAP} users. Deadline: March 31, 2026 11:59 PM PT.
        </p>
        <p className="mt-1 text-xs">Countdown snapshot: {foundersCountdown} remaining.</p>
      </div>

      <div className="space-y-3">
        {PLANS.map((plan) => (
          <article key={plan.tier} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl text-white">{plan.name}</h2>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">
                {plan.priceLabel}
              </span>
            </div>
            <ul className="mt-3 list-disc space-y-1 pl-4 text-sm text-slate-200/80">
              {plan.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              {plan.tier === "free" ? (
                <button
                  onClick={() => setTier("free")}
                  className="rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-100"
                >
                  Keep Free
                </button>
              ) : null}

              {plan.tier === "pro" ? (
                <>
                  <button
                    onClick={() => void startCheckout("pro", "monthly")}
                    disabled={loadingTier !== null}
                    className="rounded-lg bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-950 disabled:opacity-60"
                  >
                    {loadingTier === "pro" ? "Loading..." : "Pro Monthly"}
                  </button>
                  <button
                    onClick={() => void startCheckout("pro", "yearly")}
                    disabled={loadingTier !== null}
                    className="rounded-lg bg-cyan-400/25 px-3 py-2 text-xs text-cyan-100 disabled:opacity-60"
                  >
                    Pro Yearly
                  </button>
                </>
              ) : null}

              {plan.tier === "elite" ? (
                <>
                  <button
                    onClick={() => void startCheckout("elite", "monthly")}
                    disabled={loadingTier !== null}
                    className="rounded-lg bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-950 disabled:opacity-60"
                  >
                    {loadingTier === "elite" ? "Loading..." : "Elite Monthly"}
                  </button>
                  <button
                    onClick={() => void startCheckout("elite", "yearly")}
                    disabled={loadingTier !== null}
                    className="rounded-lg bg-cyan-400/25 px-3 py-2 text-xs text-cyan-100 disabled:opacity-60"
                  >
                    Elite Yearly
                  </button>
                </>
              ) : null}

              {plan.tier === "founders" ? (
                <button
                  onClick={() => void startCheckout("founders", "lifetime")}
                  disabled={loadingTier !== null}
                  className="rounded-lg bg-amber-300 px-3 py-2 text-xs font-semibold text-slate-950 disabled:opacity-60"
                >
                  Claim Founders
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      <article className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200/85">
        <h3 className="font-semibold text-cyan-100">Paywall Trigger Wiring</h3>
        <ul className="mt-2 list-disc space-y-1 pl-4 text-xs">
          <li>After session #2: prompt preset-saving upgrade.</li>
          <li>After session #3: prompt ad-free + unlimited upgrade.</li>
          <li>4th waypoint attempt: blocked on Free in Programs builder.</li>
          <li>Marketplace import: blocked unless Pro/Elite/Founders.</li>
          <li>7-day streak: annual prompt shown from Player metrics.</li>
        </ul>
      </article>

      {status ? (
        <p className="rounded-lg border border-cyan-300/25 bg-cyan-400/10 p-3 text-xs text-cyan-100">
          {status}
        </p>
      ) : null}
    </section>
  );
}
