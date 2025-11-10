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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="text-lg font-semibold text-white">Session Time</label>
        <span className="text-brand-golden font-bold text-lg">
          {formatTime(timeRemaining)}
        </span>
      </div>
      
      {/* Progress Bar */}
      <div className="relative h-3 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-blue to-brand-golden transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="text-center text-sm text-gray-400">
        {isPlaying ? 'Session in progress...' : 'Ready to start'}
      </div>
    </div>
  );
};

export default SessionTimer;

