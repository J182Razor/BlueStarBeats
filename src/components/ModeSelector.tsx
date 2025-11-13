import React, { useState } from 'react';

interface ModeSelectorProps {
  mode: 'binaural' | 'isochronic';
  onChange: (mode: 'binaural' | 'isochronic') => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ mode, onChange }) => {
  const [hoveredMode, setHoveredMode] = useState<'binaural' | 'isochronic' | null>(null);

  const modes = [
    {
      type: 'binaural' as const,
      name: 'Binaural Beats',
      description: 'Different frequencies in each ear create beat perception in the brain',
      icon: (
        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      ),
      gradient: 'from-blue-500 to-cyan-600',
      color: 'text-blue-400'
    },
    {
      type: 'isochronic' as const,
      name: 'Isochronic Tones',
      description: 'Pulsing tones at regular intervals for rhythmic brainwave entrainment',
      icon: (
        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ),
      gradient: 'from-pink-500 to-purple-600',
      color: 'text-pink-400'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <h3 className="text-xl font-bold text-white text-center flex items-center justify-center gap-2">
        <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full" />
        Audio Mode
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modes.map((modeOption) => {
          const isActive = mode === modeOption.type;
          const isHovered = hoveredMode === modeOption.type;
          
          return (
            <button
              key={modeOption.type}
              onClick={() => onChange(modeOption.type)}
              onMouseEnter={() => setHoveredMode(modeOption.type)}
              onMouseLeave={() => setHoveredMode(null)}
              className={`
                group relative
                p-8 rounded-2xl
                border-2 transition-all duration-500
                overflow-hidden
                ${isActive
                  ? `bg-gradient-to-br ${modeOption.gradient} border-transparent shadow-2xl scale-105`
                  : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600/50'
                }
                ${isHovered && !isActive ? 'scale-[1.02]' : ''}
              `}
            >
              {/* Animated background gradient */}
              {isActive && (
                <div className={`
                  absolute inset-0 bg-gradient-to-br ${modeOption.gradient}
                  opacity-20 animate-pulse
                `} />
              )}
              
              {/* Shine effect on hover */}
              <div className="
                absolute inset-0
                bg-gradient-to-r from-transparent via-white/10 to-transparent
                -translate-x-full group-hover:translate-x-full
                transition-transform duration-1000
              " />
              
              <div className="relative z-10 flex flex-col items-center text-center">
                {/* Icon with glow effect */}
                <div className={`
                  mb-4 transition-all duration-300
                  ${isActive ? 'scale-110' : 'scale-100'}
                  ${modeOption.color}
                  ${isActive ? 'drop-shadow-[0_0_20px_currentColor]' : ''}
                `}>
                  {modeOption.icon}
                </div>
                
                <h4 className={`
                  text-2xl font-bold mb-3 transition-colors duration-300
                  ${isActive ? 'text-white' : 'text-white'}
                `}>
                  {modeOption.name}
                </h4>
                
                <p className={`
                  text-sm leading-relaxed transition-colors duration-300
                  ${isActive ? 'text-white/90' : 'text-gray-300'}
                `}>
                  {modeOption.description}
                </p>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="mt-4 flex items-center gap-2 text-white/80">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span className="text-xs font-semibold">ACTIVE</span>
                  </div>
                )}
              </div>
              
              {/* Bottom accent line */}
              <div className={`
                absolute bottom-0 left-0 right-0 h-1
                bg-gradient-to-r ${modeOption.gradient}
                transform ${isActive ? 'scale-x-100' : 'scale-x-0'}
                transition-transform duration-500 origin-left
              `} />
            </button>
          );
        })}
      </div>

      {/* Recommendation Card - Enhanced */}
      <div className="
        bg-gradient-to-br from-blue-900/30 to-cyan-900/30
        border border-blue-700/30
        rounded-xl p-5
        backdrop-blur-sm
        transition-all duration-300
        hover:border-blue-600/50
        hover:shadow-lg hover:shadow-blue-500/20
      ">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">💡</span>
          </div>
          <p className="text-sm text-blue-200 leading-relaxed">
            <span className="font-semibold">Pro Tip:</span> Use headphones for the best binaural beats experience. 
            The effect requires stereo separation between your ears.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModeSelector;
