import React, { useRef, useEffect, useCallback } from 'react';
import { HighQualityAudioEngine } from '../lib/audioEngine';

interface OscilloscopeProps {
  audioEngine: HighQualityAudioEngine;
  isPlaying: boolean;
}

export const Oscilloscope: React.FC<OscilloscopeProps> = React.memo(({
  audioEngine,
  isPlaying
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas with dark background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 4]);

    // Vertical grid lines
    for (let x = 0; x <= width; x += width / 8) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal grid lines
    for (let y = 0; y <= height; y += height / 4) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.setLineDash([]);

    if (isPlaying) {
      // Get audio data
      const dataArray = audioEngine.getAnalyserData();
      
      if (dataArray.length > 0) {
        // Draw waveform
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#3b82f6';
        ctx.shadowColor = '#3b82f6';
        ctx.shadowBlur = 10;

        ctx.beginPath();
        
        const sliceWidth = width / dataArray.length;
        let x = 0;

        for (let i = 0; i < dataArray.length; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        ctx.stroke();
        ctx.shadowBlur = 0;

        // Add glow effect
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
        ctx.lineWidth = 6;
        ctx.stroke();

        ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
        ctx.lineWidth = 10;
        ctx.stroke();
      }
    } else {
      // Draw static waveform when not playing
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      const centerY = height / 2;
      const amplitude = height * 0.2;
      
      for (let x = 0; x < width; x++) {
        const y = centerY + Math.sin((x / width) * Math.PI * 4) * amplitude;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();
    }

    // Draw center line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [audioEngine, isPlaying]);

  const animate = useCallback(() => {
    draw();
    animationRef.current = requestAnimationFrame(animate);
  }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    // Start animation
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="w-full h-48 rounded-3xl border-0 bg-gradient-to-br from-slate-900/50 to-blue-900/30 shadow-inner"
        style={{ width: '100%', height: '12rem' }}
      />
      
      {/* Status overlay */}
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md rounded-full px-4 py-2 border-0">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            isPlaying ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
          }`} />
          <span className="text-white text-xs font-medium">
            {isPlaying ? 'Live Waveform' : 'Preview'}
          </span>
        </div>
      </div>

      {/* Frequency indicators */}
      <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md rounded-full px-4 py-2 border-0">
        <span className="text-white text-xs font-medium">
          {isPlaying ? 'Active' : 'Standby'}
        </span>
      </div>
    </div>
  );
});

