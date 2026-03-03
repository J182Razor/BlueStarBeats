"use client";

import { useMemo } from "react";
import { ENTITLEMENTS_BY_TIER, type PlanTier } from "@/lib/plans";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";

const PLAN_STORAGE_KEY = "bsb_plan_tier";

export function usePlanTier() {
  const [tier, setTier, hydrated] = useLocalStorageState<PlanTier>(PLAN_STORAGE_KEY, "free");

  const entitlements = useMemo(() => ENTITLEMENTS_BY_TIER[tier], [tier]);

  return {
    tier,
    setTier,
    entitlements,
    hydrated,
  };
}
