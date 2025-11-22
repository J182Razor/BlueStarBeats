import { deviceControls } from './lib/deviceControls';
import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { AudioEngine, AudioSettings } from './lib/audioEngine';
import { SessionProtocol, GoalType, SessionLength } from './lib/sessionProtocols';
import { premiumService } from './lib/premiumService';
import AudioControlPanel from './components/AudioControlPanel';
import FrequencyControl from './components/FrequencyControl';
import ModeSelector from './components/ModeSelector';
import WaveformSelector from './components/WaveformSelector';
import Oscilloscope from './components/Oscilloscope';
import SessionTimer from './components/SessionTimer';
import SessionLibrary from './components/SessionLibrary';
import PremiumModal from './components/PremiumModal';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  const [audioEngine] = useState(() => new AudioEngine());
  const [selectedGoal, setSelectedGoal] = useState<GoalType | null>(null);
  const [currentSession, setCurrentSession] = useState<SessionProtocol | null>(null);
  const [sessionLength, setSessionLength] = useState<SessionLength | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSessionLibrary, setShowSessionLibrary] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showProMode, setShowProMode] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [settings, setSettings] = useState<AudioSettings>({
    mode: 'binaural',
    waveform: 'sine',
    carrierFrequency: 440,
    beatFrequency: 10,
    volume: 0.3
  });
  const rampIntervalRef = useRef<number | null>(null);

  // Initialize audio engine on mount
  useEffect(() => {
    audioEngine.initialize().catch(error => {
      console.error('Failed to initialize audio engine:', error);
    });
    
    return () => {
      audioEngine.destroy();
    };
  }, [audioEngine]);

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!isPlaying) return;
      
      if (document.hidden) {
          try {
          await audioEngine.initialize();
          } catch (error) {
            console.error('Failed to maintain audio in background:', error);
        }
      } else {
          try {
          await audioEngine.initialize();
          } catch (error) {
            console.error('Failed to resume audio after visibility change:', error);
        }
      }
    };

    const handleBeforeUnload = () => {
        audioEngine.stop();
      if (rampIntervalRef.current) {
        clearInterval(rampIntervalRef.current);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [audioEngine, isPlaying]);

  const handleGoalSelected = useCallback((goal: GoalType) => {
    setSelectedGoal(goal);
    setShowOnboarding(false);
  }, []);

  const handleSessionSelect = useCallback(async (session: SessionProtocol, length: SessionLength) => {
    setCurrentSession(session);
    setSessionLength(length);
    setShowSessionLibrary(false);
    
    const newSettings: AudioSettings = {
      mode: session.mode,
      waveform: session.waveform,
      carrierFrequency: session.carrierFrequency,
      beatFrequency: session.beatFrequency,
      volume: settings.volume
    };
    
    setSettings(newSettings);
    
    if (isPlaying) {
      audioEngine.updateSettings(newSettings);
      if (session.frequencyRamp) {
        setupFrequencyRamp(session);
      }
    } else {
      audioEngine.updateSettings(newSettings);
    }
  }, [isPlaying, settings.volume, audioEngine]);

  const setupFrequencyRamp = useCallback((session: SessionProtocol) => {
    if (!session.frequencyRamp) return;
    
    if (rampIntervalRef.current) {
      clearInterval(rampIntervalRef.current);
      rampIntervalRef.current = null;
    }
    
    const { start, end, duration } = session.frequencyRamp;
    const totalSteps = duration;
    const stepSize = (end - start) / totalSteps;
    let currentStep = 0;
    
    rampIntervalRef.current = window.setInterval(() => {
      if (currentStep >= totalSteps || !isPlaying) {
        if (rampIntervalRef.current) {
          clearInterval(rampIntervalRef.current);
          rampIntervalRef.current = null;
        }
        return;
      }
      
      const newBeatFreq = Math.max(0.1, Math.min(100, start + (stepSize * currentStep)));
      setSettings(prev => {
        const newSettings = { ...prev, beatFrequency: newBeatFreq };
        audioEngine.updateSettings({ beatFrequency: newBeatFreq });
        return newSettings;
      });
      currentStep++;
    }, 1000);
  }, [isPlaying, audioEngine]);

  const handlePlay = useCallback(async () => {
    if (isPlaying) return;

    try {
      await audioEngine.initialize();
      audioEngine.updateSettings(settings);
      await audioEngine.start();
      setIsPlaying(true);
    deviceControls.updateNowPlaying(currentSession, true);
      
      if (currentSession?.frequencyRamp) {
        setupFrequencyRamp(currentSession);
      }
    } catch (error) {
      console.error('Failed to start audio:', error);
      setIsPlaying(false);
      alert(`Failed to start audio: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your device settings and try again.`);
    }
  }, [isPlaying, audioEngine, settings, currentSession, setupFrequencyRamp]);

  const handleStop = useCallback(() => {
    audioEngine.stop();
    setIsPlaying(false);
    deviceControls.updateNowPlaying(currentSession, false);
    if (rampIntervalRef.current) {
      clearInterval(rampIntervalRef.current);
      rampIntervalRef.current = null;
    }
  }, [audioEngine, currentSession]);

  useEffect(() => {
    deviceControls.updateNowPlaying(currentSession, isPlaying);
  }, [currentSession, isPlaying]);

  useEffect(() => {
    const handleDevicePlay = () => {
      if (!isPlaying) handlePlay();
    };
    const handleDevicePause = () => {
      if (isPlaying) handleStop();
    };
    const handleDeviceToggle = () => {
      if (isPlaying) handleStop();
      else handlePlay();
    };
    
    window.addEventListener("devicePlay", handleDevicePlay);
    window.addEventListener("devicePause", handleDevicePause);
    window.addEventListener("deviceToggle", handleDeviceToggle);
    
    return () => {
      window.removeEventListener("devicePlay", handleDevicePlay);
      window.removeEventListener("devicePause", handleDevicePause);
      window.removeEventListener("deviceToggle", handleDeviceToggle);
    };
  }, [isPlaying, handlePlay, handleStop]);

  const handleSessionComplete = useCallback(() => {
    handleStop();
  }, [handleStop]);

  const handleVolumeChange = useCallback((volume: number) => {
    const newSettings = { ...settings, volume };
    setSettings(newSettings);
    audioEngine.updateSettings(newSettings);
  }, [settings, audioEngine]);

  const handleModeChange = useCallback((mode: 'binaural' | 'isochronic') => {
    const newSettings = { ...settings, mode };
    setSettings(newSettings);
    audioEngine.updateSettings(newSettings);
  }, [settings, audioEngine]);

  const handleWaveformChange = useCallback((waveform: 'sine' | 'square' | 'triangle' | 'sawtooth') => {
    const newSettings = { ...settings, waveform };
    setSettings(newSettings);
    audioEngine.updateSettings(newSettings);
  }, [settings, audioEngine]);

  const handleCarrierFrequencyChange = useCallback((carrierFrequency: number) => {
    const newSettings = { ...settings, carrierFrequency };
    setSettings(newSettings);
    audioEngine.updateSettings(newSettings);
  }, [settings, audioEngine]);

  const handleBeatFrequencyChange = useCallback((beatFrequency: number) => {
    const newSettings = { ...settings, beatFrequency };
    setSettings(newSettings);
    audioEngine.updateSettings(newSettings);
  }, [settings, audioEngine]);

  const handleUpgrade = useCallback((tier: 'monthly' | 'annual' | 'lifetime') => {
    premiumService.setTier(tier);
    setShowPremiumModal(false);
    alert(`Thank you for upgrading to ${tier}! In production, this would process your payment.`);
  }, []);

  // Memoized goal selection component
  const GoalSelection = useMemo(() => {
    const goals: { type: GoalType; emoji: string; title: string; description: string; gradient: string }[] = [
      { type: 'sleep', emoji: '😴', title: 'Sleep Better', description: 'Fall asleep faster with Delta waves', gradient: 'from-indigo-600 to-purple-700' },
      { type: 'anxiety', emoji: '😌', title: 'Reduce Stress', description: 'Find calm with Alpha frequencies', gradient: 'from-blue-500 to-cyan-600' },
      { type: 'focus', emoji: '🧠', title: 'Improve Focus', description: 'Enhance concentration with Beta waves', gradient: 'from-purple-600 to-pink-600' },
      { type: 'meditation', emoji: '🧘', title: 'Deepen Meditation', description: 'Achieve deeper states with Theta', gradient: 'from-teal-600 to-emerald-600' }
    ];

    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">
            <span className="text-gradient">Choose Your Goal</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-300">Select what you'd like to achieve</p>
            </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {goals.map((goal) => (
            <button
              key={goal.type}
              onClick={() => handleGoalSelected(goal.type)}
              className="card-premium p-4 sm:p-6 text-left transition-all duration-300 hover:scale-[1.02] group"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="text-4xl sm:text-5xl">{goal.emoji}</div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2 text-white group-hover:text-gradient transition-colors">
                    {goal.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">{goal.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }, [handleGoalSelected]);

  // Memoized control panels
  const ControlPanels = useMemo(() => {
    const frequencyControls = (
      <div className="space-y-4 sm:space-y-6">
        <FrequencyControl
          label="Carrier Frequency"
          value={settings.carrierFrequency}
          min={0.001}
          max={9999}
          step={0.001}
          unit="Hz"
          onChange={handleCarrierFrequencyChange}
        />
        <FrequencyControl
          label={settings.mode === 'binaural' ? 'Beat Frequency' : 'Pulse Frequency'}
          value={settings.beatFrequency}
          min={0.001}
          max={9999}
          step={0.001}
          unit="Hz"
          onChange={handleBeatFrequencyChange}
        />
    </div>
  );

    const audioControls = (
      <AudioControlPanel
        isPlaying={isPlaying}
        volume={settings.volume}
        onPlay={handlePlay}
        onStop={handleStop}
        onVolumeChange={handleVolumeChange}
      />
    );

    return { frequencyControls, audioControls };
  }, [settings, isPlaying, handleCarrierFrequencyChange, handleBeatFrequencyChange, handlePlay, handleStop, handleVolumeChange]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-main-gradient relative overflow-hidden">
        <div className="starry-night"></div>

        <div className="relative z-10 container mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-20 sm:pb-24 safe-area-inset">
          {/* Compact Header */}
          <header className="text-center mb-4 sm:mb-6">
            <div className="logo-container mb-3 sm:mb-4">
              <img 
                src="/logo-main.png" 
                alt="Blue Star Beats" 
                className="h-16 sm:h-24 md:h-32 w-auto mx-auto"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
          </header>

          {/* Compact Navigation */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <button
              onClick={() => setShowSessionLibrary(true)}
              className="nav-button-silver shimmer-overlay-silver flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="hidden sm:inline">Library</span>
            </button>
            <button
              onClick={() => setShowProMode(!showProMode)}
              className={`nav-button-silver shimmer-overlay-silver flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm ${showProMode ? 'border-silver-400 shadow-silver-md' : ''}`}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="hidden sm:inline">Pro</span>
            </button>
            {!premiumService.isPremium() && (
              <button
                onClick={() => setShowPremiumModal(true)}
                className="btn-premium shimmer-overlay flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm"
              >
                <span className="text-base sm:text-lg">⭐</span>
                <span className="hidden sm:inline">Upgrade</span>
              </button>
            )}
          </div>

          {/* Onboarding Section - Collapsible */}
          {showOnboarding && (
            <div className="glass-card-silver p-4 sm:p-6 mb-4 sm:mb-6 animate-slide-up">
              {GoalSelection}
              <button
                onClick={() => setShowOnboarding(false)}
                className="mt-4 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Skip for now →
              </button>
            </div>
          )}

          {/* Current Session Info */}
          {currentSession && sessionLength && (
            <div className="glass-card-silver p-4 sm:p-6 mb-4 sm:mb-6 text-center animate-slide-up">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <h3 className="text-lg sm:text-2xl font-bold text-silver-light">{currentSession.name}</h3>
              </div>
              <p className="text-xs sm:text-base text-silver-dark leading-relaxed">{currentSession.description}</p>
            </div>
          )}

          {/* Main Content */}
          <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
            {/* Waveform Visualization */}
            <div className="glass-card-silver p-4 sm:p-6 lg:p-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-silver-light mb-4 sm:mb-6 text-center">
                <span className="text-gradient-silver">Waveform</span>
                </h2>
              <Oscilloscope audioEngine={audioEngine} isPlaying={isPlaying} />
            </div>

            {/* Session Timer */}
            {sessionLength && (
              <div className="glass-card-silver p-4 sm:p-6 lg:p-8">
                  <SessionTimer
                    duration={sessionLength * 60}
                    isPlaying={isPlaying}
                    onComplete={handleSessionComplete}
                  />
              </div>
            )}

            {/* Controls - Unified Layout */}
            <div className={`grid grid-cols-1 ${showProMode ? 'lg:grid-cols-2' : ''} gap-4 sm:gap-6 lg:gap-8`}>
              {/* Pro Mode: Left Column */}
            {showProMode && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="glass-card-silver p-4 sm:p-6 lg:p-8">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-silver-light mb-4 sm:mb-6 text-center">
                      Audio Mode
                    </h2>
                    <div className="space-y-4 sm:space-y-6">
                      <ModeSelector mode={settings.mode} onChange={handleModeChange} />
                      <WaveformSelector waveform={settings.waveform} onChange={handleWaveformChange} />
                  </div>
                </div>
              </div>
            )}

              {/* Right Column / Single Column */}
              <div className="space-y-4 sm:space-y-6">
                <div className="glass-card-silver p-4 sm:p-6 lg:p-8">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-silver-light mb-4 sm:mb-6 text-center">
                    Frequency Controls
                  </h2>
                  {ControlPanels.frequencyControls}
                </div>
                
                <div className="glass-card-silver p-4 sm:p-6 lg:p-8">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-silver-light mb-4 sm:mb-6 text-center">
                    Audio Controls
                  </h2>
                  {ControlPanels.audioControls}
                </div>
              </div>
            </div>

            {/* Premium CTA */}
            {!premiumService.isPremium() && (
              <div className="text-center">
                <div className="glass-elevated-silver p-6 sm:p-8 lg:p-10 max-w-3xl mx-auto shimmer-overlay-silver">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-silver-gradient mb-4 sm:mb-6 shadow-silver-lg">
                    <span className="text-2xl sm:text-3xl">⭐</span>
                    </div>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl md:text-5xl font-extrabold mb-3 sm:mb-4">
                      <span className="text-gradient-silver">Tune Your Mind.</span>
                      <br />
                      <span className="text-silver-light">Unlock Your State.</span>
                    </h3>
                  <p className="text-sm sm:text-base lg:text-lg text-silver-dark mb-4 sm:mb-6 sm:mb-8 max-w-xl mx-auto">
                      Unlock all 50+ sessions, advanced protocols, and premium features
                    </p>
                    <button 
                      onClick={() => setShowPremiumModal(true)}
                    className="btn-premium shimmer-overlay text-sm sm:text-base lg:text-lg font-bold px-6 sm:px-8 lg:px-10 py-3 sm:py-4 transform hover:scale-105"
                    >
                      Get Lifetime Access
                    </button>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="text-center text-silver-dark text-xs sm:text-sm py-4">
              <p>© 2025 Blue Star Beats. Precision Brainwave Entrainment.</p>
              <p className="mt-1 sm:mt-2">Use headphones for the best binaural beats experience</p>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-t border-gray-700/50 safe-area-inset-bottom z-50">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="flex items-center justify-around py-3 sm:py-4">
              <button
                onClick={() => setShowProMode(false)}
                className={`flex flex-col items-center gap-1 sm:gap-2 transition-colors min-w-[50px] sm:min-w-[60px] ${!showProMode ? 'text-blue-400' : 'text-white hover:text-gray-300'}`}
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${!showProMode ? 'bg-blue-500/20' : ''}`}>
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <span className="text-xs font-medium">Main</span>
              </button>

              <button
                onClick={() => setShowSessionLibrary(true)}
                className="flex flex-col items-center gap-1 sm:gap-2 text-white hover:text-gray-300 transition-colors min-w-[50px] sm:min-w-[60px]"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className="text-xs font-medium">Library</span>
              </button>

              <button
                onClick={() => setShowProMode(!showProMode)}
                className={`flex flex-col items-center gap-1 sm:gap-2 transition-colors min-w-[50px] sm:min-w-[60px] ${showProMode ? 'text-blue-400' : 'text-white hover:text-gray-300'}`}
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${showProMode ? 'bg-blue-500/20' : ''}`}>
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-xs font-medium">Advanced</span>
              </button>

              {!premiumService.isPremium() && (
                <button
                  onClick={() => setShowPremiumModal(true)}
                  className="flex flex-col items-center gap-1 sm:gap-2 text-yellow-400 hover:text-yellow-300 transition-colors min-w-[50px] sm:min-w-[60px]"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <span className="text-xs font-medium">Purchase</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modals */}
        {showSessionLibrary && (
          <SessionLibrary
            goal={selectedGoal}
            onSessionSelect={handleSessionSelect}
            onClose={() => setShowSessionLibrary(false)}
          />
        )}

        {showPremiumModal && (
          <PremiumModal
            onClose={() => setShowPremiumModal(false)}
            onUpgrade={handleUpgrade}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default memo(App);
