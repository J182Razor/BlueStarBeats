import React, { useEffect, useState } from 'react';

interface SessionTimerProps {
  duration: number; // in seconds
  isPlaying: boolean;
  onComplete: () => void;
}

const SessionTimer: React.FC<SessionTimerProps> = ({ duration, isPlaying, onComplete }) => {
  const [timeRemaining, setTimeRemaining] = useState(duration);

  useEffect(() => {
    setTimeRemaining(duration);
  }, [duration]);

  useEffect(() => {
    if (!isPlaying || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, timeRemaining, onComplete]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (timeRemaining / duration) * 100 : 0;
  const elapsed = duration - timeRemaining;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <label className="text-xl font-bold text-white flex items-center gap-2">
          <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full" />
          Session Time
        </label>
        <div className="flex items-center gap-3">
          {/* Time Display with Glow */}
          <div className="
            px-6 py-3
            bg-gradient-to-br from-purple-600/20 to-blue-600/20
            backdrop-blur-sm
            rounded-xl
            border border-purple-500/30
            shadow-lg
          ">
            <span className="text-3xl font-extrabold text-gradient-gold tabular-nums">
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>
      </div>
      
      {/* Premium Progress Bar */}
      <div className="relative">
        {/* Background track */}
        <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden">
          {/* Progress gradient */}
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 transition-all duration-1000 ease-linear rounded-full"
            style={{ width: `${progress}%` }}
          >
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>
          
          {/* Progress percentage indicator */}
          {progress > 5 && (
            <div 
              className="absolute top-1/2 -translate-y-1/2 text-xs font-bold text-white transition-all duration-1000"
              style={{ left: `calc(${progress}% - 20px)` }}
            >
              {Math.round(progress)}%
            </div>
          )}
        </div>
        
        {/* Progress markers */}
        <div className="flex justify-between mt-2">
          {[0, 25, 50, 75, 100].map((mark) => (
            <div key={mark} className="flex flex-col items-center gap-1">
              <div className={`
                w-1 h-2 rounded-full transition-all duration-300
                ${progress <= mark ? 'bg-gray-600' : 'bg-purple-400'}
              `} />
              <span className="text-xs text-gray-500">{mark}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Status and Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`
            w-3 h-3 rounded-full transition-all duration-300
            ${isPlaying ? 'bg-green-400 animate-pulse shadow-lg shadow-green-400/50' : 'bg-gray-500'}
          `} />
          <span className={`
            font-semibold text-sm transition-colors duration-300
            ${isPlaying ? 'text-green-400' : 'text-gray-400'}
          `}>
            {isPlaying ? 'Session in progress...' : 'Ready to start'}
          </span>
        </div>
        
        {/* Elapsed time */}
        {isPlaying && (
          <div className="text-sm text-gray-400">
            Elapsed: <span className="font-semibold text-gray-300">{formatTime(elapsed)}</span>
          </div>
        )}
      </div>

      {/* Time remaining indicator */}
      {timeRemaining < 60 && timeRemaining > 0 && (
        <div className="
          p-4 rounded-xl
          bg-gradient-to-br from-orange-900/30 to-red-900/30
          border border-orange-500/30
          backdrop-blur-sm
          animate-pulse
        ">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
            <p className="text-sm text-orange-200">
              <span className="font-semibold">Less than a minute remaining!</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionTimer;
