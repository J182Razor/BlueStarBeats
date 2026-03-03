import Stripe from "stripe";
import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { resolvePlanTierFromCheckout, resolvePlanTierFromPriceId } from "@/lib/stripe/catalog";
import { ENTITLEMENTS_BY_TIER, type PlanTier } from "@/lib/plans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function upsertUserPlan(userId: string, tier: PlanTier) {
  const admin = getSupabaseAdminClient();
  const entitlements = ENTITLEMENTS_BY_TIER[tier];

  const { error: profileError } = await admin.from("user_profiles").upsert(
    {
      user_id: userId,
      plan_tier: tier,
      founders_badge: tier === "founders",
    },
    { onConflict: "user_id" },
  );

  if (profileError) throw profileError;

  const { error: entitlementError } = await admin.from("entitlements").upsert(
    {
      user_id: userId,
      ads_enabled: entitlements.adsEnabled,
      max_presets: entitlements.maxPresets,
      max_programs: entitlements.maxPrograms,
      max_waypoints: entitlements.maxWaypoints,
      can_import: entitlements.canImport,
      can_publish: entitlements.canPublish,
      can_access_packs: entitlements.canAccessPacks,
    },
    { onConflict: "user_id" },
  );

  if (entitlementError) throw entitlementError;
}

async function logPurchaseFromCheckout(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  if (!userId) return;

  const admin = getSupabaseAdminClient();
  const amountTotal = typeof session.amount_total === "number" ? session.amount_total : null;

  await admin.from("purchases").insert({
    user_id: userId,
    stripe_customer_id:
      typeof session.customer === "string" ? session.customer : undefined,
    stripe_checkout_session_id: session.id,
    stripe_payment_intent_id:
      typeof session.payment_intent === "string" ? session.payment_intent : undefined,
    purchase_type: session.metadata?.purchase_type ?? "plan",
    product_code: session.metadata?.price_id ?? session.metadata?.tier ?? "unknown",
    amount_cents: amountTotal,
    currency: session.currency ?? "usd",
    status: "completed",
  });
}

async function resolveUserIdFromCustomer(customer: string | Stripe.Customer | Stripe.DeletedCustomer | null) {
  if (!customer || typeof customer !== "string") return null;
  const admin = getSupabaseAdminClient();
  const { data } = await admin
    .from("purchases")
    .select("user_id")
    .eq("stripe_customer_id", customer)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data?.user_id ?? null;
}

export async function POST(request: Request) {
  const env = getServerEnv();
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid webhook";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      const tier = resolvePlanTierFromCheckout(session);
      await logPurchaseFromCheckout(session);
      if (userId && tier) {
        await upsertUserPlan(userId, tier);
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.user_id || (await resolveUserIdFromCustomer(subscription.customer));
      if (userId) {
        await upsertUserPlan(userId, "free");
      }
    }

    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.user_id || (await resolveUserIdFromCustomer(subscription.customer));
      if (!userId) return NextResponse.json({ ok: true });

      const active = subscription.status === "active" || subscription.status === "trialing";
      const priceId = subscription.items.data[0]?.price.id;

      if (!active) {
        await upsertUserPlan(userId, "free");
      } else {
        const tier = resolvePlanTierFromPriceId(priceId) ?? "pro";
        await upsertUserPlan(userId, tier);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook processing failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
