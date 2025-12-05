/**
 * Progress Context for tracking user session history
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SessionRecord {
    sessionId: string;
    sessionName: string;
    category: string;
    duration: number; // in seconds
    completedAt: string;
}

interface ProgressContextType {
    sessionHistory: SessionRecord[];
    totalMinutes: number;
    streak: number;
    addSession: (record: Omit<SessionRecord, 'completedAt'>) => Promise<void>;
    clearHistory: () => Promise<void>;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

const HISTORY_KEY = '@BlueStarBeats:sessionHistory';

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [sessionHistory, setSessionHistory] = useState<SessionRecord[]>([]);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const value = await AsyncStorage.getItem(HISTORY_KEY);
            if (value !== null) {
                setSessionHistory(JSON.parse(value));
            }
        } catch (error) {
            console.error('Failed to load session history:', error);
        }
    };

    const addSession = async (record: Omit<SessionRecord, 'completedAt'>) => {
        try {
            const newRecord: SessionRecord = {
                ...record,
                completedAt: new Date().toISOString(),
            };
            const updated = [...sessionHistory, newRecord];
            await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
            setSessionHistory(updated);
        } catch (error) {
            console.error('Failed to save session record:', error);
        }
    };

    const clearHistory = async () => {
        try {
            await AsyncStorage.removeItem(HISTORY_KEY);
            setSessionHistory([]);
        } catch (error) {
            console.error('Failed to clear history:', error);
        }
    };

    const totalMinutes = Math.floor(
        sessionHistory.reduce((acc, record) => acc + record.duration, 0) / 60
    );

    // Calculate streak (days in a row with at least one session)
    const calculateStreak = (): number => {
        if (sessionHistory.length === 0) return 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sessionDates = sessionHistory
            .map((r) => {
                const d = new Date(r.completedAt);
                d.setHours(0, 0, 0, 0);
                return d.getTime();
            })
            .sort((a, b) => b - a); // Sort descending

        const uniqueDates = [...new Set(sessionDates)];
        let streak = 0;
        let currentDate = today.getTime();

        for (const date of uniqueDates) {
            if (date === currentDate || date === currentDate - 86400000) {
                streak++;
                currentDate = date;
            } else {
                break;
            }
        }

        return streak;
    };

    return (
        <ProgressContext.Provider
            value={{
                sessionHistory,
                totalMinutes,
                streak: calculateStreak(),
                addSession,
                clearHistory,
            }}
        >
            {children}
        </ProgressContext.Provider>
    );
};

export const useProgress = (): ProgressContextType => {
    const context = useContext(ProgressContext);
    if (!context) {
        throw new Error('useProgress must be used within ProgressProvider');
    }
    return context;
};
