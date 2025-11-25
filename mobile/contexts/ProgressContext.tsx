/**
 * Progress Context for tracking user sessions and statistics
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '../lib/sessions';

interface SessionHistory {
  sessionId: string;
  sessionTitle: string;
  category: string;
  duration: number; // in minutes
  completedAt: Date;
  notes?: string;
  rating?: number;
}

interface ProgressStats {
  totalSessions: number;
  totalTimeMeditated: number; // in minutes
  currentStreak: number; // days
  favoriteCategory: string;
  lastSessionDate: Date | null;
}

interface ProgressContextType {
  stats: ProgressStats;
  recentActivity: SessionHistory[];
  addSession: (session: Session, duration: number) => Promise<void>;
  updateSessionRating: (sessionId: string, rating: number, notes?: string) => Promise<void>;
  refreshStats: () => Promise<void>;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SESSION_HISTORY: '@bluestarbeats:session_history',
  STATS: '@bluestarbeats:stats',
};

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stats, setStats] = useState<ProgressStats>({
    totalSessions: 0,
    totalTimeMeditated: 0,
    currentStreak: 0,
    favoriteCategory: 'Focus',
    lastSessionDate: null,
  });
  const [recentActivity, setRecentActivity] = useState<SessionHistory[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [historyData, statsData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.SESSION_HISTORY).catch(() => null),
        AsyncStorage.getItem(STORAGE_KEYS.STATS).catch(() => null),
      ]);

      if (historyData) {
        try {
          const history = JSON.parse(historyData);
          if (Array.isArray(history)) {
            setRecentActivity(history.map((h: any) => ({
              ...h,
              completedAt: new Date(h.completedAt),
            })));
          }
        } catch (parseError) {
          console.error('Failed to parse history data:', parseError);
        }
      }

      if (statsData) {
        try {
          const savedStats = JSON.parse(statsData);
          setStats({
            ...savedStats,
            lastSessionDate: savedStats.lastSessionDate ? new Date(savedStats.lastSessionDate) : null,
          });
        } catch (parseError) {
          console.error('Failed to parse stats data:', parseError);
        }
      }
    } catch (error) {
      console.error('Failed to load progress data:', error);
    }
  };

  const saveData = async (history: SessionHistory[], updatedStats: ProgressStats) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.SESSION_HISTORY, JSON.stringify(history)).catch((err) => {
          console.error('Failed to save history:', err);
        }),
        AsyncStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(updatedStats)).catch((err) => {
          console.error('Failed to save stats:', err);
        }),
      ]);
    } catch (error) {
      console.error('Failed to save progress data:', error);
    }
  };

  const addSession = async (session: Session, duration: number) => {
    const newHistory: SessionHistory = {
      sessionId: session.id,
      sessionTitle: session.title,
      category: session.category,
      duration,
      completedAt: new Date(),
    };

    const updatedHistory = [newHistory, ...recentActivity].slice(0, 50); // Keep last 50
    setRecentActivity(updatedHistory);

    // Update stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastSessionDate = stats.lastSessionDate ? new Date(stats.lastSessionDate) : null;
    lastSessionDate?.setHours(0, 0, 0, 0);

    let newStreak = stats.currentStreak;
    if (lastSessionDate) {
      const daysDiff = Math.floor((today.getTime() - lastSessionDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff === 1) {
        newStreak += 1;
      } else if (daysDiff > 1) {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    // Calculate favorite category
    const categoryCounts: Record<string, number> = {};
    updatedHistory.forEach(h => {
      categoryCounts[h.category] = (categoryCounts[h.category] || 0) + 1;
    });
    const favoriteCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || stats.favoriteCategory;

    const updatedStats: ProgressStats = {
      totalSessions: stats.totalSessions + 1,
      totalTimeMeditated: stats.totalTimeMeditated + duration,
      currentStreak: newStreak,
      favoriteCategory,
      lastSessionDate: today,
    };

    setStats(updatedStats);
    await saveData(updatedHistory, updatedStats);
  };

  const updateSessionRating = async (sessionId: string, rating: number, notes?: string) => {
    const updatedHistory = recentActivity.map(h =>
      h.sessionId === sessionId
        ? { ...h, rating, notes }
        : h
    );
    setRecentActivity(updatedHistory);
    await saveData(updatedHistory, stats);
  };

  const refreshStats = async () => {
    await loadData();
  };

  return (
    <ProgressContext.Provider
      value={{
        stats,
        recentActivity,
        addSession,
        updateSessionRating,
        refreshStats,
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

