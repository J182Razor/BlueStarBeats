import React from 'react';

interface AudioControlPanelProps {
  isPlaying: boolean;
  volume: number;
  onPlay: () => void;
  onStop: () => void;
  onVolumeChange: (volume: number) => void;
}

const AudioControlPanel: React.FC<AudioControlPanelProps> = ({
  isPlaying,
  volume,
  onPlay,
  onStop,
  onVolumeChange,
}) => {
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onVolumeChange(parseFloat(e.target.value));
  };

  return (
    <div className="space-y-8">
      {/* Play/Pause Button */}
      <div className="flex justify-center">
        <button
          onClick={isPlaying ? onStop : onPlay}
          className={`play-button ${isPlaying ? 'playing' : ''}`}
          aria-label={isPlaying ? 'Stop audio' : 'Play audio'}
        >
          {isPlaying ? (
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" rx="2" />
              <rect x="14" y="4" width="4" height="16" rx="2" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <polygon points="8,5 19,12 8,19" />
            </svg>
          )}
        </button>
      </div>

      {/* Volume Control */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-lg font-semibold text-white">Volume</label>
          <span className="text-brand-golden font-bold text-lg">
            {Math.round(volume * 100)}%
          </span>
        </div>
        
        <div className="relative">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="volume-slider w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #DAA520 0%, #DAA520 ${volume * 100}%, #374151 ${volume * 100}%, #374151 100%)`
            }}
          />
        </div>
        
        <div className="flex justify-between text-sm text-gray-400">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="flex justify-center">
        <div className="status-indicator">
          <div className={`status-dot ${isPlaying ? 'playing' : 'stopped'}`}></div>
          <span className={`font-medium ${isPlaying ? 'text-green-400' : 'text-gray-400'}`}>
            {isPlaying ? 'Playing' : 'Stopped'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AudioControlPanel;
