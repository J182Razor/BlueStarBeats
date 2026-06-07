import type { ReactNode } from "react";
import Link from "next/link";
import { BottomTabs } from "@/components/navigation/bottom-tabs";
import { StarMark } from "@/components/brand/star-mark";

interface SafeShellProps {
  children: ReactNode;
}

export function SafeShell({ children }: SafeShellProps) {
  return (
    <div className="night-sky min-h-dvh text-ink">
      <header className="sticky top-0 z-20 border-b border-[var(--hairline-soft)] bg-[rgba(11,9,18,0.78)] backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-screen-sm items-center justify-between px-5 py-3">
          <Link href="/" className="flex items-center gap-2.5">
            <StarMark className="h-6 w-6" />
            <span className="h-display text-xl tracking-wide">Blue Star Beats</span>
          </Link>
          <Link
            href="/pricing"
            className="rounded-full border border-[var(--hairline)] px-3.5 py-1.5 text-xs font-medium text-gold-bright transition hover:bg-[rgba(212,175,116,0.08)]"
          >
            Go Premium
          </Link>
        </div>
      </header>
      <main className="relative">{children}</main>
      <BottomTabs />
    </div>
  );
}
