import React, { useCallback } from 'react';
import { WaveformType } from '../lib/audioEngine';

interface WaveformSelectorProps {
  waveform: WaveformType;
  onChange: (waveform: WaveformType) => void;
}

const WaveformIcon: React.FC<{ type: WaveformType; isActive: boolean }> = ({ type, isActive }) => {
  const baseClasses = `w-full h-8 ${isActive ? 'stroke-white' : 'stroke-white/60'}`;
  
  switch (type) {
    case 'sine':
      return (
        <svg className={baseClasses} viewBox="0 0 100 32" fill="none" strokeWidth="2">
          <path d="M0 16 Q 12.5 4, 25 16 T 50 16 T 75 16 T 100 16" />
        </svg>
      );
    case 'square':
      return (
        <svg className={baseClasses} viewBox="0 0 100 32" fill="none" strokeWidth="2">
          <path d="M0 24 L0 8 L25 8 L25 24 L25 8 L50 8 L50 24 L50 8 L75 8 L75 24 L75 8 L100 8" />
        </svg>
      );
    case 'triangle':
      return (
        <svg className={baseClasses} viewBox="0 0 100 32" fill="none" strokeWidth="2">
          <path d="M0 24 L12.5 8 L25 24 L37.5 8 L50 24 L62.5 8 L75 24 L87.5 8 L100 24" />
        </svg>
      );
    case 'sawtooth':
      return (
        <svg className={baseClasses} viewBox="0 0 100 32" fill="none" strokeWidth="2">
          <path d="M0 24 L25 8 L25 24 L50 8 L50 24 L75 8 L75 24 L100 8" />
        </svg>
      );
    default:
      return null;
  }
};

export const WaveformSelector: React.FC<WaveformSelectorProps> = React.memo(({
  waveform,
  onChange
}) => {
  const handleWaveformChange = useCallback((newWaveform: WaveformType) => {
    onChange(newWaveform);
  }, [onChange]);

  const waveforms: { type: WaveformType; name: string; description: string }[] = [
    { type: 'sine', name: 'Sine', description: 'Pure, smooth tone' },
    { type: 'square', name: 'Square', description: 'Sharp, digital tone' },
    { type: 'triangle', name: 'Triangle', description: 'Soft, mellow tone' },
    { type: 'sawtooth', name: 'Sawtooth', description: 'Bright, buzzy tone' }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-white text-center">Waveform Type</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {waveforms.map((wave) => (
          <button
            key={wave.type}
            onClick={() => handleWaveformChange(wave.type)}
            className={`
              p-4 rounded-3xl border-0 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-400/50 shadow-lg
              ${waveform === wave.type
                ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-2xl'
                : 'bg-white/20 backdrop-blur-md text-white/80 hover:bg-white/30'
              }
            `}
          >
            <div className="space-y-3">
              <div className="h-8 flex items-center justify-center">
                <WaveformIcon type={wave.type} isActive={waveform === wave.type} />
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-sm">{wave.name}</h4>
                <p className="text-xs opacity-80">{wave.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});

