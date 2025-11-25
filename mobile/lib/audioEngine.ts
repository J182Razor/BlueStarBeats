/**
 * React Native Audio Engine Wrapper
 * Provides a bridge between React Native and Web Audio API
 */

import { Platform } from 'react-native';

export type WaveformType = 'sine' | 'square' | 'sawtooth' | 'triangle';
export type AudioMode = 'binaural' | 'isochronic';

export interface AudioSettings {
    carrierFrequency: number;
    beatFrequency: number;
    waveform: WaveformType;
    mode: AudioMode;
    volume: number;
}

export class ReactNativeAudioEngine {
    private audioEngine: any = null;
    private settings: AudioSettings = {
        carrierFrequency: 440,
        beatFrequency: 7.83,
        waveform: 'sine',
        mode: 'binaural',
        volume: 0.7
    };

    constructor() {
        if (Platform.OS === 'web') {
            // Use Web Audio API on web platform
            const { audioEngine } = require('./audioEngineWeb');
            this.audioEngine = audioEngine;
            this.audioEngine.initAudioContext();
        } else {
            // For native platforms, we'll use a simpler approach
            console.warn('Native audio synthesis not yet implemented');
        }
    }

    async start(): Promise<void> {
        if (this.audioEngine) {
            this.audioEngine.start();
        }
    }

    async stop(): Promise<void> {
        if (this.audioEngine) {
            this.audioEngine.stop();
        }
    }

    async setVolume(volume: number): Promise<void> {
        this.settings.volume = volume;
        if (this.audioEngine) {
            this.audioEngine.setVolume(volume);
        }
    }

    async updateSettings(newSettings: Partial<AudioSettings>): Promise<void> {
        this.settings = { ...this.settings, ...newSettings };

        if (!this.audioEngine) return;

        // Update individual settings
        if (newSettings.waveform !== undefined) {
            this.audioEngine.setWaveform(newSettings.waveform);
        }
        if (newSettings.mode !== undefined) {
            this.audioEngine.setMode(newSettings.mode);
        }
        if (newSettings.volume !== undefined) {
            this.audioEngine.setVolume(newSettings.volume);
        }
        if (newSettings.carrierFrequency !== undefined || newSettings.beatFrequency !== undefined) {
            this.audioEngine.updateFrequencies(
                this.settings.carrierFrequency,
                this.settings.beatFrequency
            );
        }
    }

    cleanup(): void {
        if (this.audioEngine) {
            this.audioEngine.stop();
        }
    }

    getSettings(): AudioSettings {
        return { ...this.settings };
    }
}

// Singleton instance
let engineInstance: ReactNativeAudioEngine | null = null;

export function getAudioEngine(): ReactNativeAudioEngine {
    if (!engineInstance) {
        engineInstance = new ReactNativeAudioEngine();
    }
    return engineInstance;
}
