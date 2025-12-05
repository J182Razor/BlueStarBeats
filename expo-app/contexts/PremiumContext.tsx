/**
 * Premium Context for managing subscription state
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PremiumContextType {
    isPremium: boolean;
    setPremium: (value: boolean) => void;
    isLoading: boolean;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

const PREMIUM_KEY = '@BlueStarBeats:isPremium';

export const PremiumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isPremium, setIsPremium] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadPremiumStatus();
    }, []);

    const loadPremiumStatus = async () => {
        try {
            const value = await AsyncStorage.getItem(PREMIUM_KEY);
            if (value !== null) {
                setIsPremium(JSON.parse(value));
            }
        } catch (error) {
            console.error('Failed to load premium status:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const setPremium = async (value: boolean) => {
        try {
            await AsyncStorage.setItem(PREMIUM_KEY, JSON.stringify(value));
            setIsPremium(value);
        } catch (error) {
            console.error('Failed to save premium status:', error);
        }
    };

    return (
        <PremiumContext.Provider value={{ isPremium, setPremium, isLoading }}>
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
