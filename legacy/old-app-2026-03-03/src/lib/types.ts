// Enhanced type definitions for Blue Star Beats

export type BrainwaveType = 'delta' | 'theta' | 'alpha' | 'beta' | 'gamma';
export type SessionCategory = 'sleep' | 'focus' | 'meditation' | 'anxiety' | 'creativity' | 'learning';
export type WaveformType = 'sine' | 'square' | 'triangle' | 'sawtooth';
export type AudioMode = 'binaural' | 'isochronic';
export type GoalType = 'sleep' | 'anxiety' | 'focus' | 'meditation';
export type SessionLength = 5 | 10 | 15 | 20 | 30 | 45 | 60 | 90 | 120;
export type Intensity = 'gentle' | 'moderate' | 'intense';

export interface FrequencyRamp {
  start: number;
  end: number;
  duration: number; // in seconds
}

export interface AudioSettings {
  carrierFrequency: number;
  beatFrequency: number;
  waveform: WaveformType;
  mode: AudioMode;
  volume: number;
}

export interface AudioPreset {
  id: string;
  name: string;
  carrierFrequency: number;
  beatFrequency: number;
  waveform: WaveformType;
  mode: AudioMode;
  description: string;
  targetBrainwave: BrainwaveType;
  intensity: Intensity;
  category: SessionCategory;
}

export interface SessionProtocol {
  id: string;
  name: string;
  description: string;
  goal: GoalType;
  category?: SessionCategory;
  brainwaveTarget?: BrainwaveType;
  lengths: SessionLength[];
  carrierFrequency: number;
  beatFrequency: number;
  waveform: WaveformType;
  mode: AudioMode;
  isPremium: boolean;
  frequencyRamp?: FrequencyRamp;
  intensity?: Intensity;
  createdAt?: Date;
  updatedAt?: Date;
  version?: number;
}

export interface SessionHistoryEntry {
  sessionId: string;
  date: Date;
  duration: number;
  completed: boolean;
  effectivenessRating?: number;
  notes?: string;
}

export interface UserPreferences {
  favoriteSessions: string[];
  recentlyPlayed: string[];
  preferredSessionLength: SessionLength;
  notificationSettings: {
    sessionReminders: boolean;
    completionAlerts: boolean;
  };
  audioSettings: {
    defaultVolume: number;
    defaultWaveform: WaveformType;
    defaultMode: AudioMode;
  };
}

export interface EnhancedSessionProtocol extends SessionProtocol {
  category: SessionCategory;
  tags: string[];
  estimatedEffectiveness: number; // 1-10 scale
  userRating?: number;
  completionCount?: number;
}

