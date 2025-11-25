import React, { useState, useEffect, useCallback } from 'react';
import { HighQualityAudioEngine, AudioSettings, WaveformType, AudioMode } from './lib/audioEngine';
import { FrequencyControl } from './components/FrequencyControl';
import { WaveformSelector } from './components/WaveformSelector';
import { ModeSelector } from './components/ModeSelector';
import { AudioControlPanel } from './components/AudioControlPanel';
import { Oscilloscope } from './components/Oscilloscope';
import { ErrorBoundary } from './components/ErrorBoundary';

const App: React.FC = () => {
  const [audioEngine] = useState(() => new HighQualityAudioEngine());
  const [isPlaying, setIsPlaying] = useState(false);
  const [settings, setSettings] = useState<AudioSettings>({
    carrierFrequency: 440,
    beatFrequency: 10,
    waveform: 'sine',
    mode: 'binaural',
    volume: 0.3
  });

  const handlePlay = useCallback(async () => {
    try {
      await audioEngine.start();
      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to start audio:', error);
    }
  }, [audioEngine]);

  const handleStop = useCallback(() => {
    audioEngine.stop();
    setIsPlaying(false);
  }, [audioEngine]);

  const handleSettingsChange = useCallback((newSettings: Partial<AudioSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    audioEngine.updateSettings(newSettings);
  }, [settings, audioEngine]);

  const handleCarrierFrequencyChange = useCallback((frequency: number) => {
    handleSettingsChange({ carrierFrequency: frequency });
  }, [handleSettingsChange]);

  const handleBeatFrequencyChange = useCallback((frequency: number) => {
    handleSettingsChange({ beatFrequency: frequency });
  }, [handleSettingsChange]);

  const handleWaveformChange = useCallback((waveform: WaveformType) => {
    handleSettingsChange({ waveform });
  }, [handleSettingsChange]);

  const handleModeChange = useCallback((mode: AudioMode) => {
    handleSettingsChange({ mode });
  }, [handleSettingsChange]);

  const handleVolumeChange = useCallback((volume: number) => {
    handleSettingsChange({ volume });
  }, [handleSettingsChange]);

  useEffect(() => {
    return () => {
      audioEngine.destroy();
    };
  }, [audioEngine]);

  return (
    <ErrorBoundary>
      <div 
        className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Background overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-purple-900/70 to-slate-900/80 backdrop-blur-sm"></div>
        
        {/* Main content */}
        <div className="relative z-10 container mx-auto px-8 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
              Blue Star Beats
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Experience the power of binaural beats and isochronic tones for meditation, focus, and relaxation
            </p>
          </div>

          {/* Main control panel */}
          <div className="max-w-6xl mx-auto">
            {/* Full-width Waveform Visualization */}
            <div className="mb-8">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border-0 shadow-2xl">
                <h2 className="text-2xl font-semibold text-white mb-8 text-center">Waveform Visualization</h2>
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
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border-0 shadow-2xl">
                  <h2 className="text-2xl font-semibold text-white mb-8 text-center">Audio Mode</h2>
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
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border-0 shadow-2xl">
                  <h2 className="text-2xl font-semibold text-white mb-8 text-center">Audio Controls</h2>
                  <AudioControlPanel
                    isPlaying={isPlaying}
                    volume={settings.volume}
                    onPlay={handlePlay}
                    onStop={handleStop}
                    onVolumeChange={handleVolumeChange}
                  />
                </div>

                {/* Frequency Controls */}
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border-0 shadow-2xl">
                  <h2 className="text-2xl font-semibold text-white mb-8 text-center">Frequency Controls</h2>
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

            {/* Footer */}
            <div className="text-center text-gray-400 text-sm">
              <p>Use headphones for the best binaural beats experience</p>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default App;

