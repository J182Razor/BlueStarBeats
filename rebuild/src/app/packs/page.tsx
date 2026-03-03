"use client";

import { useState } from "react";
import { usePlanTier } from "@/hooks/use-plan-tier";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";

interface PackItem {
  code: string;
  name: string;
  priceLabel: string;
  priceId: string;
}

interface TipItem {
  code: string;
  label: string;
  priceId: string;
}

const PACKS: PackItem[] = [
  { code: "pack_sleep", name: "Sleep Protocol Pack", priceLabel: "$19", priceId: "price_pack_sleep" },
  { code: "pack_focus", name: "Focus Protocol Pack", priceLabel: "$29", priceId: "price_pack_focus" },
  { code: "pack_performance", name: "Performance Pack", priceLabel: "$49", priceId: "price_pack_performance" },
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
  const { entitlements, tier } = usePlanTier();
  const [status, setStatus] = useState<string | null>(null);
  const [purchased, setPurchased] = useLocalStorageState<string[]>(PURCHASED_PACKS_KEY, []);
  const [tipsSent, setTipsSent] = useLocalStorageState<string[]>("bsb_tip_purchases", []);

  async function checkoutPack(pack: PackItem) {
    if (entitlements.canAccessPacks) {
      setStatus(`Included on ${tier.toUpperCase()}. No purchase required.`);
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
      setStatus(`Stripe not configured. ${pack.name} marked purchased in demo mode.`);
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
      setStatus(`Stripe not configured. ${tip.label} creator tip recorded in demo mode.`);
    }
  }

  return (
    <section className="mx-auto w-full max-w-screen-sm space-y-4 px-4 pb-28 pt-4">
      <h1 className="font-display text-2xl font-semibold text-white">Protocol Packs</h1>
      <p className="text-sm text-slate-200/80">
        One-time packs ($19-$49). Elite and Founders include all packs automatically.
      </p>

      <div className="space-y-2">
        {PACKS.map((pack) => {
          const owned = entitlements.canAccessPacks || purchased.includes(pack.code);
          return (
            <article key={pack.code} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-white">{pack.name}</h2>
                  <p className="text-xs text-slate-300">{pack.priceLabel} one-time</p>
                </div>
                <button
                  onClick={() => void checkoutPack(pack)}
                  disabled={owned}
                  className="rounded-lg bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-950 disabled:bg-slate-700 disabled:text-slate-200"
                >
                  {owned ? "Owned" : "Buy"}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <article className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-200">
        <h2 className="text-sm font-semibold text-cyan-100">Creator Tips</h2>
        <p className="mt-1">Send a one-time creator tip.</p>
        <div className="mt-3 flex gap-2">
          {TIPS.map((tip) => {
            const sent = tipsSent.includes(tip.code);
            return (
              <button
                key={tip.code}
                onClick={() => void sendTip(tip)}
                className="rounded-lg bg-cyan-400/20 px-3 py-2 text-xs font-semibold text-cyan-100"
              >
                {sent ? `${tip.label} Sent` : `Tip ${tip.label}`}
              </button>
            );
          })}
        </div>
      </article>

      {status ? (
        <p className="rounded-lg border border-cyan-300/25 bg-cyan-400/10 p-3 text-xs text-cyan-100">
          {status}
        </p>
      ) : null}
    </section>
  );
}
