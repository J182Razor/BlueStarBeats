"use client";

import { useState } from "react";
import { usePlanTier } from "@/hooks/use-plan-tier";
import { FoundersBanner } from "@/components/monetization/founders-banner";
import { PLANS, type PlanTier } from "@/lib/plans";

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
      setStatus("Checkout is in preview here, so your plan switched locally instead.");
    } finally {
      setLoadingTier(null);
    }
  }

  const currentPlanName = PLANS.find((plan) => plan.tier === tier)?.name ?? "Free";

  return (
    <section className="mx-auto w-full max-w-screen-sm space-y-5 px-5 pb-32 pt-6">
      <header>
        <h1 className="h-display text-[1.75rem]">Pay for depth, not the instrument</h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          Every frequency stays free, forever. Premium is for the practice that grows around them.
        </p>
        <p className="mt-2 text-xs text-gold-bright">You are on {currentPlanName}.</p>
      </header>

      <FoundersBanner />

      <div className="space-y-3.5">
        {PLANS.map((plan) => (
          <article key={plan.tier} className={plan.tier === "pro" ? "card-gold" : "card"}>
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="h-display text-2xl">{plan.name}</h2>
              <span className="shrink-0 text-sm text-gold-bright">{plan.priceLabel}</span>
            </div>
            <ul className="mt-3 space-y-1.5 text-sm text-ink-muted">
              {plan.highlights.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <span aria-hidden="true" className="text-gold">
                    ·
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              {plan.tier === "free" ? (
                <button onClick={() => setTier("free")} className="btn-quiet text-xs">
                  Stay Free
                </button>
              ) : null}

              {plan.tier === "pro" ? (
                <>
                  <button
                    onClick={() => void startCheckout("pro", "yearly")}
                    disabled={loadingTier !== null}
                    className="btn-gold text-xs"
                  >
                    {loadingTier === "pro" ? "One moment" : "Yearly · $99"}
                  </button>
                  <button
                    onClick={() => void startCheckout("pro", "monthly")}
                    disabled={loadingTier !== null}
                    className="btn-quiet text-xs"
                  >
                    Monthly · $12
                  </button>
                </>
              ) : null}

              {plan.tier === "elite" ? (
                <>
                  <button
                    onClick={() => void startCheckout("elite", "yearly")}
                    disabled={loadingTier !== null}
                    className="btn-gold text-xs"
                  >
                    {loadingTier === "elite" ? "One moment" : "Yearly · $299"}
                  </button>
                  <button
                    onClick={() => void startCheckout("elite", "monthly")}
                    disabled={loadingTier !== null}
                    className="btn-quiet text-xs"
                  >
                    Monthly · $39
                  </button>
                </>
              ) : null}

              {plan.tier === "founders" ? (
                <button
                  onClick={() => void startCheckout("founders", "lifetime")}
                  disabled={loadingTier !== null}
                  className="btn-gold text-xs"
                >
                  {loadingTier === "founders" ? "One moment" : "Become a Founding Member"}
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      <article className="card text-sm text-ink-muted">
        <h3 className="h-display text-lg text-ink">Our promises</h3>
        <ul className="mt-2 space-y-1.5">
          <li className="flex gap-2.5">
            <span aria-hidden="true" className="text-gold">
              ·
            </span>
            What is free today stays free. We will never move it behind a paywall.
          </li>
          <li className="flex gap-2.5">
            <span aria-hidden="true" className="text-gold">
              ·
            </span>
            No card needed to use the free plan, and no surprise charges.
          </li>
          <li className="flex gap-2.5">
            <span aria-hidden="true" className="text-gold">
              ·
            </span>
            Cancel any time from your account page. It takes one tap, not an email.
          </li>
        </ul>
      </article>

      {status ? <p className="card-gold text-xs">{status}</p> : null}
    </section>
  );
}
