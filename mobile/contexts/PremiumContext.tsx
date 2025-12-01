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
    // #region agent log
    const premiumStart = Date.now();
    fetch('http://127.0.0.1:7242/ingest/47fda163-483e-4af1-98c0-09ff88d0e1b7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PremiumContext.tsx:24',message:'PremiumContext useEffect started',data:{timestamp:premiumStart},timestamp:premiumStart,sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    loadSubscriptionTier();
  }, []);

  const loadSubscriptionTier = async () => {
    // #region agent log
    const asyncStart = Date.now();
    // #endregion
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY).catch(() => null);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/47fda163-483e-4af1-98c0-09ff88d0e1b7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PremiumContext.tsx:30',message:'PremiumContext AsyncStorage read completed',data:{asyncTime:Date.now()-asyncStart,hasData:!!saved},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      if (saved && ['free', 'monthly', 'annual', 'lifetime'].includes(saved)) {
        setSubscriptionTierState(saved as SubscriptionTier);
      }
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/47fda163-483e-4af1-98c0-09ff88d0e1b7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PremiumContext.tsx:35',message:'PremiumContext loadSubscriptionTier complete',data:{totalTime:Date.now()-asyncStart},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/47fda163-483e-4af1-98c0-09ff88d0e1b7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PremiumContext.tsx:37',message:'PremiumContext loadSubscriptionTier error',data:{error:error instanceof Error?error.message:String(error),totalTime:Date.now()-asyncStart},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
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

