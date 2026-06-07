"use client";

import { useState } from "react";
import { usePlanTier } from "@/hooks/use-plan-tier";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";

interface PackItem {
  code: string;
  name: string;
  description: string;
  priceLabel: string;
  priceId: string;
}

interface TipItem {
  code: string;
  label: string;
  priceId: string;
}

const PACKS: PackItem[] = [
  {
    code: "pack_sleep",
    name: "Sleep Protocol Pack",
    description: "Nine delta descents for falling asleep and staying there, 20 to 60 minutes.",
    priceLabel: "$19",
    priceId: "price_pack_sleep",
  },
  {
    code: "pack_focus",
    name: "Focus Protocol Pack",
    description: "Twelve beta and gamma sessions for deep work blocks, 25 to 90 minutes.",
    priceLabel: "$29",
    priceId: "price_pack_focus",
  },
  {
    code: "pack_performance",
    name: "Performance Pack",
    description: "The complete cycle: morning clarity, afternoon drive, evening release.",
    priceLabel: "$49",
    priceId: "price_pack_performance",
  },
];

const TIPS: TipItem[] = [
  { code: "tip_5", label: "$5", priceId: "price_tip_5" },
  { code: "tip_10", label: "$10", priceId: "price_tip_10" },
  { code: "tip_25", label: "$25", priceId: "price_tip_25" },
];

const PURCHASED_PACKS_KEY = "bsb_purchased_packs";
const APP_USER_ID_KEY = "bsb_demo_user_id";

function getLocalUserId() {
  const existing = window.localStorage.getItem(APP_USER_ID_KEY);
  if (existing) return existing;
  const next = `demo-${crypto.randomUUID()}`;
  window.localStorage.setItem(APP_USER_ID_KEY, next);
  return next;
}

export default function PacksPage() {
  const { entitlements } = usePlanTier();
  const [status, setStatus] = useState<string | null>(null);
  const [purchased, setPurchased] = useLocalStorageState<string[]>(PURCHASED_PACKS_KEY, []);
  const [tipsSent, setTipsSent] = useLocalStorageState<string[]>("bsb_tip_purchases", []);

  async function checkoutPack(pack: PackItem) {
    if (entitlements.canAccessPacks) {
      setStatus("Your plan already includes every pack.");
      return;
    }

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: getLocalUserId(),
          mode: "payment",
          purchaseType: "pack",
          priceId: pack.priceId,
        }),
      });
      if (!response.ok) throw new Error("Checkout unavailable");
      const data = (await response.json()) as { url?: string };
      if (!data.url) throw new Error("Checkout unavailable");
      window.location.href = data.url;
    } catch {
      setPurchased((current) => (current.includes(pack.code) ? current : [...current, pack.code]));
      setStatus(`Checkout is in preview here, so ${pack.name} was added locally.`);
    }
  }

  async function sendTip(tip: TipItem) {
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: getLocalUserId(),
          mode: "payment",
          purchaseType: "tip",
          priceId: tip.priceId,
        }),
      });
      if (!response.ok) throw new Error("Checkout unavailable");
      const data = (await response.json()) as { url?: string };
      if (!data.url) throw new Error("Checkout unavailable");
      window.location.href = data.url;
    } catch {
      setTipsSent((current) => (current.includes(tip.code) ? current : [...current, tip.code]));
      setStatus(`Checkout is in preview here, so your ${tip.label} thank-you was noted locally.`);
    }
  }

  return (
    <section className="mx-auto w-full max-w-screen-sm space-y-5 px-5 pb-32 pt-6">
      <header>
        <h1 className="h-display text-[1.75rem]">Protocol packs</h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          Crafted collections, bought once and owned outright. Inner Circle and Founding Members
          have them all included.
        </p>
      </header>

      <div className="space-y-3">
        {PACKS.map((pack) => {
          const owned = entitlements.canAccessPacks || purchased.includes(pack.code);
          return (
            <article key={pack.code} className="card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="h-display text-xl">{pack.name}</h2>
                  <p className="mt-1 text-sm text-ink-muted">{pack.description}</p>
                  <p className="mt-1.5 text-xs text-gold-bright">{pack.priceLabel} · once, yours forever</p>
                </div>
                <button
                  onClick={() => void checkoutPack(pack)}
                  disabled={owned}
                  className="btn-gold shrink-0 px-4 py-2 text-xs"
                >
                  {owned ? "Owned" : "Own It"}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <article className="card">
        <h2 className="h-display text-xl">Thank a creator</h2>
        <p className="mt-1 text-sm text-ink-muted">
          A one-time gesture for someone whose frequencies carried you somewhere good.
        </p>
        <div className="mt-3 flex gap-2">
          {TIPS.map((tip) => {
            const sent = tipsSent.includes(tip.code);
            return (
              <button key={tip.code} onClick={() => void sendTip(tip)} className="btn-quiet text-xs">
                {sent ? `${tip.label} sent` : tip.label}
              </button>
            );
          })}
        </div>
      </article>

      {status ? <p className="card-gold text-xs">{status}</p> : null}
    </section>
  );
}
