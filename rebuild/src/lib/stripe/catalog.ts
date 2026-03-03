import type Stripe from "stripe";
import { getServerEnv } from "@/lib/env";
import type { PlanTier } from "@/lib/plans";

export function resolvePlanTierFromPriceId(priceId: string | null | undefined): PlanTier | null {
  if (!priceId) return null;
  const env = getServerEnv();

  if (priceId === env.STRIPE_PRICE_PRO_MONTHLY || priceId === env.STRIPE_PRICE_PRO_YEARLY) {
    return "pro";
  }

  if (
    priceId === env.STRIPE_PRICE_ELITE_MONTHLY ||
    priceId === env.STRIPE_PRICE_ELITE_YEARLY
  ) {
    return "elite";
  }

  if (priceId === env.STRIPE_PRICE_FOUNDERS_LIFETIME) {
    return "founders";
  }

  return null;
}

export function resolvePlanTierFromCheckout(session: Stripe.Checkout.Session): PlanTier | null {
  const lineItems = session.metadata ?? {};

  if (lineItems.purchase_type === "founders_lifetime") return "founders";

  return resolvePlanTierFromPriceId(session.metadata?.price_id);
}
