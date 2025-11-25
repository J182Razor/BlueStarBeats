import React, { useCallback } from 'react';

interface AudioControlPanelProps {
  isPlaying: boolean;
  volume: number;
  onPlay: () => void;
  onStop: () => void;
  onVolumeChange: (volume: number) => void;
}

export const AudioControlPanel: React.FC<AudioControlPanelProps> = React.memo(({
  isPlaying,
  volume,
  onPlay,
  onStop,
  onVolumeChange
}) => {
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    onVolumeChange(newVolume);
  }, [onVolumeChange]);

  const volumePercentage = volume * 100;

  return (
    <div className="space-y-8">
      {/* Play/Stop Button */}
      <div className="flex justify-center">
        <button
          onClick={isPlaying ? onStop : onPlay}
          className={`
            w-24 h-24 rounded-full border-0 font-bold text-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-400/50 shadow-2xl
            ${isPlaying 
              ? 'bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700' 
              : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
            }
          `}
        >
          {isPlaying ? (
            <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" rx="2" />
              <rect x="14" y="4" width="4" height="16" rx="2" />
            </svg>
          ) : (
            <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <polygon points="8,5 19,12 8,19" />
            </svg>
          )}
        </button>
      </div>

      {/* Volume Control */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <label className="text-lg font-medium text-white">
            Volume
          </label>
          <span className="text-white/80 text-lg font-medium min-w-[3rem]">
            {Math.round(volumePercentage)}%
          </span>
        </div>
        
        <div className="relative">
          {/* Volume slider track background */}
          <div className="h-3 bg-gradient-to-r from-green-500/30 to-blue-500/30 rounded-full relative overflow-hidden">
            {/* Volume slider fill */}
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-200"
              style={{ width: `${volumePercentage}%` }}
            />
          </div>
          
          {/* Custom volume slider input */}
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="absolute inset-0 w-full h-3 opacity-0 cursor-pointer"
          />
          
          {/* Custom volume slider thumb */}
          <div 
            className="absolute top-1/2 w-6 h-6 bg-gradient-to-br from-green-400 to-blue-400 rounded-full border-3 border-white shadow-lg transform -translate-y-1/2 -translate-x-1/2 pointer-events-none transition-all duration-200 hover:scale-110"
            style={{ left: `${volumePercentage}%` }}
          />
        </div>
        
        <div className="flex justify-between text-sm text-white/60">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="flex items-center justify-center space-x-3">
        <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
          isPlaying ? 'bg-green-400 animate-pulse' : 'bg-gray-500'
        }`} />
        <span className="text-white/80 text-sm font-medium">
          {isPlaying ? 'Playing' : 'Stopped'}
        </span>
      </div>
    </div>
  );
});

