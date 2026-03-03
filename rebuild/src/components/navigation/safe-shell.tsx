import type { ReactNode } from "react";
import Link from "next/link";
import { BottomTabs } from "@/components/navigation/bottom-tabs";
import { FoundersBanner } from "@/components/monetization/founders-banner";

interface SafeShellProps {
  children: ReactNode;
}

export function SafeShell({ children }: SafeShellProps) {
  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_20%_0%,#1f3a63_0%,#0b1023_40%,#070914_100%)] text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-screen-sm items-center justify-between px-4 py-3">
          <Link href="/" className="font-display text-lg tracking-wide text-cyan-200">
            BlueStarBeats
          </Link>
          <Link
            href="/pricing"
            className="rounded-lg bg-cyan-400/20 px-3 py-1 text-xs font-semibold text-cyan-100"
          >
            Upgrade
          </Link>
        </div>
        <FoundersBanner />
      </header>
      <main>{children}</main>
      <BottomTabs />
    </div>
  );
}
