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
    return () => {
      if (audioEngine) {
        audioEngine.stop();
      }
      if (rampIntervalRef.current) {
        clearInterval(rampIntervalRef.current);
      }
    };
  }, [audioEngine]);

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
        {/* Background Stars Effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-1 h-1 bg-white rounded-full opacity-60 animate-pulse"></div>
          <div className="absolute top-20 right-20 w-1 h-1 bg-blue-400 rounded-full opacity-40 animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-40 left-1/4 w-1 h-1 bg-white rounded-full opacity-50 animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-40 right-1/4 w-1 h-1 bg-blue-300 rounded-full opacity-60 animate-pulse" style={{animationDelay: '3s'}}></div>
          <div className="absolute bottom-20 left-20 w-1 h-1 bg-white rounded-full opacity-40 animate-pulse" style={{animationDelay: '4s'}}></div>
          <div className="absolute top-1/2 right-10 w-1 h-1 bg-blue-400 rounded-full opacity-50 animate-pulse" style={{animationDelay: '5s'}}></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Header */}
          <header className="text-center mb-8">
            <div className="logo-container mb-4">
              <img 
                src="/logo-main.png" 
                alt="Blue Star Beats Logo" 
                className="h-16 w-auto filter drop-shadow-lg mx-auto"
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-2">
              <span className="text-brand-blue">Blue Star</span>{' '}
              <span className="text-brand-golden">Beats</span>
            </h1>
            <p className="text-lg text-gray-300 font-medium">
              PRECISION BRAINWAVE ENTRAINMENT
            </p>
          </header>

          {/* Navigation Bar */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setShowSessionLibrary(true)}
              className="btn-secondary"
            >
              📚 Session Library
            </button>
            <button
              onClick={() => setShowProMode(!showProMode)}
              className={`${showProMode ? 'btn-primary' : 'btn-secondary'}`}
            >
              ⚙️ Pro Mode
            </button>
            {!premiumService.isPremium() && (
              <button
                onClick={() => setShowPremiumModal(true)}
                className="btn-primary"
              >
                ⭐ Upgrade
              </button>
            )}
          </div>

          {/* Current Session Info */}
          {currentSession && sessionLength && (
            <div className="card-premium p-4 mb-6 text-center">
              <h3 className="text-xl font-bold text-white mb-2">{currentSession.name}</h3>
              <p className="text-gray-300 text-sm">{currentSession.description}</p>
            </div>
          )}

          {/* Main control panel */}
          <div className="max-w-6xl mx-auto">
            {/* Full-width Waveform Visualization */}
            <div className="mb-8">
              <div className="card-premium p-8">
                <h2 className="text-2xl font-bold text-white mb-8 text-center">Waveform Visualization</h2>
                <Oscilloscope
                  audioEngine={audioEngine}
                  isPlaying={isPlaying}
                />
              </div>
            </div>

            {/* Session Timer */}
            {sessionLength && (
              <div className="mb-8">
                <div className="card-premium p-6">
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
                  <div className="card-premium p-8">
                    <h2 className="text-2xl font-bold text-white mb-8 text-center">Audio Mode</h2>
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

                {/* Right column - Frequency Controls */}
                <div className="space-y-8">
                  <div className="card-premium p-8">
                    <h2 className="text-2xl font-bold text-white mb-8 text-center">Frequency Controls</h2>
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
                </div>
              </div>
            )}

            {/* Audio Controls - Always Visible */}
            <div className="mb-8">
              <div className="card-premium p-8 max-w-md mx-auto">
                <h2 className="text-2xl font-bold text-white mb-8 text-center">Audio Controls</h2>
                <AudioControlPanel
                  isPlaying={isPlaying}
                  volume={settings.volume}
                  onPlay={handlePlay}
                  onStop={handleStop}
                  onVolumeChange={handleVolumeChange}
                />
              </div>
            </div>

            {/* Premium CTA Section */}
            {!premiumService.isPremium() && (
              <div className="text-center mb-8">
                <div className="card-highlight p-8 max-w-2xl mx-auto">
                  <h3 className="text-3xl font-bold text-white mb-4">
                    Tune Your Mind. <span className="text-brand-pink">Unlock Your State.</span>
                  </h3>
                  <p className="text-gray-300 mb-6">
                    Unlock all 50+ sessions, advanced protocols, and premium features
                  </p>
                  <button 
                    onClick={() => setShowPremiumModal(true)}
                    className="btn-primary text-lg font-bold"
                  >
                    Get Lifetime Access
                  </button>
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
