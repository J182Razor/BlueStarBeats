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

  const progress = duration > 0 ? ((duration - timeRemaining) / duration) * 100 : 0;
  const elapsed = duration - timeRemaining;

  return (
    <div className="space-y-2 animate-fade-in">
      {/* Compact Time Display - Elapsed / Total */}
      <div className="text-center">
        <span className="text-lg font-semibold text-gray-300 tabular-nums">
          {formatTime(elapsed)} / {formatTime(duration)}
        </span>
      </div>
      
      {/* Compact Progress Bar */}
      <div className="relative">
        <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000 ease-linear rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default SessionTimer;
