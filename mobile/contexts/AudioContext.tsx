/**
 * Audio Context for managing audio state across the app
 */

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ReactNativeAudioEngine, AudioSettings } from '../lib/audioEngine';
import { Session } from '../lib/sessions';

interface AudioContextType {
  isPlaying: boolean;
  currentSession: Session | null;
  audioEngine: ReactNativeAudioEngine | null;
  startSession: (session: Session) => Promise<void>;
  stopSession: () => Promise<void>;
  togglePlayback: () => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  volume: number;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [volume, setVolumeState] = useState(0.7);
  const audioEngineRef = useRef<ReactNativeAudioEngine | null>(null);

  useEffect(() => {
    // Initialize audio engine
    const { getAudioEngine } = require('../lib/audioEngine');
    audioEngineRef.current = getAudioEngine();

    return () => {
      // Cleanup on unmount
      audioEngineRef.current?.cleanup();
    };
  }, []);

  const startSession = async (session: Session) => {
    if (!audioEngineRef.current) return;

    try {
      // Stop current session if playing
      if (isPlaying) {
        await stopSession();
      }

      // Update audio settings
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
      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  const stopSession = async () => {
    if (!audioEngineRef.current) return;

    try {
      await audioEngineRef.current.stop();
      setIsPlaying(false);
      // Keep currentSession for display purposes
    } catch (error) {
      console.error('Failed to stop session:', error);
    }
  };

  const togglePlayback = async () => {
    if (!audioEngineRef.current) return;

    try {
      if (isPlaying) {
        await audioEngineRef.current.stop();
        setIsPlaying(false);
      } else if (currentSession) {
        await audioEngineRef.current.start();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Failed to toggle playback:', error);
    }
  };

  const setVolume = async (newVolume: number) => {
    if (!audioEngineRef.current) return;

    try {
      await audioEngineRef.current.setVolume(newVolume);
      setVolumeState(newVolume);
    } catch (error) {
      console.error('Failed to set volume:', error);
    }
  };

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        currentSession,
        audioEngine: audioEngineRef.current,
        startSession,
        stopSession,
        togglePlayback,
        setVolume,
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

