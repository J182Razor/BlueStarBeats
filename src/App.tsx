import { useState, useEffect } from 'react';
import { AudioEngine, AudioSettings } from './lib/audioEngine';
import AudioControlPanel from './components/AudioControlPanel';
import FrequencyControl from './components/FrequencyControl';
import ModeSelector from './components/ModeSelector';
import WaveformSelector from './components/WaveformSelector';
import Oscilloscope from './components/Oscilloscope';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  const [audioEngine] = useState(() => new AudioEngine());
  const [isPlaying, setIsPlaying] = useState(false);
  const [settings, setSettings] = useState<AudioSettings>({
    mode: 'binaural',
    waveform: 'sine',
    carrierFrequency: 440,
    beatFrequency: 10,
    volume: 0.3
  });

  useEffect(() => {
    return () => {
      if (audioEngine) {
        audioEngine.stop();
      }
    };
  }, [audioEngine]);

  const handlePlay = async () => {
    try {
      await audioEngine.start();
      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to start audio:', error);
    }
  };

  const handleStop = () => {
    audioEngine.stop();
    setIsPlaying(false);
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
          {/* Header with Premium Logo */}
          <header className="text-center mb-12">
            <div className="logo-container mb-6">
              <img 
                src="/logo-main.png" 
                alt="Blue Star Beats Logo" 
                className="h-20 w-auto filter drop-shadow-lg"
              />
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
              <span className="text-brand-blue">Blue Star</span>{' '}
              <span className="text-brand-golden">Beats</span>
            </h1>
            <p className="text-xl text-gray-300 font-medium tracking-wide">
              PRECISION BRAINWAVE ENTRAINMENT
            </p>
            <p className="text-lg text-gray-400 mt-4 max-w-2xl mx-auto">
              Experience the power of binaural beats and isochronic tones for meditation, focus, and relaxation
            </p>
          </header>

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

            {/* Two-column layout below waveform */}
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

              {/* Right column - Audio Controls and Frequency Controls */}
              <div className="space-y-8">
                {/* Audio Control Panel */}
                <div className="card-premium p-8">
                  <h2 className="text-2xl font-bold text-white mb-8 text-center">Audio Controls</h2>
                  <AudioControlPanel
                    isPlaying={isPlaying}
                    volume={settings.volume}
                    onPlay={handlePlay}
                    onStop={handleStop}
                    onVolumeChange={handleVolumeChange}
                  />
                </div>

                {/* Frequency Controls */}
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

            {/* Premium CTA Section */}
            <div className="text-center mb-8">
              <div className="card-highlight p-8 max-w-2xl mx-auto">
                <h3 className="text-3xl font-bold text-white mb-4">
                  Tune Your Mind. <span className="text-brand-pink">Unlock Your State.</span>
                </h3>
                <p className="text-gray-300 mb-6">
                  Use headphones for the best binaural beats experience
                </p>
                <button className="btn-primary text-lg font-bold">
                  Get Lifetime Access
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-gray-400 text-sm">
              <p>© 2025 Blue Star Beats. Precision Brainwave Entrainment.</p>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
