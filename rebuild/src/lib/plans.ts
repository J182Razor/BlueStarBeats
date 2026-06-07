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
    priceLabel: "Free forever",
    highlights: [
      "The full instrument: every frequency from 0.1 to 40 Hz, binaural and isochronic",
      "Three saved presets and one journey",
      "Preview everything in the market",
    ],
  },
  {
    tier: "pro" as const,
    name: "Premium",
    priceLabel: "$12 a month or $99 a year",
    highlights: [
      "Unlimited presets and journeys, synced across devices",
      "No sponsor messages, ever",
      "Bring market work into your library and publish your own",
    ],
  },
  {
    tier: "elite" as const,
    name: "Inner Circle",
    priceLabel: "$39 a month or $299 a year",
    highlights: [
      "Everything in Premium",
      "Every protocol pack included, present and future",
    ],
  },
  {
    tier: "founders" as const,
    name: "Founding Member",
    priceLabel: "$149 once",
    highlights: [
      "Lifetime Inner Circle access, one payment",
      "Founding Member mark on everything you publish",
      "Limited to 250 members",
    ],
  },
];
