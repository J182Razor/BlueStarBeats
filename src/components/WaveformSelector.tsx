import React, { useState } from 'react';

interface WaveformSelectorProps {
  waveform: 'sine' | 'square' | 'triangle' | 'sawtooth';
  onChange: (waveform: 'sine' | 'square' | 'triangle' | 'sawtooth') => void;
}

const WaveformIcon: React.FC<{ type: string; isActive: boolean; isHovered: boolean }> = ({ 
  type, 
  isActive, 
  isHovered 
}) => {
  const strokeColor = isActive ? '#DAA520' : isHovered ? '#9CA3AF' : '#6B7280';
  const strokeWidth = isActive ? 3 : 2;
  
  switch (type) {
    case 'sine':
      return (
        <svg className="w-full h-12" viewBox="0 0 100 40" fill="none" strokeWidth={strokeWidth}>
          <path 
            d="M0 20 Q 12.5 8, 25 20 T 50 20 T 75 20 T 100 20" 
            stroke={strokeColor}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
      );
    case 'square':
      return (
        <svg className="w-full h-12" viewBox="0 0 100 40" fill="none" strokeWidth={strokeWidth}>
          <path 
            d="M0 32 L0 8 L25 8 L25 32 L25 8 L50 8 L50 32 L50 8 L75 8 L75 32 L75 8 L100 8" 
            stroke={strokeColor}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
      );
    case 'triangle':
      return (
        <svg className="w-full h-12" viewBox="0 0 100 40" fill="none" strokeWidth={strokeWidth}>
          <path 
            d="M0 32 L12.5 8 L25 32 L37.5 8 L50 32 L62.5 8 L75 32 L87.5 8 L100 32" 
            stroke={strokeColor}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
      );
    case 'sawtooth':
      return (
        <svg className="w-full h-12" viewBox="0 0 100 40" fill="none" strokeWidth={strokeWidth}>
          <path 
            d="M0 32 L25 8 L25 32 L50 8 L50 32 L75 8 L75 32 L100 8" 
            stroke={strokeColor}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
      );
    default:
      return null;
  }
};

const WaveformSelector: React.FC<WaveformSelectorProps> = ({ waveform, onChange }) => {
  const [hoveredWaveform, setHoveredWaveform] = useState<string | null>(null);

  const waveforms = [
    { 
      type: 'sine' as const, 
      name: 'Sine', 
      description: 'Pure, smooth tone',
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      type: 'square' as const, 
      name: 'Square', 
      description: 'Sharp, digital tone',
      color: 'from-purple-500 to-pink-500'
    },
    { 
      type: 'triangle' as const, 
      name: 'Triangle', 
      description: 'Soft, mellow tone',
      color: 'from-green-500 to-emerald-500'
    },
    { 
      type: 'sawtooth' as const, 
      name: 'Sawtooth', 
      description: 'Bright, buzzy tone',
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <h3 className="text-xl font-bold text-white text-center flex items-center justify-center gap-2">
        <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full" />
        Waveform Type
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        {waveforms.map((wave) => {
          const isActive = waveform === wave.type;
          const isHovered = hoveredWaveform === wave.type;
          
          return (
            <button
              key={wave.type}
              onClick={() => onChange(wave.type)}
              onMouseEnter={() => setHoveredWaveform(wave.type)}
              onMouseLeave={() => setHoveredWaveform(null)}
              className={`
                group relative
                p-6 rounded-xl
                border-2 transition-all duration-500
                overflow-hidden
                ${isActive
                  ? `bg-gradient-to-br ${wave.color} border-transparent shadow-xl scale-105`
                  : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600/50'
                }
                ${isHovered && !isActive ? 'scale-[1.02]' : ''}
              `}
            >
              {/* Animated background gradient */}
              {isActive && (
                <div className={`
                  absolute inset-0 bg-gradient-to-br ${wave.color}
                  opacity-20 animate-pulse
                `} />
              )}
              
              {/* Shine effect */}
              <div className="
                absolute inset-0
                bg-gradient-to-r from-transparent via-white/10 to-transparent
                -translate-x-full group-hover:translate-x-full
                transition-transform duration-1000
              " />
              
              <div className="relative z-10 flex flex-col items-center gap-3">
                {/* Waveform Visual with enhanced styling */}
                <div className={`
                  w-full h-16 p-2
                  bg-black/20 rounded-lg
                  flex items-center justify-center
                  transition-all duration-300
                  ${isActive ? 'scale-110' : ''}
                `}>
                  <WaveformIcon 
                    type={wave.type} 
                    isActive={isActive}
                    isHovered={isHovered}
                  />
                </div>
                
                {/* Waveform Info */}
                <div className="text-center">
                  <h4 className={`
                    font-bold text-lg mb-1 transition-colors duration-300
                    ${isActive ? 'text-white' : 'text-white'}
                  `}>
                    {wave.name}
                  </h4>
                  <p className={`
                    text-sm transition-colors duration-300
                    ${isActive ? 'text-white/90' : 'text-gray-300'}
                  `}>
                    {wave.description}
                  </p>
                </div>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 rounded-full bg-white animate-pulse shadow-lg" />
                  </div>
                )}
              </div>
              
              {/* Bottom accent line */}
              <div className={`
                absolute bottom-0 left-0 right-0 h-1
                bg-gradient-to-r ${wave.color}
                transform ${isActive ? 'scale-x-100' : 'scale-x-0'}
                transition-transform duration-500 origin-left
              `} />
            </button>
          );
        })}
      </div>

      {/* Waveform Info Card - Enhanced */}
      <div className="
        bg-gradient-to-br from-gray-800/50 to-gray-900/50
        border border-gray-700/50
        rounded-xl p-5
        backdrop-blur-sm
        transition-all duration-300
        hover:border-purple-500/30
      ">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            <span className="font-semibold text-white">Each waveform has unique characteristics:</span> 
            {' '}Sine waves are pure and smooth, square waves are sharp and digital, 
            triangle waves are soft and mellow, and sawtooth waves are bright and buzzy. 
            Experiment to find your preferred sound.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WaveformSelector;
