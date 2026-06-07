"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import type { ComponentType } from "react";
import {
  CircleNotch,
  MoonStars,
  Storefront,
  UserCircle,
  Waveform,
  type IconProps,
} from "@/components/icons";

const TABS: Array<{ href: string; label: string; icon: ComponentType<IconProps> }> = [
  { href: "/", label: "Studio", icon: Waveform },
  { href: "/presets", label: "Library", icon: MoonStars },
  { href: "/programs", label: "Journeys", icon: CircleNotch },
  { href: "/marketplace", label: "Market", icon: Storefront },
  { href: "/account", label: "You", icon: UserCircle },
];

export function BottomTabs() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-screen-sm border-t border-[var(--hairline-soft)] bg-[rgba(11,9,18,0.92)] px-2 pb-[max(env(safe-area-inset-bottom),0.6rem)] pt-1.5 backdrop-blur-md">
      <ul className="grid grid-cols-5 gap-1">
        {TABS.map((tab) => {
          const active =
            tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          const TabIcon = tab.icon;

          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={clsx(
                  "flex h-13 flex-col items-center justify-center gap-0.5 rounded-2xl text-[11px] transition",
                  active
                    ? "text-gold-bright"
                    : "text-ink-faint hover:text-ink-muted",
                )}
              >
                <TabIcon size={21} weight={active ? "fill" : "regular"} />
                <span className={clsx(active && "font-medium")}>{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
