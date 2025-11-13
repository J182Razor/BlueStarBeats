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
    <div className="space-y-8 animate-fade-in">
      {/* Play/Pause Button - Premium Design */}
      <div className="flex justify-center">
        <button
          onClick={isPlaying ? onStop : onPlay}
          className={`
            relative w-24 h-24 rounded-full
            flex items-center justify-center
            transition-all duration-300 ease-out
            transform hover:scale-110 active:scale-95
            ${isPlaying 
              ? 'bg-gradient-to-br from-red-500 to-red-700 shadow-[0_0_40px_rgba(239,68,68,0.5)]' 
              : 'bg-gradient-to-br from-blue-500 via-purple-600 to-blue-700 shadow-[0_0_40px_rgba(140,82,255,0.5)]'
            }
            group
          `}
          aria-label={isPlaying ? 'Stop audio' : 'Play audio'}
        >
          {/* Ripple effect */}
          <div className={`
            absolute inset-0 rounded-full
            ${isPlaying ? 'bg-red-400' : 'bg-blue-400'}
            opacity-0 group-hover:opacity-20
            transition-opacity duration-300
            animate-pulse
          `} />
          
          {/* Icon */}
          <div className="relative z-10 text-white">
            {isPlaying ? (
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg className="w-10 h-10 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <polygon points="8,5 19,12 8,19" />
              </svg>
            )}
          </div>
          
          {/* Glow ring */}
          <div className={`
            absolute inset-0 rounded-full border-2
            ${isPlaying ? 'border-red-300' : 'border-blue-300'}
            opacity-0 group-hover:opacity-100
            transition-opacity duration-300
          `} />
        </button>
      </div>

      {/* Volume Control - Premium Design */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-lg font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
            Volume
          </label>
          <div className="flex items-center gap-2">
            <span className="text-purple-400 font-bold text-lg tabular-nums">
              {Math.round(volume * 100)}
            </span>
            <span className="text-gray-400 text-sm">%</span>
          </div>
        </div>
        
        {/* Premium Volume Slider */}
        <div className="relative">
          <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
            {/* Background gradient */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 rounded-full transition-all duration-300"
              style={{ width: `${volume * 100}%` }}
            />
            
            {/* Slider track */}
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="
                absolute inset-0 w-full h-full
                appearance-none cursor-pointer
                bg-transparent
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-5
                [&::-webkit-slider-thumb]:h-5
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-white
                [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(140,82,255,0.8)]
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:transition-all
                [&::-webkit-slider-thumb]:duration-200
                [&::-webkit-slider-thumb]:hover:scale-125
                [&::-moz-range-thumb]:w-5
                [&::-moz-range-thumb]:h-5
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-white
                [&::-moz-range-thumb]:border-none
                [&::-moz-range-thumb]:shadow-[0_0_10px_rgba(140,82,255,0.8)]
                [&::-moz-range-thumb]:cursor-pointer
              "
            />
          </div>
          
          {/* Volume markers */}
          <div className="flex justify-between mt-2">
            <div className="flex gap-1">
              {[0, 25, 50, 75, 100].map((mark) => (
                <div
                  key={mark}
                  className={`
                    h-1 w-0.5 rounded-full
                    ${volume * 100 >= mark ? 'bg-purple-400' : 'bg-gray-600'}
                    transition-colors duration-200
                  `}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Volume labels */}
        <div className="flex justify-between text-xs text-gray-400">
          <span>Mute</span>
          <span>Max</span>
        </div>
      </div>

      {/* Status Indicator - Premium Design */}
      <div className="flex justify-center">
        <div className="
          inline-flex items-center gap-3
          px-6 py-3
          bg-gradient-to-r from-gray-800/50 to-gray-900/50
          backdrop-blur-md
          rounded-full
          border border-gray-700/50
        ">
          <div className="relative">
            <div className={`
              w-3 h-3 rounded-full
              ${isPlaying ? 'bg-green-400' : 'bg-gray-500'}
              ${isPlaying ? 'animate-pulse' : ''}
            `} />
            {isPlaying && (
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-400 animate-ping opacity-75" />
            )}
          </div>
          <span className={`
            font-semibold text-sm
            ${isPlaying ? 'text-green-400' : 'text-gray-400'}
            transition-colors duration-300
          `}>
            {isPlaying ? 'Playing' : 'Stopped'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AudioControlPanel;
