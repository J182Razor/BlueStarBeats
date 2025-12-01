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
  audioSettings: AudioSettings | null;
  startSession: (session: Session) => Promise<void>;
  stopSession: () => Promise<void>;
  togglePlayback: () => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  updateAudioSettings: (settings: Partial<AudioSettings>) => Promise<void>;
  volume: number;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [volume, setVolumeState] = useState(0.7);
  const [audioSettings, setAudioSettings] = useState<AudioSettings | null>(null);
  const audioEngineRef = useRef<ReactNativeAudioEngine | null>(null);

  useEffect(() => {
    // #region agent log
    const initStartTime = Date.now();
    fetch('http://127.0.0.1:7242/ingest/47fda163-483e-4af1-98c0-09ff88d0e1b7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AudioContext.tsx:31',message:'AudioContext useEffect started',data:{timestamp:initStartTime},timestamp:initStartTime,sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    // Initialize audio engine
    try {
      // #region agent log
      const requireStartTime = Date.now();
      // #endregion
      const { getAudioEngine } = require('../lib/audioEngine');
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/47fda163-483e-4af1-98c0-09ff88d0e1b7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AudioContext.tsx:35',message:'AudioEngine module required',data:{requireTime:Date.now()-requireStartTime},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      audioEngineRef.current = getAudioEngine();
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/47fda163-483e-4af1-98c0-09ff88d0e1b7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AudioContext.tsx:37',message:'AudioEngine instance created',data:{hasEngine:!!audioEngineRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/47fda163-483e-4af1-98c0-09ff88d0e1b7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AudioContext.tsx:40',message:'AudioEngine initialization error',data:{error:error instanceof Error?error.message:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
    }

    // Set initial audio settings
    setAudioSettings({
      carrierFrequency: 440,
      beatFrequency: 7.83,
      waveform: 'sine',
      mode: 'binaural',
      volume: 0.7
    });
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/47fda163-483e-4af1-98c0-09ff88d0e1b7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AudioContext.tsx:50',message:'AudioContext initialization complete',data:{initTime:Date.now()-initStartTime},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

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
      setAudioSettings(prev => ({ ...prev!, ...settings }));
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
      setAudioSettings(prev => prev ? { ...prev, volume: newVolume } : null);
    } catch (error) {
      console.error('Failed to set volume:', error);
    }
  };

  const updateAudioSettings = async (settings: Partial<AudioSettings>) => {
    if (!audioEngineRef.current) return;

    try {
      await audioEngineRef.current.updateSettings(settings);
      setAudioSettings(prev => prev ? { ...prev, ...settings } : null);
    } catch (error) {
      console.error('Failed to update audio settings:', error);
    }
  };

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

