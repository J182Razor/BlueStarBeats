/**
 * Premium Context for managing subscription state
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SubscriptionTier = 'free' | 'monthly' | 'annual' | 'lifetime';

interface PremiumContextType {
  isPremium: boolean;
  subscriptionTier: SubscriptionTier;
  setSubscriptionTier: (tier: SubscriptionTier) => Promise<void>;
  checkPremiumAccess: (feature: string) => boolean;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

const STORAGE_KEY = '@bluestarbeats:subscription_tier';

export const PremiumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subscriptionTier, setSubscriptionTierState] = useState<SubscriptionTier>('free');

  useEffect(() => {
    loadSubscriptionTier();
  }, []);

  const loadSubscriptionTier = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY).catch(() => null);
      if (saved && ['free', 'monthly', 'annual', 'lifetime'].includes(saved)) {
        setSubscriptionTierState(saved as SubscriptionTier);
      }
    } catch (error) {
      console.error('Failed to load subscription tier:', error);
    }
  };

  const setSubscriptionTier = async (tier: SubscriptionTier) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, tier);
      setSubscriptionTierState(tier);
    } catch (error) {
      console.error('Failed to save subscription tier:', error);
    }
  };

  const isPremium = subscriptionTier !== 'free';

  const checkPremiumAccess = (feature: string): boolean => {
    // Define which features require premium
    const premiumFeatures = [
      'delta-wave-slumber',
      'premium-sessions',
      'offline-mode',
      'advanced-tracking',
    ];

    if (premiumFeatures.includes(feature)) {
      return isPremium;
    }

    return true; // Free features
  };

  return (
    <PremiumContext.Provider
      value={{
        isPremium,
        subscriptionTier,
        setSubscriptionTier,
        checkPremiumAccess,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
};

export const usePremium = (): PremiumContextType => {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium must be used within PremiumProvider');
  }
  return context;
};

