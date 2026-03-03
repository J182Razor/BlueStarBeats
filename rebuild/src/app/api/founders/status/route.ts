import { NextResponse } from "next/server";
import { FOUNDERS_CAP, FOUNDERS_DEADLINE } from "@/lib/plans";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 10;

export async function GET() {
  const now = Date.now();
  const deadlineIso = FOUNDERS_DEADLINE.toISOString();

  if (now >= FOUNDERS_DEADLINE.getTime()) {
    return NextResponse.json({
      ok: true,
      cap: FOUNDERS_CAP,
      sold: FOUNDERS_CAP,
      remaining: 0,
      deadline: deadlineIso,
      ended: true,
    });
  }

  try {
    const admin = getSupabaseAdminClient();
    const { count, error } = await admin
      .from("purchases")
      .select("id", { count: "exact", head: true })
      .eq("purchase_type", "founders_lifetime")
      .eq("status", "completed");

    if (error) {
      throw error;
    }

    const sold = count ?? 0;
    const remaining = Math.max(0, FOUNDERS_CAP - sold);

    return NextResponse.json({
      ok: true,
      cap: FOUNDERS_CAP,
      sold,
      remaining,
      deadline: deadlineIso,
      ended: remaining === 0,
    });
  } catch {
    return NextResponse.json({
      ok: false,
      cap: FOUNDERS_CAP,
      sold: 0,
      remaining: FOUNDERS_CAP,
      deadline: deadlineIso,
      ended: false,
    });
  }
}
