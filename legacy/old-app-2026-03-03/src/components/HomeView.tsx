import React, { useState, useEffect, useRef } from 'react';
import { useAppState } from '../hooks/useAppState';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

const HomeView: React.FC = () => {
  const {
    isPlaying,
    currentSession,
    settings,
    togglePlayback,
    updateSettings,
    audioEngine,
    handleSessionComplete,
    setActiveTab
  } = useAppState();

  const [timeRemaining, setTimeRemaining] = useState(0);
  const [progress, setProgress] = useState(0);
  const animationRef = useRef<number>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isIOS = Capacitor.getPlatform() === 'ios';

  // Session timer
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/54a371b5-26d0-4fda-a7dc-6c2519cd2d1c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HomeView.tsx:25',message:'Timer effect started',data:{isPlaying,hasSession:!!currentSession},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    if (isPlaying && currentSession) {
      const startTime = Date.now();
      const duration = (currentSession.lengths[0] || 30) * 60 * 1000;

      const updateTimer = () => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, duration - elapsed);
        const seconds = Math.floor(remaining / 1000);
        setTimeRemaining(seconds);
        setProgress((elapsed / duration) * 100);

        if (remaining > 0) {
          animationRef.current = requestAnimationFrame(updateTimer);
        } else {
          handleSessionComplete();
        }
      };

      animationRef.current = requestAnimationFrame(updateTimer);
    } else {
      setTimeRemaining(0);
      setProgress(0);
    }

    return () => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/54a371b5-26d0-4fda-a7dc-6c2519cd2d1c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HomeView.tsx:50',message:'Timer cleanup',data:{hasAnimationRef:!!animationRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, currentSession, handleSessionComplete]);

  // Audio visualization
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/54a371b5-26d0-4fda-a7dc-6c2519cd2d1c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HomeView.tsx:58',message:'Visualization effect started',data:{isPlaying,hasCanvas:!!canvasRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    if (!isPlaying || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    const draw = () => {
      if (!isPlaying || !ctx) return;

      const data = audioEngine.getAnalyserData();
      if (!data || data.length === 0) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      // Clear canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);

      // Draw waveform
      ctx.strokeStyle = '#a78bfa';
      ctx.lineWidth = 2;
      ctx.beginPath();

      const sliceWidth = width / data.length;
      const centerY = height / 2;
      let x = 0;

      for (let i = 0; i < data.length; i++) {
        const v = data[i] / 128.0;
        const y = v * height * 0.3 + centerY;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.stroke();
      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/54a371b5-26d0-4fda-a7dc-6c2519cd2d1c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HomeView.tsx:115',message:'Visualization cleanup',data:{hasAnimationRef:!!animationRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, audioEngine]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = async () => {
    await togglePlayback();
    if (isIOS) {
      Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    updateSettings({ ...settings, volume });
    if (isIOS) {
      Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
    }
  };

  const quickStartGoals = [
    { goal: 'sleep' as const, emoji: '😴', label: 'Sleep', color: 'from-indigo-500 to-purple-600' },
    { goal: 'focus' as const, emoji: '🧠', label: 'Focus', color: 'from-blue-500 to-cyan-600' },
    { goal: 'meditation' as const, emoji: '🧘', label: 'Meditate', color: 'from-purple-500 to-pink-600' },
    { goal: 'anxiety' as const, emoji: '😌', label: 'Relax', color: 'from-teal-500 to-emerald-600' }
  ];

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-900 p-4 sm:p-6 safe-area-inset">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Blue Star Beats</h1>
        <p className="text-purple-200 text-sm sm:text-base">Precision Brainwave Entrainment</p>
      </div>

      {/* Quick Start Cards */}
      {!currentSession && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {quickStartGoals.map((item) => (
            <button
              key={item.goal}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/20 active:scale-95 transition-transform"
              onClick={() => {
                if (isIOS) {
                  Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
                }
                setActiveTab('sessions');
              }}
            >
              <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r ${item.color} rounded-xl mb-3 flex items-center justify-center text-2xl sm:text-3xl`}>
                {item.emoji}
              </div>
              <h3 className="text-white font-semibold text-sm sm:text-base">{item.label}</h3>
            </button>
          ))}
        </div>
      )}

      {/* Now Playing Section */}
      {currentSession && (
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 sm:p-6 border border-white/20 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">{currentSession.name}</h2>
              <p className="text-purple-200 text-sm">{currentSession.description}</p>
            </div>
            <div className="text-right ml-4">
              <div className="text-2xl sm:text-3xl font-bold text-white">{formatTime(timeRemaining)}</div>
              <div className="text-xs sm:text-sm text-purple-200">remaining</div>
            </div>
          </div>

          {/* Visualization */}
          <div className="h-24 sm:h-32 mb-4 sm:mb-6 rounded-xl bg-black/20 overflow-hidden relative">
            <canvas
              ref={canvasRef}
              className="w-full h-full"
              style={{ width: '100%', height: '100%' }}
            />
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 animate-pulse opacity-50"></div>
              </div>
            )}
          </div>

          {/* Progress Circle */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="relative w-24 h-24 sm:w-32 sm:h-32">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="283"
                  strokeDashoffset={283 - (283 * progress) / 100}
                  transform="rotate(-90 50 50)"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-base sm:text-lg font-bold">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <button
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
              onClick={handlePlayPause}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-sm"></div>
              ) : (
                <div className="w-0 h-0 border-l-[6px] sm:border-l-[8px] border-l-white border-y-[4px] sm:border-y-[6px] border-y-transparent ml-1"></div>
              )}
            </button>

            <div className="flex-1 mx-4">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={settings.volume}
                onChange={handleVolumeChange}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            <div className="text-white font-medium text-sm sm:text-base min-w-[3rem] text-right">
              {Math.round(settings.volume * 100)}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeView;

