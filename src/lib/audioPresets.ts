import { AudioPreset, BrainwaveType, Intensity, SessionCategory } from './types';

export const AUDIO_PRESETS: AudioPreset[] = [
  {
    id: 'deep-focus',
    name: 'Deep Focus',
    carrierFrequency: 100,
    beatFrequency: 15,
    waveform: 'sine',
    mode: 'binaural',
    description: 'Enhances concentration and cognitive clarity',
    targetBrainwave: 'beta',
    intensity: 'moderate',
    category: 'focus'
  },
  {
    id: 'deep-sleep',
    name: 'Deep Sleep',
    carrierFrequency: 200,
    beatFrequency: 2,
    waveform: 'sine',
    mode: 'binaural',
    description: 'Deep Delta waves for restorative sleep',
    targetBrainwave: 'delta',
    intensity: 'gentle',
    category: 'sleep'
  },
  {
    id: 'meditation-alpha',
    name: 'Alpha Meditation',
    carrierFrequency: 200,
    beatFrequency: 10,
    waveform: 'sine',
    mode: 'binaural',
    description: 'Calm Alpha for relaxed awareness',
    targetBrainwave: 'alpha',
    intensity: 'gentle',
    category: 'meditation'
  },
  {
    id: 'meditation-theta',
    name: 'Theta Meditation',
    carrierFrequency: 200,
    beatFrequency: 6,
    waveform: 'sine',
    mode: 'binaural',
    description: 'Deep Theta for profound meditation states',
    targetBrainwave: 'theta',
    intensity: 'moderate',
    category: 'meditation'
  },
  {
    id: 'anxiety-relief',
    name: 'Anxiety Relief',
    carrierFrequency: 200,
    beatFrequency: 9,
    waveform: 'sine',
    mode: 'binaural',
    description: 'Alpha waves to reduce stress and anxiety',
    targetBrainwave: 'alpha',
    intensity: 'gentle',
    category: 'anxiety'
  },
  {
    id: 'creative-flow',
    name: 'Creative Flow',
    carrierFrequency: 200,
    beatFrequency: 7.83,
    waveform: 'sine',
    mode: 'binaural',
    description: 'Schumann Resonance for insight and creativity',
    targetBrainwave: 'theta',
    intensity: 'moderate',
    category: 'creativity'
  },
  {
    id: 'peak-performance',
    name: 'Peak Performance',
    carrierFrequency: 200,
    beatFrequency: 40,
    waveform: 'sine',
    mode: 'binaural',
    description: 'High-frequency Gamma for peak performance states',
    targetBrainwave: 'gamma',
    intensity: 'intense',
    category: 'learning'
  },
  {
    id: 'quick-relax',
    name: 'Quick Relax',
    carrierFrequency: 200,
    beatFrequency: 8,
    waveform: 'sine',
    mode: 'isochronic',
    description: 'Fast-acting relaxation with isochronic tones',
    targetBrainwave: 'alpha',
    intensity: 'gentle',
    category: 'anxiety'
  }
];

export function getPresetsByBrainwave(brainwave: BrainwaveType): AudioPreset[] {
  return AUDIO_PRESETS.filter(preset => preset.targetBrainwave === brainwave);
}

export function getPresetsByCategory(category: SessionCategory): AudioPreset[] {
  return AUDIO_PRESETS.filter(preset => preset.category === category);
}

export function getPresetsByIntensity(intensity: Intensity): AudioPreset[] {
  return AUDIO_PRESETS.filter(preset => preset.intensity === intensity);
}

export function getPresetById(id: string): AudioPreset | undefined {
  return AUDIO_PRESETS.find(preset => preset.id === id);
}

