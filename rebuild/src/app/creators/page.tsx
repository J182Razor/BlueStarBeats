"use client";

import Link from "next/link";
import { useState } from "react";
import { usePlanTier } from "@/hooks/use-plan-tier";

const TIP_AMOUNTS = [5, 10, 25];

export default function CreatorsPage() {
  const { entitlements } = usePlanTier();
  const [message, setMessage] = useState<string | null>(null);

  function handleTip(amount: number) {
    setMessage(`Tip checkout for $${amount} is ready to wire via Stripe one-time price IDs.`);
  }

  return (
    <section className="mx-auto w-full max-w-screen-sm space-y-4 px-4 pb-28 pt-4">
      <h1 className="font-display text-2xl font-semibold text-white">Creators</h1>
      <p className="text-sm text-slate-200/80">
        Publish programs, build credibility, and receive community tips.
      </p>

      <article className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
        <h2 className="text-base font-semibold text-cyan-100">Creator Access</h2>
        <p className="mt-2">
          Publishing requires Pro, Elite, or Founders. Free tier can browse but cannot publish.
        </p>
        <p className="mt-2 text-xs">Current publish entitlement: {entitlements.canPublish ? "Enabled" : "Locked"}</p>
        {!entitlements.canPublish ? (
          <Link
            href="/pricing"
            className="mt-3 inline-block rounded-lg bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-950"
          >
            Upgrade to Publish
          </Link>
        ) : null}
      </article>

      <article className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
        <h2 className="text-base font-semibold text-cyan-100">Tip a Creator</h2>
        <div className="mt-3 flex gap-2">
          {TIP_AMOUNTS.map((amount) => (
            <button
              key={amount}
              onClick={() => handleTip(amount)}
              className="rounded-lg bg-emerald-400/20 px-3 py-2 text-xs text-emerald-100"
            >
              ${amount}
            </button>
          ))}
        </div>
      </article>

      {message ? (
        <p className="rounded-lg border border-cyan-300/25 bg-cyan-400/10 p-3 text-xs text-cyan-100">
          {message}
        </p>
      ) : null}
    </section>
  );
}
