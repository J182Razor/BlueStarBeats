"use client";

import { useEffect, useState } from "react";
import { FOUNDERS_DEADLINE, FOUNDERS_CAP } from "@/lib/plans";

function formatRemaining(ms: number) {
  if (ms <= 0) return "Offer closed";
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  return `${days}d ${hours}h remaining`;
}

export function FoundersBanner() {
  const [now, setNow] = useState(0);
  const [slotsRemaining, setSlotsRemaining] = useState(FOUNDERS_CAP);

  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;

    const loadStatus = async () => {
      try {
        const response = await fetch("/api/founders/status", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as { remaining?: number };
        if (active && typeof data.remaining === "number") {
          setSlotsRemaining(Math.max(0, data.remaining));
        }
      } catch {
        // keep default/fallback slots value
      }
    };

    void loadStatus();
    const timer = window.setInterval(() => {
      void loadStatus();
    }, 300000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  if (!now || FOUNDERS_DEADLINE.getTime() - now <= 0) return null;

  return (
    <div className="card-gold flex items-center justify-between gap-3 text-xs">
      <div>
        <p className="text-sm font-medium text-gold-bright">Founding Member · $149 once, yours for life</p>
        <p className="mt-0.5 text-ink-muted">
          {slotsRemaining} of {FOUNDERS_CAP} seats left · {formatRemaining(FOUNDERS_DEADLINE.getTime() - now)}
        </p>
      </div>
    </div>
  );
}
