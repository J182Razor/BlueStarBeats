import { ENTITLEMENTS_BY_TIER, type PlanTier } from "@/lib/plans";

export function resolveTier(input: unknown): PlanTier {
  if (input === "pro" || input === "elite" || input === "founders") return input;
  return "free";
}

export function getEntitlementsForTier(tier: PlanTier) {
  return ENTITLEMENTS_BY_TIER[tier];
}

export function canCreatePreset(tier: PlanTier, existingCount: number) {
  const limit = ENTITLEMENTS_BY_TIER[tier].maxPresets;
  return existingCount < limit;
}

export function canCreateProgram(tier: PlanTier, existingCount: number) {
  const limit = ENTITLEMENTS_BY_TIER[tier].maxPrograms;
  return existingCount < limit;
}

export function canAddWaypoint(tier: PlanTier, waypointCount: number) {
  const limit = ENTITLEMENTS_BY_TIER[tier].maxWaypoints;
  return waypointCount <= limit;
}
