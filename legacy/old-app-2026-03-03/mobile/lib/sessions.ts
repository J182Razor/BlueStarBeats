/**
 * Session data and presets
 */

export type BrainwaveType = 'delta' | 'theta' | 'alpha' | 'beta' | 'gamma';
export type SessionCategory = 'sleep' | 'focus' | 'meditate' | 'relax' | 'anxiety' | 'creativity' | 'productivity';

export interface Session {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: SessionCategory;
  brainwaveType: BrainwaveType;
  duration: number; // in minutes
  carrierFrequency: number;
  beatFrequency: number;
  waveform: 'sine' | 'square' | 'triangle' | 'sawtooth';
  mode: 'binaural' | 'isochronic';
  premium: boolean;
  imageUrl?: string;
}

export const SESSIONS: Session[] = [
  {
    id: 'focus',
    title: 'Focus',
    subtitle: 'Productivity',
    description: 'Enhance concentration and cognitive clarity',
    category: 'focus',
    brainwaveType: 'beta',
    duration: 30,
    carrierFrequency: 200,
    beatFrequency: 15,
    waveform: 'sine',
    mode: 'binaural',
    premium: false,
  },
  {
    id: 'theta-sleep-induction',
    title: 'Theta Sleep Induction',
    subtitle: 'Anxiety Relief',
    description: 'Deep Theta waves for profound relaxation and sleep',
    category: 'sleep',
    brainwaveType: 'theta',
    duration: 30,
    carrierFrequency: 200,
    beatFrequency: 6,
    waveform: 'sine',
    mode: 'binaural',
    premium: false,
  },
  {
    id: 'delta-wave-slumber',
    title: 'Delta Wave Slumber',
    subtitle: 'Sleep',
    description: 'Deep Delta waves for restorative sleep',
    category: 'sleep',
    brainwaveType: 'delta',
    duration: 45,
    carrierFrequency: 200,
    beatFrequency: 2,
    waveform: 'sine',
    mode: 'binaural',
    premium: true,
  },
  {
    id: 'alpha-awakening',
    title: 'Alpha Awakening',
    subtitle: 'Meditation',
    description: 'Calm Alpha for relaxed awareness',
    category: 'meditate',
    brainwaveType: 'alpha',
    duration: 30,
    carrierFrequency: 200,
    beatFrequency: 10,
    waveform: 'sine',
    mode: 'binaural',
    premium: false,
  },
  {
    id: 'gamma-focus',
    title: '40Hz Gamma Focus',
    subtitle: '40Hz Gamma Binaural',
    description: 'Peak performance and heightened focus',
    category: 'focus',
    brainwaveType: 'gamma',
    duration: 25,
    carrierFrequency: 200,
    beatFrequency: 40,
    waveform: 'sine',
    mode: 'binaural',
    premium: false,
  },
  {
    id: 'deep-delta-sleep',
    title: 'Deep Delta Waves',
    subtitle: 'Deep Delta Waves',
    description: 'Deep Delta waves for restorative sleep',
    category: 'sleep',
    brainwaveType: 'delta',
    duration: 60,
    carrierFrequency: 200,
    beatFrequency: 1.5,
    waveform: 'sine',
    mode: 'binaural',
    premium: false,
  },
  {
    id: 'theta-meditation',
    title: 'Theta Meditation',
    subtitle: 'Theta Meditation',
    description: 'Deep Theta for profound meditation states',
    category: 'meditate',
    brainwaveType: 'theta',
    duration: 45,
    carrierFrequency: 200,
    beatFrequency: 6,
    waveform: 'sine',
    mode: 'binaural',
    premium: false,
  },
  {
    id: 'calm-alpha-flow',
    title: 'Calm Alpha Flow',
    subtitle: 'Calm Alpha Flow',
    description: 'Relaxing Alpha waves for calm',
    category: 'relax',
    brainwaveType: 'alpha',
    duration: 30,
    carrierFrequency: 200,
    beatFrequency: 10,
    waveform: 'sine',
    mode: 'binaural',
    premium: false,
  },
];

export const getSessionsByCategory = (category: SessionCategory | 'all'): Session[] => {
  if (category === 'all') return SESSIONS;
  return SESSIONS.filter(s => s.category === category);
};

export const getSessionById = (id: string): Session | undefined => {
  return SESSIONS.find(s => s.id === id);
};

