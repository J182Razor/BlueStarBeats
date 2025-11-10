import React from 'react';

interface ModeSelectorProps {
  mode: 'binaural' | 'isochronic';
  onChange: (mode: 'binaural' | 'isochronic') => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ mode, onChange }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white text-center">Audio Mode</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Binaural Beats */}
        <button
          onClick={() => onChange('binaural')}
          className={`mode-button ${mode === 'binaural' ? 'active' : ''}`}
        >
          <div className="flex items-center justify-center mb-3">
            <svg className="w-8 h-8 text-brand-blue" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h4 className="text-xl font-bold text-white mb-2">Binaural Beats</h4>
          <p className="text-sm text-gray-300 leading-relaxed">
            Different frequencies in each ear create beat perception in the brain
          </p>
        </button>

        {/* Isochronic Tones */}
        <button
          onClick={() => onChange('isochronic')}
          className={`mode-button ${mode === 'isochronic' ? 'active' : ''}`}
        >
          <div className="flex items-center justify-center mb-3">
            <svg className="w-8 h-8 text-brand-pink" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <h4 className="text-xl font-bold text-white mb-2">Isochronic Tones</h4>
          <p className="text-sm text-gray-300 leading-relaxed">
            Pulsing tones at regular intervals for rhythmic brainwave entrainment
          </p>
        </button>
      </div>

      {/* Recommendation */}
      <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4 text-center">
        <p className="text-sm text-blue-300">
          💡 Use headphones for the best binaural beats experience
        </p>
      </div>
    </div>
  );
};

export default ModeSelector;
