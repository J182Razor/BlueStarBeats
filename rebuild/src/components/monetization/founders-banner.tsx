"use client";

import { useEffect, useState } from "react";
import { FOUNDERS_DEADLINE, FOUNDERS_CAP } from "@/lib/plans";

function formatRemaining(ms: number) {
  if (ms <= 0) return "Offer ended";
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  return `${days}d ${hours}h ${minutes}m left`;
}

export function FoundersBanner() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  const remainingMs = FOUNDERS_DEADLINE.getTime() - now;
  const slotsRemaining = FOUNDERS_CAP;

  return (
    <div className="border-t border-white/10 bg-amber-200/15 px-4 py-2 text-xs text-amber-50">
      <div className="mx-auto flex w-full max-w-screen-sm items-center justify-between gap-2">
        <span className="font-medium">Founders Lifetime $149</span>
        <span>{slotsRemaining} slots</span>
        <span>{formatRemaining(remainingMs)}</span>
      </div>
    </div>
  );
}
