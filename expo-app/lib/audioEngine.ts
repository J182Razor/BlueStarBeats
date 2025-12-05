/**
 * React Native Audio Engine
 * Platform-agnostic wrapper for binaural beats and isochronic tones
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
    private isInitialized = false;
    private settings: AudioSettings = {
        carrierFrequency: 440,
        beatFrequency: 7.83,
        waveform: 'sine',
        mode: 'binaural',
        volume: 0.7,
    };

    constructor() {
        this.initEngine();
    }

    private initEngine(): void {
        if (this.isInitialized) return;

        try {
            if (Platform.OS === 'web') {
                const { audioEngine } = require('./audioEngineWeb');
                this.audioEngine = audioEngine;
                this.audioEngine.initAudioContext();
            } else {
                // Use native engine for iOS/Android
                const { nativeAudioEngine } = require('./audioEngineNative');
                this.audioEngine = nativeAudioEngine;
                this.audioEngine.init();
            }
            this.isInitialized = true;
        } catch (error) {
            console.warn('Audio engine init failed:', error);
        }
    }

    async start(): Promise<void> {
        if (!this.audioEngine) {
            this.initEngine();
        }
        if (this.audioEngine) {
            await this.audioEngine.start();
        }
    }

    async stop(): Promise<void> {
        if (this.audioEngine) {
            await this.audioEngine.stop();
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

// Singleton
let engineInstance: ReactNativeAudioEngine | null = null;

export function getAudioEngine(): ReactNativeAudioEngine {
    if (!engineInstance) {
        engineInstance = new ReactNativeAudioEngine();
    }
    return engineInstance;
}
