"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const TABS = [
  { href: "/", label: "Player" },
  { href: "/presets", label: "Presets" },
  { href: "/programs", label: "Programs" },
  { href: "/marketplace", label: "Market" },
  { href: "/account", label: "Account" },
];

export function BottomTabs() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-screen-sm border-t border-white/10 bg-slate-950/95 px-2 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-2 backdrop-blur">
      <ul className="grid grid-cols-5 gap-1">
        {TABS.map((tab) => {
          const active =
            tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);

          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={clsx(
                  "flex h-12 items-center justify-center rounded-xl text-xs font-medium transition",
                  active
                    ? "bg-cyan-400/20 text-cyan-200"
                    : "text-slate-300 hover:bg-white/10 hover:text-white",
                )}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
