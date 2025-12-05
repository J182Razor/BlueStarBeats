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
        // #region agent log
        const platform = Platform.OS;
        fetch('http://127.0.0.1:7242/ingest/47fda163-483e-4af1-98c0-09ff88d0e1b7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'audioEngine.ts:29',message:'ReactNativeAudioEngine constructor',data:{platform},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        if (Platform.OS === 'web') {
            // #region agent log
            const webInitStart = Date.now();
            // #endregion
            // Use Web Audio API on web platform
            try {
                const { audioEngine } = require('./audioEngineWeb');
                this.audioEngine = audioEngine;
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/47fda163-483e-4af1-98c0-09ff88d0e1b7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'audioEngine.ts:35',message:'Web audioEngine module loaded',data:{hasEngine:!!this.audioEngine},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                // #endregion
                this.audioEngine.initAudioContext();
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/47fda163-483e-4af1-98c0-09ff88d0e1b7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'audioEngine.ts:37',message:'Web AudioContext initAudioContext called',data:{initTime:Date.now()-webInitStart},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
                // #endregion
            } catch (error) {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/47fda163-483e-4af1-98c0-09ff88d0e1b7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'audioEngine.ts:40',message:'Web audioEngine initialization error',data:{error:error instanceof Error?error.message:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                // #endregion
            }
        } else {
            // For native platforms, we'll use a simpler approach
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/47fda163-483e-4af1-98c0-09ff88d0e1b7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'audioEngine.ts:45',message:'Native platform detected - audio not implemented',data:{platform},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
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
    // #region agent log
    const getEngineStart = Date.now();
    fetch('http://127.0.0.1:7242/ingest/47fda163-483e-4af1-98c0-09ff88d0e1b7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'audioEngine.ts:119',message:'getAudioEngine called',data:{hasInstance:!!engineInstance},timestamp:getEngineStart,sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    if (!engineInstance) {
        // #region agent log
        const createStart = Date.now();
        // #endregion
        engineInstance = new ReactNativeAudioEngine();
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/47fda163-483e-4af1-98c0-09ff88d0e1b7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'audioEngine.ts:123',message:'ReactNativeAudioEngine instance created',data:{createTime:Date.now()-createStart},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
    }
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/47fda163-483e-4af1-98c0-09ff88d0e1b7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'audioEngine.ts:126',message:'getAudioEngine returning',data:{totalTime:Date.now()-getEngineStart},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    return engineInstance;
}
