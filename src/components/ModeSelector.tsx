import React, { useCallback } from 'react';
import { AudioMode } from '../lib/audioEngine';

interface ModeSelectorProps {
  mode: AudioMode;
  onChange: (mode: AudioMode) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = React.memo(({
  mode,
  onChange
}) => {
  const handleModeChange = useCallback((newMode: AudioMode) => {
    onChange(newMode);
  }, [onChange]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-white text-center">Audio Mode</h3>
      
      <div className="grid grid-cols-2 gap-6">
        <button
          onClick={() => handleModeChange('binaural')}
          className={`
            p-6 rounded-3xl border-0 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-400/50 shadow-lg
            ${mode === 'binaural'
              ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-2xl'
              : 'bg-white/20 backdrop-blur-md text-white/80 hover:bg-white/30'
            }
          `}
        >
          <div className="text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-lg">Binaural Beats</h4>
              <p className="text-sm opacity-80">Different frequencies in each ear</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleModeChange('isochronic')}
          className={`
            p-6 rounded-3xl border-0 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-400/50 shadow-lg
            ${mode === 'isochronic'
              ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-2xl'
              : 'bg-white/20 backdrop-blur-md text-white/80 hover:bg-white/30'
            }
          `}
        >
          <div className="text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-lg">Isochronic Tones</h4>
              <p className="text-sm opacity-80">Pulsing tones at regular intervals</p>
            </div>
          </div>
        </button>
      </div>

      <div className="text-center text-sm text-white/60 bg-white/10 rounded-3xl p-4 border-0">
        {mode === 'binaural' 
          ? 'Use headphones for the best binaural beats experience'
          : 'Isochronic tones work with speakers or headphones'
        }
      </div>
    </div>
  );
});

