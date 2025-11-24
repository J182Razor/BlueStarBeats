import { useState, useEffect, useCallback, useRef } from 'react';
import { IOSAudioEngine } from '../lib/iosAudioEngine';
import { SessionProtocol, SessionLength } from '../lib/sessionProtocols';
import { AudioSettings } from '../lib/types';
import { userPreferences } from '../lib/userPreferences';

export type TabType = 'home' | 'sessions' | 'history' | 'profile';

export const useAppState = () => {
  const [audioEngine] = useState(() => new IOSAudioEngine());
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSession, setCurrentSession] = useState<SessionProtocol | null>(null);
  const [sessionLength, setSessionLength] = useState<SessionLength | null>(null);
  const [settings, setSettings] = useState<AudioSettings>({
    carrierFrequency: 200,
    beatFrequency: 10,
    volume: 0.7,
    waveform: 'sine',
    mode: 'binaural'
  });
  const sessionStartTimeRef = useRef<number | null>(null);

  // Initialize audio engine
  useEffect(() => {
    const initAudio = async () => {
      try {
        await audioEngine.initialize(settings);
      } catch (error) {
        console.error('Failed to initialize audio engine:', error);
      }
    };

    initAudio();

    return () => {
      audioEngine.destroy();
    };
  }, []);

  const togglePlayback = useCallback(async () => {
    if (isPlaying) {
      audioEngine.pause();
      setIsPlaying(false);
      sessionStartTimeRef.current = null;
    } else if (currentSession) {
      try {
        await audioEngine.start(settings);
        setIsPlaying(true);
        sessionStartTimeRef.current = Date.now();
        userPreferences.addToRecentlyPlayed(currentSession.id);
      } catch (error) {
        console.error('Failed to start audio:', error);
      }
    }
  }, [isPlaying, currentSession, settings, audioEngine]);

  const updateSettings = useCallback((newSettings: Partial<AudioSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    if (isPlaying) {
      audioEngine.updateSettings(newSettings);
    } else {
      audioEngine.updateSettings(newSettings);
    }
  }, [isPlaying, settings, audioEngine]);

  const selectSession = useCallback((session: SessionProtocol, length: SessionLength) => {
    setCurrentSession(session);
    setSessionLength(length);
    
    const newSettings: AudioSettings = {
      mode: session.mode,
      waveform: session.waveform,
      carrierFrequency: session.carrierFrequency,
      beatFrequency: session.beatFrequency,
      volume: settings.volume
    };
    
    setSettings(newSettings);
    audioEngine.updateSettings(newSettings);
    
    // Switch to home tab to show now playing
    setActiveTab('home');
  }, [settings.volume, audioEngine]);

  const handleSessionComplete = useCallback(() => {
    audioEngine.pause();
    setIsPlaying(false);
    
    // Track session completion
    if (currentSession && sessionLength && sessionStartTimeRef.current) {
      const actualDuration = Math.floor((Date.now() - sessionStartTimeRef.current) / 1000);
      const targetDuration = sessionLength * 60;
      const completed = actualDuration >= targetDuration * 0.8;
      
      userPreferences.addSessionHistory({
        sessionId: currentSession.id,
        date: new Date(),
        duration: actualDuration,
        completed,
        effectivenessRating: undefined,
        notes: undefined
      });
    }
    
    sessionStartTimeRef.current = null;
  }, [audioEngine, currentSession, sessionLength]);

  return {
    activeTab,
    setActiveTab,
    isPlaying,
    currentSession,
    sessionLength,
    settings,
    audioEngine,
    togglePlayback,
    updateSettings,
    selectSession,
    handleSessionComplete,
    setCurrentSession
  };
};

