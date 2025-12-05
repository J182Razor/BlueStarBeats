/**
 * Session definitions for BlueStarBeats
 * Pre-configured binaural beat sessions for different mental states
 */

import { WaveformType, AudioMode } from './audioEngine';

export interface Session {
    id: string;
    name: string;
    description: string;
    duration: number; // in minutes
    category: 'focus' | 'relax' | 'sleep' | 'meditate';
    carrierFrequency: number;
    beatFrequency: number;
    waveform: WaveformType;
    mode: AudioMode;
    imageUrl?: string;
}

export const sessions: Session[] = [
    // Focus Sessions (Beta/Gamma waves: 12-40 Hz)
    {
        id: 'focus-deep',
        name: 'Deep Focus',
        description: '40Hz Gamma waves for enhanced concentration and cognitive function',
        duration: 30,
        category: 'focus',
        carrierFrequency: 400,
        beatFrequency: 40,
        waveform: 'sine',
        mode: 'binaural',
    },
    {
        id: 'focus-study',
        name: 'Study Session',
        description: '18Hz Beta waves for sustained attention and learning',
        duration: 45,
        category: 'focus',
        carrierFrequency: 300,
        beatFrequency: 18,
        waveform: 'sine',
        mode: 'binaural',
    },

    // Relax Sessions (Alpha waves: 8-12 Hz)
    {
        id: 'relax-calm',
        name: 'Calm Alpha Flow',
        description: '10Hz Alpha waves for relaxation and stress relief',
        duration: 20,
        category: 'relax',
        carrierFrequency: 200,
        beatFrequency: 10,
        waveform: 'sine',
        mode: 'binaural',
    },
    {
        id: 'relax-unwind',
        name: 'Evening Unwind',
        description: '8Hz Alpha waves for gentle relaxation',
        duration: 15,
        category: 'relax',
        carrierFrequency: 180,
        beatFrequency: 8,
        waveform: 'sine',
        mode: 'binaural',
    },

    // Sleep Sessions (Delta waves: 0.5-4 Hz)
    {
        id: 'sleep-deep',
        name: 'Deep Delta Sleep',
        description: '2Hz Delta waves for deep, restorative sleep',
        duration: 60,
        category: 'sleep',
        carrierFrequency: 100,
        beatFrequency: 2,
        waveform: 'sine',
        mode: 'binaural',
    },
    {
        id: 'sleep-drift',
        name: 'Drift Off',
        description: '3Hz Delta waves for falling asleep gently',
        duration: 30,
        category: 'sleep',
        carrierFrequency: 120,
        beatFrequency: 3,
        waveform: 'sine',
        mode: 'binaural',
    },

    // Meditation Sessions (Theta waves: 4-8 Hz)
    {
        id: 'meditate-theta',
        name: 'Theta Meditation',
        description: '6Hz Theta waves for deep meditation and creativity',
        duration: 20,
        category: 'meditate',
        carrierFrequency: 150,
        beatFrequency: 6,
        waveform: 'sine',
        mode: 'binaural',
    },
    {
        id: 'meditate-schumann',
        name: 'Schumann Resonance',
        description: "7.83Hz Earth's natural frequency for grounding",
        duration: 25,
        category: 'meditate',
        carrierFrequency: 440,
        beatFrequency: 7.83,
        waveform: 'sine',
        mode: 'binaural',
    },
];

export function getSessionsByCategory(category: Session['category']): Session[] {
    return sessions.filter((session) => session.category === category);
}

export function getSessionById(id: string): Session | undefined {
    return sessions.find((session) => session.id === id);
}
