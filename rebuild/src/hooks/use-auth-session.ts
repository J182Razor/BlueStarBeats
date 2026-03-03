"use client";

import { useCallback, useEffect, useState } from "react";
import { ENTITLEMENTS_BY_TIER, type Entitlements, type PlanTier } from "@/lib/plans";

interface SessionUser {
  id: string;
  email: string | null;
}

interface AuthSessionResponse {
  authenticated: boolean;
  user: SessionUser | null;
  tier: PlanTier;
  entitlements: Entitlements;
}

const GUEST_SESSION: AuthSessionResponse = {
  authenticated: false,
  user: null,
  tier: "free",
  entitlements: ENTITLEMENTS_BY_TIER.free,
};

export function useAuthSession() {
  const [session, setSession] = useState<AuthSessionResponse>(GUEST_SESSION);
  const [loading, setLoading] = useState(true);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        if (!response.ok) throw new Error("session fetch failed");
        const data = (await response.json()) as AuthSessionResponse;
        if (active) setSession(data);
      } catch {
        if (active) setSession(GUEST_SESSION);
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [nonce]);

  const refresh = useCallback(() => {
    setLoading(true);
    setNonce((current) => current + 1);
  }, []);

  return {
    ...session,
    loading,
    refresh,
  };
}
