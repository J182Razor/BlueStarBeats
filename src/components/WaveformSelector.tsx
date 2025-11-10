import React from 'react';

interface WaveformSelectorProps {
  waveform: 'sine' | 'square' | 'triangle' | 'sawtooth';
  onChange: (waveform: 'sine' | 'square' | 'triangle' | 'sawtooth') => void;
}

const WaveformIcon: React.FC<{ type: string; isActive: boolean }> = ({ type, isActive }) => {
  const strokeColor = isActive ? '#DAA520' : '#9CA3AF';
  
  switch (type) {
    case 'sine':
      return (
        <svg className="w-full h-8" viewBox="0 0 100 32" fill="none" strokeWidth="2">
          <path d="M0 16 Q 12.5 4, 25 16 T 50 16 T 75 16 T 100 16" stroke={strokeColor} />
        </svg>
      );
    case 'square':
      return (
        <svg className="w-full h-8" viewBox="0 0 100 32" fill="none" strokeWidth="2">
          <path d="M0 24 L0 8 L25 8 L25 24 L25 8 L50 8 L50 24 L50 8 L75 8 L75 24 L75 8 L100 8" stroke={strokeColor} />
        </svg>
      );
    case 'triangle':
      return (
        <svg className="w-full h-8" viewBox="0 0 100 32" fill="none" strokeWidth="2">
          <path d="M0 24 L12.5 8 L25 24 L37.5 8 L50 24 L62.5 8 L75 24 L87.5 8 L100 24" stroke={strokeColor} />
        </svg>
      );
    case 'sawtooth':
      return (
        <svg className="w-full h-8" viewBox="0 0 100 32" fill="none" strokeWidth="2">
          <path d="M0 24 L25 8 L25 24 L50 8 L50 24 L75 8 L75 24 L100 8" stroke={strokeColor} />
        </svg>
      );
    default:
      return null;
  }
};

const WaveformSelector: React.FC<WaveformSelectorProps> = ({ waveform, onChange }) => {
  const waveforms = [
    { type: 'sine' as const, name: 'Sine', description: 'Pure, smooth tone' },
    { type: 'square' as const, name: 'Square', description: 'Sharp, digital tone' },
    { type: 'triangle' as const, name: 'Triangle', description: 'Soft, mellow tone' },
    { type: 'sawtooth' as const, name: 'Sawtooth', description: 'Bright, buzzy tone' }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white text-center">Waveform Type</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {waveforms.map((wave) => (
          <button
            key={wave.type}
            onClick={() => onChange(wave.type)}
            className={`waveform-button ${waveform === wave.type ? 'active' : ''}`}
          >
            {/* Waveform Visual */}
            <div className="w-full h-12 mb-3 flex items-center justify-center">
              <WaveformIcon type={wave.type} isActive={waveform === wave.type} />
            </div>
            
            {/* Waveform Info */}
            <div className="text-center">
              <h4 className="font-bold text-white text-lg mb-1">{wave.name}</h4>
              <p className="text-sm text-gray-300">{wave.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Waveform Info */}
      <div className="bg-gray-900/30 border border-gray-700/50 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-300">
          Each waveform has a unique tonal character and harmonic content
        </p>
      </div>
    </div>
  );
};

export default WaveformSelector;
