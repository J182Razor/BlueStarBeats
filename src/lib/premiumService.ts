export type SubscriptionTier = 'free' | 'monthly' | 'annual' | 'lifetime';

export interface PremiumService {
  isPremium: boolean;
  tier: SubscriptionTier;
  hasAccess: (feature: string) => boolean;
}

class PremiumServiceManager {
  private tier: SubscriptionTier = 'free';
  private readonly STORAGE_KEY = 'bluestarbeats_premium_tier';

  constructor() {
    // Load from localStorage
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored && ['free', 'monthly', 'annual', 'lifetime'].includes(stored)) {
      this.tier = stored as SubscriptionTier;
    }
  }

  getTier(): SubscriptionTier {
    return this.tier;
  }

  isPremium(): boolean {
    return this.tier !== 'free';
  }

  setTier(tier: SubscriptionTier): void {
    this.tier = tier;
    localStorage.setItem(this.STORAGE_KEY, tier);
  }

  hasAccess(feature: string): boolean {
    if (this.tier === 'lifetime' || this.tier === 'annual' || this.tier === 'monthly') {
      return true;
    }

    // Free tier access
    const freeFeatures = [
      'basic-sessions',
      'focus-flow',
      'sleep-onset',
      'panic-reset',
      'unwind-relax',
      'stress-reset',
      'alpha-meditation'
    ];

    return freeFeatures.includes(feature);
  }

  getPricingInfo() {
    return {
      monthly: { price: 14.99, period: 'month' },
      annual: { price: 69.99, period: 'year', savings: '58%' },
      lifetime: { price: 399.99, period: 'one-time' }
    };
  }
}

export const premiumService = new PremiumServiceManager();

