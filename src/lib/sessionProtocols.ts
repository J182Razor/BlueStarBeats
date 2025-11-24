// Re-export types from types.ts for backward compatibility
export type { GoalType, SessionLength, SessionProtocol, FrequencyRamp } from './types';
import type { GoalType, SessionProtocol } from './types';

export const SESSION_PROTOCOLS: SessionProtocol[] = [
  // SLEEP SESSIONS
  {
    id: 'sleep-onset',
    name: 'Sleep Onset',
    description: 'Gentle Theta to Deep Delta transition for falling asleep faster',
    goal: 'sleep',
    lengths: [20, 30, 45],
    carrierFrequency: 200,
    beatFrequency: 6,
    waveform: 'sine',
    mode: 'binaural',
    isPremium: false,
    frequencyRamp: {
      start: 6, // Theta
      end: 1.5, // Deep Delta
      duration: 600 // 10 minutes
    }
  },
  {
    id: 'deep-sleep',
    name: 'Deep Sleep',
    description: 'Deep Delta waves for restorative sleep',
    goal: 'sleep',
    lengths: [45, 60, 90],
    carrierFrequency: 200,
    beatFrequency: 2,
    waveform: 'sine',
    mode: 'binaural',
    isPremium: true
  },
  {
    id: 'sleepy-head',
    name: 'Sleepy Head',
    description: 'Quick 10-minute sleep aid',
    goal: 'sleep',
    lengths: [10],
    carrierFrequency: 200,
    beatFrequency: 4,
    waveform: 'sine',
    mode: 'binaural',
    isPremium: false
  },

  // ANXIETY SESSIONS
  {
    id: 'panic-reset',
    name: '5-Minute Panic Reset',
    description: 'Fast-acting Alpha waves to immediately ground and calm',
    goal: 'anxiety',
    lengths: [5],
    carrierFrequency: 200,
    beatFrequency: 10,
    waveform: 'sine',
    mode: 'binaural',
    isPremium: false
  },
  {
    id: 'unwind-relax',
    name: 'Unwind & Relax',
    description: 'Alpha to Theta transition for deep relaxation',
    goal: 'anxiety',
    lengths: [15, 30],
    carrierFrequency: 200,
    beatFrequency: 8,
    waveform: 'sine',
    mode: 'binaural',
    isPremium: false,
    frequencyRamp: {
      start: 10, // Alpha
      end: 7, // Theta
      duration: 900 // 15 minutes
    }
  },
  {
    id: 'stress-reset',
    name: '10-Min Stress Reset',
    description: 'Quick stress relief with Alpha waves',
    goal: 'anxiety',
    lengths: [10],
    carrierFrequency: 200,
    beatFrequency: 10,
    waveform: 'sine',
    mode: 'binaural',
    isPremium: false
  },
  {
    id: 'calm-flow',
    name: 'Calm Flow',
    description: 'Extended Alpha session for sustained calm',
    goal: 'anxiety',
    lengths: [45, 60],
    carrierFrequency: 200,
    beatFrequency: 9,
    waveform: 'sine',
    mode: 'binaural',
    isPremium: true
  },

  // FOCUS SESSIONS
  {
    id: 'focus-flow',
    name: 'Focus Flow',
    description: 'Beta waves for active work, coding, or studying',
    goal: 'focus',
    lengths: [45, 60, 90],
    carrierFrequency: 200,
    beatFrequency: 16,
    waveform: 'sine',
    mode: 'binaural',
    isPremium: false
  },
  {
    id: 'creative-boost',
    name: 'Creative Boost',
    description: 'Schumann Resonance (7.83Hz) for insight and creativity',
    goal: 'focus',
    lengths: [20, 30],
    carrierFrequency: 200,
    beatFrequency: 7.83,
    waveform: 'sine',
    mode: 'binaural',
    isPremium: true
  },
  {
    id: 'deep-work',
    name: 'Deep Work',
    description: 'High Beta for intense concentration',
    goal: 'focus',
    lengths: [60, 90],
    carrierFrequency: 200,
    beatFrequency: 18,
    waveform: 'sine',
    mode: 'binaural',
    isPremium: true
  },

  // MEDITATION SESSIONS
  {
    id: 'theta-meditation',
    name: 'Theta Meditation',
    description: 'Deep Theta for profound meditation states',
    goal: 'meditation',
    lengths: [30, 45, 60],
    carrierFrequency: 200,
    beatFrequency: 6,
    waveform: 'sine',
    mode: 'binaural',
    isPremium: true
  },
  {
    id: 'alpha-meditation',
    name: 'Alpha Meditation',
    description: 'Calm Alpha for relaxed awareness',
    goal: 'meditation',
    lengths: [20, 30],
    carrierFrequency: 200,
    beatFrequency: 10,
    waveform: 'sine',
    mode: 'binaural',
    isPremium: false
  },
  {
    id: 'gamma-peak',
    name: 'Gamma Peak',
    description: 'High-frequency Gamma for peak performance states',
    goal: 'meditation',
    lengths: [15, 30],
    carrierFrequency: 200,
    beatFrequency: 40,
    waveform: 'sine',
    mode: 'binaural',
    isPremium: true
  }
];

export function getSessionsByGoal(goal: GoalType, isPremium: boolean = false): SessionProtocol[] {
  return SESSION_PROTOCOLS.filter(session => 
    session.goal === goal && (!session.isPremium || isPremium)
  );
}

export function getSessionById(id: string): SessionProtocol | undefined {
  return SESSION_PROTOCOLS.find(session => session.id === id);
}

export function getFreeSessions(): SessionProtocol[] {
  return SESSION_PROTOCOLS.filter(session => !session.isPremium);
}

