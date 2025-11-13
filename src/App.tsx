import { useState, useEffect, useRef } from 'react';
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
import Onboarding from './components/Onboarding';
import PremiumModal from './components/PremiumModal';
import { ErrorBoundary } from './components/ErrorBoundary';

type AppView = 'onboarding' | 'main' | 'session-library';

function App() {
  const [audioEngine] = useState(() => new AudioEngine());
  const [view, setView] = useState<AppView>('onboarding');
  const [selectedGoal, setSelectedGoal] = useState<GoalType | null>(null);
  const [currentSession, setCurrentSession] = useState<SessionProtocol | null>(null);
  const [sessionLength, setSessionLength] = useState<SessionLength | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSessionLibrary, setShowSessionLibrary] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showProMode, setShowProMode] = useState(false);
  const [settings, setSettings] = useState<AudioSettings>({
    mode: 'binaural',
    waveform: 'sine',
    carrierFrequency: 440,
    beatFrequency: 10,
    volume: 0.3
  });
  const rampIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Handle page visibility changes (important for background audio)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden (app in background) - audio should continue playing
        console.log('App moved to background - audio continues');
      } else {
        // Page is visible again - ensure audio context is active
        if (isPlaying && audioEngine) {
          audioEngine.start().catch(error => {
            console.error('Failed to resume audio after visibility change:', error);
          });
        }
      }
    };

    // Handle page before unload (cleanup)
    const handleBeforeUnload = () => {
      if (audioEngine) {
        audioEngine.stop();
      }
      if (rampIntervalRef.current) {
        clearInterval(rampIntervalRef.current);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (audioEngine) {
        audioEngine.stop();
      }
      if (rampIntervalRef.current) {
        clearInterval(rampIntervalRef.current);
      }
    };
  }, [audioEngine, isPlaying]);

  const handleGoalSelected = (goal: GoalType) => {
    setSelectedGoal(goal);
    setView('main');
    // Personalized value prop messages available for future use:
    // sleep: 'Our sessions use deep Delta waves, scientifically shown to help you fall asleep faster and achieve restorative sleep.'
    // anxiety: 'Our Alpha wave sessions are designed to quiet a racing mind and bring on a state of calm in minutes.'
    // focus: 'Our Beta wave sessions enhance concentration and help you enter flow states for peak productivity.'
    // meditation: 'Our pure BWE sessions help you achieve deeper meditative states without distractions.'
  };

  const handleSessionSelect = async (session: SessionProtocol, length: SessionLength) => {
    setCurrentSession(session);
    setSessionLength(length);
    setShowSessionLibrary(false);
    
    // Apply session settings
    const newSettings: AudioSettings = {
      mode: session.mode,
      waveform: session.waveform,
      carrierFrequency: session.carrierFrequency,
      beatFrequency: session.beatFrequency,
      volume: settings.volume
    };
    
    setSettings(newSettings);
    audioEngine.updateSettings(newSettings);
    
    // If session has frequency ramp and is playing, set it up
    if (session.frequencyRamp && isPlaying) {
      setupFrequencyRamp(session);
    }
  };

  const setupFrequencyRamp = (session: SessionProtocol) => {
    if (!session.frequencyRamp) return;
    
    const { start, end, duration } = session.frequencyRamp;
    const totalSteps = duration;
    const stepSize = (end - start) / totalSteps;
    let currentStep = 0;
    
    if (rampIntervalRef.current) {
      clearInterval(rampIntervalRef.current);
    }
    
    rampIntervalRef.current = window.setInterval(() => {
      if (currentStep >= totalSteps || !isPlaying) {
        if (rampIntervalRef.current) {
          clearInterval(rampIntervalRef.current);
          rampIntervalRef.current = null;
        }
        return;
      }
      
      const newBeatFreq = start + (stepSize * currentStep);
      const newSettings = { ...settings, beatFrequency: newBeatFreq };
      setSettings(newSettings);
      audioEngine.updateSettings(newSettings);
      currentStep++;
    }, 1000);
  };

  const handlePlay = async () => {
    try {
      await audioEngine.start();
      setIsPlaying(true);
      
      // Setup frequency ramp if session has one
      if (currentSession?.frequencyRamp) {
        setupFrequencyRamp(currentSession);
      }
    } catch (error) {
      console.error('Failed to start audio:', error);
    }
  };

  const handleStop = () => {
    audioEngine.stop();
    setIsPlaying(false);
    if (rampIntervalRef.current) {
      clearInterval(rampIntervalRef.current);
      rampIntervalRef.current = null;
    }
  };

  const handleSessionComplete = () => {
    handleStop();
    // Could show completion message here
  };

  const handleVolumeChange = (volume: number) => {
    const newSettings = { ...settings, volume };
    setSettings(newSettings);
    audioEngine.updateSettings(newSettings);
  };

  const handleModeChange = (mode: 'binaural' | 'isochronic') => {
    const newSettings = { ...settings, mode };
    setSettings(newSettings);
    audioEngine.updateSettings(newSettings);
  };

  const handleWaveformChange = (waveform: 'sine' | 'square' | 'triangle' | 'sawtooth') => {
    const newSettings = { ...settings, waveform };
    setSettings(newSettings);
    audioEngine.updateSettings(newSettings);
  };

  const handleCarrierFrequencyChange = (carrierFrequency: number) => {
    const newSettings = { ...settings, carrierFrequency };
    setSettings(newSettings);
    audioEngine.updateSettings(newSettings);
  };

  const handleBeatFrequencyChange = (beatFrequency: number) => {
    const newSettings = { ...settings, beatFrequency };
    setSettings(newSettings);
    audioEngine.updateSettings(newSettings);
  };

  const handleUpgrade = (tier: 'monthly' | 'annual' | 'lifetime') => {
    premiumService.setTier(tier);
    setShowPremiumModal(false);
    // In a real app, this would trigger payment processing
    alert(`Thank you for upgrading to ${tier}! In production, this would process your payment.`);
  };

  // Show onboarding if no goal selected
  if (view === 'onboarding') {
    return (
      <ErrorBoundary>
        <Onboarding onGoalSelected={handleGoalSelected} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-main-gradient relative overflow-hidden">
        {/* Starry Night Sky Background */}
        <div className="starry-night"></div>

        <div className="relative z-10 container mx-auto px-4 py-8 safe-area-inset">
          {/* Header */}
          <header className="text-center mb-8">
            <div className="logo-container mb-6">
              <img 
                src="/logo-main.png" 
                alt="Blue Star Beats - Precision Brainwave Entrainment" 
                className="h-24 md:h-32 w-auto filter drop-shadow-2xl mx-auto"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
          </header>

          {/* Navigation Bar - Premium Design */}
          <div className="flex flex-wrap justify-center gap-3 mb-10 animate-fade-in">
            <button
              onClick={() => setShowSessionLibrary(true)}
              className="
                px-6 py-3 rounded-full
                bg-gray-800/50 hover:bg-gray-700/50
                backdrop-blur-sm
                border border-gray-700/50 hover:border-gray-600/50
                text-white font-semibold
                transition-all duration-300
                transform hover:scale-105
                flex items-center gap-2
              "
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Session Library
            </button>
            <button
              onClick={() => setShowProMode(!showProMode)}
              className={`
                px-6 py-3 rounded-full
                font-semibold
                transition-all duration-300
                transform hover:scale-105
                flex items-center gap-2
                ${showProMode 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50' 
                  : 'bg-gray-800/50 hover:bg-gray-700/50 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 text-white'
                }
              `}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Pro Mode
            </button>
            {!premiumService.isPremium() && (
              <button
                onClick={() => setShowPremiumModal(true)}
                className="
                  px-6 py-3 rounded-full
                  bg-gradient-to-r from-yellow-500 to-yellow-600
                  hover:from-yellow-400 hover:to-yellow-500
                  text-white font-bold
                  shadow-lg shadow-yellow-500/50
                  transition-all duration-300
                  transform hover:scale-105
                  flex items-center gap-2
                  animate-pulse
                "
              >
                <span className="text-lg">⭐</span>
                Upgrade
              </button>
            )}
          </div>

          {/* Current Session Info - Premium Design */}
          {currentSession && sessionLength && (
            <div className="
              card-premium p-6 mb-8 text-center
              animate-slide-up
              border-2 border-purple-500/30
              bg-gradient-to-br from-purple-900/20 to-blue-900/20
            ">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <h3 className="text-2xl font-bold text-white">{currentSession.name}</h3>
              </div>
              <p className="text-gray-300 text-base leading-relaxed">{currentSession.description}</p>
            </div>
          )}

          {/* Main control panel */}
          <div className="max-w-6xl mx-auto">
            {/* Full-width Waveform Visualization - Premium Design */}
            <div className="mb-8 animate-fade-in">
              <div className="card-premium p-8 border-2 border-purple-500/20">
                <h2 className="text-3xl font-bold text-white mb-8 text-center flex items-center justify-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full" />
                  <span className="text-gradient">Waveform Visualization</span>
                </h2>
                <Oscilloscope
                  audioEngine={audioEngine}
                  isPlaying={isPlaying}
                />
              </div>
            </div>

            {/* Session Timer - Premium Design */}
            {sessionLength && (
              <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="card-premium p-8 border-2 border-blue-500/20">
                  <SessionTimer
                    duration={sessionLength * 60}
                    isPlaying={isPlaying}
                    onComplete={handleSessionComplete}
                  />
                </div>
              </div>
            )}

            {/* Pro Mode Controls - Conditionally Shown */}
            {showProMode && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Left column - Audio Mode and Waveform Selection */}
                <div className="space-y-8">
                  <div className="card-premium p-8 border-2 border-purple-500/20 animate-fade-in">
                    <h2 className="text-2xl font-bold text-white mb-8 text-center flex items-center justify-center gap-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full" />
                      Audio Mode
                    </h2>
                    <div className="space-y-8">
                      <ModeSelector
                        mode={settings.mode}
                        onChange={handleModeChange}
                      />
                      <WaveformSelector
                        waveform={settings.waveform}
                        onChange={handleWaveformChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Right column - Frequency Controls and Audio Controls */}
                <div className="space-y-8">
                  <div className="card-premium p-8 border-2 border-blue-500/20 animate-fade-in">
                    <h2 className="text-2xl font-bold text-white mb-8 text-center flex items-center justify-center gap-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full" />
                      Frequency Controls
                    </h2>
                    <div className="space-y-8">
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
                  </div>
                  
                  {/* Audio Controls - Under Frequency Controls in Pro Mode */}
                  <div className="card-premium p-8 border-2 border-cyan-500/20 animate-fade-in">
                    <h2 className="text-2xl font-bold text-white mb-8 text-center flex items-center justify-center gap-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full" />
                      Audio Controls
                    </h2>
                    <AudioControlPanel
                      isPlaying={isPlaying}
                      volume={settings.volume}
                      onPlay={handlePlay}
                      onStop={handleStop}
                      onVolumeChange={handleVolumeChange}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Regular Mode - Frequency Controls and Audio Controls */}
            {!showProMode && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Frequency Controls */}
                <div className="card-premium p-8 border-2 border-blue-500/20 animate-fade-in">
                  <h2 className="text-2xl font-bold text-white mb-8 text-center flex items-center justify-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full" />
                    Frequency Controls
                  </h2>
                  <div className="space-y-8">
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
                </div>
                
                {/* Audio Controls */}
                <div className="card-premium p-8 border-2 border-cyan-500/20 animate-fade-in">
                  <h2 className="text-2xl font-bold text-white mb-8 text-center flex items-center justify-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full" />
                    Audio Controls
                  </h2>
                  <AudioControlPanel
                    isPlaying={isPlaying}
                    volume={settings.volume}
                    onPlay={handlePlay}
                    onStop={handleStop}
                    onVolumeChange={handleVolumeChange}
                  />
                </div>
              </div>
            )}

            {/* Premium CTA Section - Enhanced */}
            {!premiumService.isPremium() && (
              <div className="text-center mb-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <div className="
                  p-10 max-w-3xl mx-auto
                  rounded-2xl
                  bg-gradient-to-br from-purple-900/40 via-blue-900/40 to-purple-900/40
                  border-2 border-purple-500/30
                  backdrop-blur-md
                  shadow-2xl
                  relative overflow-hidden
                ">
                  {/* Animated background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-purple-600/10 animate-pulse" />
                  
                  <div className="relative z-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 mb-6 shadow-lg shadow-yellow-500/50">
                      <span className="text-3xl">⭐</span>
                    </div>
                    <h3 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                      <span className="text-gradient">Tune Your Mind.</span>
                      <br />
                      <span className="text-white">Unlock Your State.</span>
                    </h3>
                    <p className="text-gray-300 mb-8 text-lg max-w-xl mx-auto">
                      Unlock all 50+ sessions, advanced protocols, and premium features
                    </p>
                    <button 
                      onClick={() => setShowPremiumModal(true)}
                      className="
                        btn-premium text-lg font-bold px-10 py-4
                        transform hover:scale-105
                      "
                    >
                      Get Lifetime Access
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="text-center text-gray-400 text-sm">
              <p>© 2025 Blue Star Beats. Precision Brainwave Entrainment.</p>
              <p className="mt-2">Use headphones for the best binaural beats experience</p>
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

export default App;
