import { resolveTier } from "@/lib/entitlements";
import { ENTITLEMENTS_BY_TIER, type Entitlements, type PlanTier } from "@/lib/plans";
import { getServerSupabaseClient } from "@/lib/supabase/server";

interface EntitlementsRow {
  ads_enabled: boolean;
  max_presets: number;
  max_programs: number;
  max_waypoints: number;
  can_import: boolean;
  can_publish: boolean;
  can_access_packs: boolean;
}

interface UserProfileRow {
  plan_tier: string | null;
}

interface SessionUser {
  id: string;
  email: string | null;
}

export interface ServerSessionWithEntitlements {
  authenticated: boolean;
  user: SessionUser | null;
  tier: PlanTier;
  entitlements: Entitlements;
}

function mapEntitlementsRow(row: EntitlementsRow): Entitlements {
  return {
    adsEnabled: row.ads_enabled,
    maxPresets: row.max_presets,
    maxPrograms: row.max_programs,
    maxWaypoints: row.max_waypoints,
    canImport: row.can_import,
    canPublish: row.can_publish,
    canAccessPacks: row.can_access_packs,
  };
}

export async function getServerSessionWithEntitlements(): Promise<ServerSessionWithEntitlements> {
  const guestSession: ServerSessionWithEntitlements = {
    authenticated: false,
    user: null,
    tier: "free",
    entitlements: ENTITLEMENTS_BY_TIER.free,
  };

  try {
    const supabase = await getServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return guestSession;

    const [profileResult, entitlementsResult] = await Promise.all([
      supabase
        .from("user_profiles")
        .select("plan_tier")
        .eq("user_id", user.id)
        .maybeSingle<UserProfileRow>(),
      supabase
        .from("entitlements")
        .select("ads_enabled,max_presets,max_programs,max_waypoints,can_import,can_publish,can_access_packs")
        .eq("user_id", user.id)
        .maybeSingle<EntitlementsRow>(),
    ]);

    const tier = resolveTier(profileResult.data?.plan_tier);
    const entitlements = entitlementsResult.data
      ? mapEntitlementsRow(entitlementsResult.data)
      : ENTITLEMENTS_BY_TIER[tier];

    return {
      authenticated: true,
      user: {
        id: user.id,
        email: user.email ?? null,
      },
      tier,
      entitlements,
    };
  } catch {
    return guestSession;
  }
}
