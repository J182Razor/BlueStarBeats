import Stripe from "stripe";
import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env";
import { FOUNDERS_CAP, FOUNDERS_DEADLINE, type PlanTier } from "@/lib/plans";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 20;

interface CheckoutRequest {
  userId: string;
  priceId?: string;
  mode?: "payment" | "subscription";
  purchaseType?: "plan" | "pack" | "founders_lifetime" | "tip";
  tier?: PlanTier;
  billing?: "monthly" | "yearly" | "lifetime";
}

function resolvePlanPrice(
  env: ReturnType<typeof getServerEnv>,
  tier: PlanTier,
  billing: CheckoutRequest["billing"],
) {
  if (tier === "pro") {
    return billing === "yearly" ? env.STRIPE_PRICE_PRO_YEARLY : env.STRIPE_PRICE_PRO_MONTHLY;
  }
  if (tier === "elite") {
    return billing === "yearly" ? env.STRIPE_PRICE_ELITE_YEARLY : env.STRIPE_PRICE_ELITE_MONTHLY;
  }
  if (tier === "founders") {
    return env.STRIPE_PRICE_FOUNDERS_LIFETIME;
  }
  return null;
}

export async function POST(request: Request) {
  const env = getServerEnv();
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  const body = (await request.json()) as CheckoutRequest;
  let priceId: string | null | undefined = body.priceId;
  let mode = body.mode;
  let purchaseType = body.purchaseType;

  if ((!priceId || !mode || !purchaseType) && body.tier && body.tier !== "free") {
    priceId = resolvePlanPrice(env, body.tier, body.billing);
    mode = body.tier === "founders" ? "payment" : "subscription";
    purchaseType = body.tier === "founders" ? "founders_lifetime" : "plan";
  }

  if (!body.userId || !priceId || !mode || !purchaseType) {
    return NextResponse.json({ error: "Missing checkout fields" }, { status: 400 });
  }

  if (purchaseType === "founders_lifetime" || body.tier === "founders") {
    if (Date.now() >= FOUNDERS_DEADLINE.getTime()) {
      return NextResponse.json({ error: "Founders offer deadline has passed." }, { status: 410 });
    }

    try {
      const admin = getSupabaseAdminClient();
      const { count, error } = await admin
        .from("purchases")
        .select("id", { count: "exact", head: true })
        .eq("purchase_type", "founders_lifetime")
        .eq("status", "completed");

      if (error) throw error;
      if ((count ?? 0) >= FOUNDERS_CAP) {
        return NextResponse.json({ error: "Founders cap has been reached." }, { status: 409 });
      }
    } catch {
      return NextResponse.json({ error: "Unable to verify founders inventory right now." }, { status: 503 });
    }
  }

  const session = await stripe.checkout.sessions.create({
    mode,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${env.NEXT_PUBLIC_APP_URL}/account?checkout=success`,
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/pricing?checkout=cancelled`,
    metadata: {
      user_id: body.userId,
      price_id: priceId,
      purchase_type: purchaseType,
      tier: body.tier ?? "custom",
      billing: body.billing ?? "n/a",
    },
  });

  return NextResponse.json({ url: session.url });
}
