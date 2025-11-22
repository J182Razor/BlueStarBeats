import { UserPreferences, SessionHistoryEntry, SessionLength, WaveformType, AudioMode } from './types';

const PREFERENCES_STORAGE_KEY = 'bluestarbeats_user_preferences';
const HISTORY_STORAGE_KEY = 'bluestarbeats_session_history';
const MAX_HISTORY_ENTRIES = 100;
const MAX_RECENT_SESSIONS = 20;

export class UserPreferencesManager {
  private static instance: UserPreferencesManager;

  private constructor() {}

  static getInstance(): UserPreferencesManager {
    if (!UserPreferencesManager.instance) {
      UserPreferencesManager.instance = new UserPreferencesManager();
    }
    return UserPreferencesManager.instance;
  }

  getDefaultPreferences(): UserPreferences {
    return {
      favoriteSessions: [],
      recentlyPlayed: [],
      preferredSessionLength: 30,
      notificationSettings: {
        sessionReminders: false,
        completionAlerts: true
      },
      audioSettings: {
        defaultVolume: 0.3,
        defaultWaveform: 'sine',
        defaultMode: 'binaural'
      }
    };
  }

  loadPreferences(): UserPreferences {
    try {
      const saved = localStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with defaults to handle missing fields
        return { ...this.getDefaultPreferences(), ...parsed };
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    }
    return this.getDefaultPreferences();
  }

  savePreferences(preferences: UserPreferences): void {
    try {
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save user preferences:', error);
    }
  }

  addFavorite(sessionId: string): void {
    const prefs = this.loadPreferences();
    if (!prefs.favoriteSessions.includes(sessionId)) {
      prefs.favoriteSessions.push(sessionId);
      this.savePreferences(prefs);
    }
  }

  removeFavorite(sessionId: string): void {
    const prefs = this.loadPreferences();
    prefs.favoriteSessions = prefs.favoriteSessions.filter(id => id !== sessionId);
    this.savePreferences(prefs);
  }

  isFavorite(sessionId: string): boolean {
    const prefs = this.loadPreferences();
    return prefs.favoriteSessions.includes(sessionId);
  }

  addToRecentlyPlayed(sessionId: string): void {
    const prefs = this.loadPreferences();
    // Remove if already exists
    prefs.recentlyPlayed = prefs.recentlyPlayed.filter(id => id !== sessionId);
    // Add to beginning
    prefs.recentlyPlayed.unshift(sessionId);
    // Keep only the most recent
    prefs.recentlyPlayed = prefs.recentlyPlayed.slice(0, MAX_RECENT_SESSIONS);
    this.savePreferences(prefs);
  }

  getRecentlyPlayed(): string[] {
    const prefs = this.loadPreferences();
    return prefs.recentlyPlayed;
  }

  addSessionHistory(entry: SessionHistoryEntry): void {
    try {
      const history = this.getSessionHistory();
      history.unshift(entry);
      // Keep only the most recent entries
      const trimmed = history.slice(0, MAX_HISTORY_ENTRIES);
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(trimmed));
    } catch (error) {
      console.error('Failed to save session history:', error);
    }
  }

  getSessionHistory(): SessionHistoryEntry[] {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convert date strings back to Date objects
        return parsed.map((entry: any) => ({
          ...entry,
          date: new Date(entry.date)
        }));
      }
    } catch (error) {
      console.error('Failed to load session history:', error);
    }
    return [];
  }

  getSessionStats(sessionId: string): { count: number; averageRating?: number } {
    const history = this.getSessionHistory();
    const sessions = history.filter(entry => entry.sessionId === sessionId);
    const completed = sessions.filter(s => s.completed);
    const ratings = completed
      .map(s => s.effectivenessRating)
      .filter((r): r is number => r !== undefined);
    
    return {
      count: completed.length,
      averageRating: ratings.length > 0 
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length 
        : undefined
    };
  }

  updatePreferredSessionLength(length: SessionLength): void {
    const prefs = this.loadPreferences();
    prefs.preferredSessionLength = length;
    this.savePreferences(prefs);
  }

  updateDefaultAudioSettings(settings: Partial<UserPreferences['audioSettings']>): void {
    const prefs = this.loadPreferences();
    prefs.audioSettings = { ...prefs.audioSettings, ...settings };
    this.savePreferences(prefs);
  }

  updateNotificationSettings(settings: Partial<UserPreferences['notificationSettings']>): void {
    const prefs = this.loadPreferences();
    prefs.notificationSettings = { ...prefs.notificationSettings, ...settings };
    this.savePreferences(prefs);
  }
}

export const userPreferences = UserPreferencesManager.getInstance();

