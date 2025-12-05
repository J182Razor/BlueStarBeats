/**
 * Audio Context for managing audio state across the app
 */

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { ReactNativeAudioEngine, AudioSettings } from '../lib/audioEngine';
import { Session } from '../lib/sessions';

interface AudioContextType {
    isPlaying: boolean;
    currentSession: Session | null;
    audioEngine: ReactNativeAudioEngine | null;
    audioSettings: AudioSettings | null;
    startSession: (session: Session) => Promise<void>;
    stopSession: () => Promise<void>;
    togglePlayback: () => Promise<void>;
    setVolume: (volume: number) => Promise<void>;
    updateAudioSettings: (settings: Partial<AudioSettings>) => Promise<void>;
    volume: number;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

const DEFAULT_SETTINGS: AudioSettings = {
    carrierFrequency: 440,
    beatFrequency: 7.83,
    waveform: 'sine',
    mode: 'binaural',
    volume: 0.7,
};

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSession, setCurrentSession] = useState<Session | null>(null);
    const [volume, setVolumeState] = useState(0.7);
    const [audioSettings, setAudioSettings] = useState<AudioSettings>(DEFAULT_SETTINGS);
    const audioEngineRef = useRef<ReactNativeAudioEngine | null>(null);

    useEffect(() => {
        try {
            const { getAudioEngine } = require('../lib/audioEngine');
            audioEngineRef.current = getAudioEngine();
        } catch (error) {
            console.warn('Audio engine initialization error:', error);
        }

        return () => {
            audioEngineRef.current?.cleanup();
        };
    }, []);

    const startSession = useCallback(async (session: Session) => {
        if (!audioEngineRef.current) return;

        try {
            if (isPlaying) {
                await audioEngineRef.current.stop();
            }

            const settings: Partial<AudioSettings> = {
                carrierFrequency: session.carrierFrequency,
                beatFrequency: session.beatFrequency,
                waveform: session.waveform,
                mode: session.mode,
                volume: volume,
            };

            await audioEngineRef.current.updateSettings(settings);
            await audioEngineRef.current.start();

            setCurrentSession(session);
            setAudioSettings((prev) => ({ ...prev, ...settings }));
            setIsPlaying(true);
        } catch (error) {
            console.error('Failed to start session:', error);
        }
    }, [isPlaying, volume]);

    const stopSession = useCallback(async () => {
        if (!audioEngineRef.current) return;

        try {
            await audioEngineRef.current.stop();
            setIsPlaying(false);
        } catch (error) {
            console.error('Failed to stop session:', error);
        }
    }, []);

    const togglePlayback = useCallback(async () => {
        if (!audioEngineRef.current) return;

        try {
            if (isPlaying) {
                await audioEngineRef.current.stop();
                setIsPlaying(false);
            } else {
                // Apply current settings before starting
                await audioEngineRef.current.updateSettings(audioSettings);
                await audioEngineRef.current.start();
                setIsPlaying(true);
            }
        } catch (error) {
            console.error('Failed to toggle playback:', error);
        }
    }, [isPlaying, audioSettings]);

    const setVolume = useCallback(async (newVolume: number) => {
        if (!audioEngineRef.current) return;

        try {
            await audioEngineRef.current.setVolume(newVolume);
            setVolumeState(newVolume);
            setAudioSettings((prev) => ({ ...prev, volume: newVolume }));
        } catch (error) {
            console.error('Failed to set volume:', error);
        }
    }, []);

    const updateAudioSettings = useCallback(async (settings: Partial<AudioSettings>) => {
        // Update local state first for responsiveness
        setAudioSettings((prev) => ({ ...prev, ...settings }));

        if (!audioEngineRef.current) return;

        try {
            await audioEngineRef.current.updateSettings(settings);
        } catch (error) {
            console.error('Failed to update audio settings:', error);
        }
    }, []);

    return (
        <AudioContext.Provider
            value={{
                isPlaying,
                currentSession,
                audioEngine: audioEngineRef.current,
                audioSettings,
                startSession,
                stopSession,
                togglePlayback,
                setVolume,
                updateAudioSettings,
                volume,
            }}
        >
            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = (): AudioContextType => {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error('useAudio must be used within AudioProvider');
    }
    return context;
};
