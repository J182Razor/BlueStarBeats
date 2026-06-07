"use client";

import Link from "next/link";
import { useState } from "react";
import { usePlanTier } from "@/hooks/use-plan-tier";

const TIP_AMOUNTS = [5, 10, 25];

export default function CreatorsPage() {
  const { entitlements } = usePlanTier();
  const [message, setMessage] = useState<string | null>(null);

  function handleTip(amount: number) {
    setMessage(`Your $${amount} thank-you is ready to send once checkout opens.`);
  }

  return (
    <section className="mx-auto w-full max-w-screen-sm space-y-5 px-5 pb-32 pt-6">
      <header>
        <h1 className="h-display text-[1.75rem]">For creators</h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          Publish the frequencies you have refined, build a following, and receive thanks from the
          people they carry.
        </p>
      </header>

      <article className="card">
        <h2 className="h-display text-xl">Publishing</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Anyone can browse and listen. Publishing your own presets and journeys to the market
          comes with Premium.
        </p>
        {!entitlements.canPublish ? (
          <Link href="/pricing" className="btn-gold mt-4 text-xs">
            Open Publishing
          </Link>
        ) : (
          <p className="mt-3 text-xs text-gold-bright">Publishing is open on your plan.</p>
        )}
      </article>

      <article className="card">
        <h2 className="h-display text-xl">Thank a creator</h2>
        <p className="mt-2 text-sm text-ink-muted">
          One-time gestures, passed along to the people behind the work.
        </p>
        <div className="mt-3 flex gap-2">
          {TIP_AMOUNTS.map((amount) => (
            <button key={amount} onClick={() => handleTip(amount)} className="btn-quiet text-xs">
              ${amount}
            </button>
          ))}
        </div>
      </article>

      {message ? <p className="card-gold text-xs">{message}</p> : null}
    </section>
  );
}
