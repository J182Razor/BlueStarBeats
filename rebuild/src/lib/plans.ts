export type PlanTier = "free" | "pro" | "elite" | "founders";

export interface Entitlements {
  adsEnabled: boolean;
  maxPresets: number;
  maxPrograms: number;
  maxWaypoints: number;
  canImport: boolean;
  canPublish: boolean;
  canAccessPacks: boolean;
}

export const FOUNDERS_CAP = 250;
export const FOUNDERS_DEADLINE = new Date("2026-04-01T06:59:00.000Z");

export const ENTITLEMENTS_BY_TIER: Record<PlanTier, Entitlements> = {
  free: {
    adsEnabled: true,
    maxPresets: 3,
    maxPrograms: 1,
    maxWaypoints: 3,
    canImport: false,
    canPublish: false,
    canAccessPacks: false,
  },
  pro: {
    adsEnabled: false,
    maxPresets: 9999,
    maxPrograms: 9999,
    maxWaypoints: 9999,
    canImport: true,
    canPublish: true,
    canAccessPacks: false,
  },
  elite: {
    adsEnabled: false,
    maxPresets: 9999,
    maxPrograms: 9999,
    maxWaypoints: 9999,
    canImport: true,
    canPublish: true,
    canAccessPacks: true,
  },
  founders: {
    adsEnabled: false,
    maxPresets: 9999,
    maxPrograms: 9999,
    maxWaypoints: 9999,
    canImport: true,
    canPublish: true,
    canAccessPacks: true,
  },
};

export const PLANS = [
  {
    tier: "free" as const,
    name: "Free",
    priceLabel: "Ad-supported",
    highlights: [
      "3 presets max",
      "1 program max",
      "3 waypoints per program",
      "Browse marketplace",
    ],
  },
  {
    tier: "pro" as const,
    name: "Pro",
    priceLabel: "$12/mo or $99/yr",
    highlights: [
      "No ads",
      "Unlimited presets/programs",
      "Import + publish marketplace",
    ],
  },
  {
    tier: "elite" as const,
    name: "Elite",
    priceLabel: "$39/mo or $299/yr",
    highlights: ["Everything in Pro", "Protocol packs included"],
  },
  {
    tier: "founders" as const,
    name: "Founders Lifetime",
    priceLabel: "$149 one-time",
    highlights: ["Cap 250 seats", "Founders badge", "Lifetime access"],
  },
];
