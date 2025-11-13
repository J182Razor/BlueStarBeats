import React, { useRef, useEffect, useCallback } from 'react';
import { AudioEngine } from '../lib/audioEngine';

interface OscilloscopeProps {
  audioEngine: AudioEngine;
  isPlaying: boolean;
}

const Oscilloscope: React.FC<OscilloscopeProps> = ({
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

    // Clear canvas with premium dark background
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);

    // Draw premium grid lines with gradient
    const gridGradient = ctx.createLinearGradient(0, 0, width, height);
    gridGradient.addColorStop(0, 'rgba(140, 82, 255, 0.15)');
    gridGradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.15)');
    gridGradient.addColorStop(1, 'rgba(0, 194, 203, 0.15)');
    
    ctx.strokeStyle = gridGradient;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 6]);

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

    if (isPlaying && audioEngine) {
      // Get actual audio data from the engine
      const dataArray = audioEngine.getAnalyserData();
      
      if (dataArray.length > 0) {
        const centerY = height / 2;
        const sliceWidth = width / dataArray.length;

        // Create premium gradient for waveform
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#DAA520');
        gradient.addColorStop(0.33, '#8C52FF');
        gradient.addColorStop(0.66, '#3B82F6');
        gradient.addColorStop(1, '#00C2CB');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = '#8C52FF';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        ctx.beginPath();
        let x = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const v = dataArray[i] / 128.0;
          const y = v * height * 0.35 + centerY;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        ctx.stroke();
        
        // Add glow effect
        ctx.shadowBlur = 25;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    } else {
      // Draw static preview waveform with animation
      const time = Date.now() * 0.001;
      ctx.strokeStyle = 'rgba(140, 82, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.shadowColor = 'rgba(140, 82, 255, 0.3)';
      ctx.shadowBlur = 10;

      const centerY = height / 2;
      const amplitude = height * 0.25;
      
      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const frequency = (x / width) * Math.PI * 4;
        const y = centerY + Math.sin(frequency + time) * amplitude;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Draw center line with gradient
    const centerGradient = ctx.createLinearGradient(0, 0, width, 0);
    centerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    centerGradient.addColorStop(0.5, 'rgba(140, 82, 255, 0.3)');
    centerGradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
    
    ctx.strokeStyle = centerGradient;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [isPlaying, audioEngine]);

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
    <div className="waveform-container relative animate-fade-in">
      <canvas
        ref={canvasRef}
        className="w-full h-64 rounded-xl"
        style={{ width: '100%', height: '16rem' }}
      />
      
      {/* Premium Status overlay - Enhanced */}
      <div className="absolute top-4 left-4 glass rounded-full px-5 py-2.5 animate-slide-up">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className={`
              w-3 h-3 rounded-full
              ${isPlaying ? 'bg-green-400' : 'bg-gray-400'}
              ${isPlaying ? 'animate-pulse' : ''}
            `} />
            {isPlaying && (
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-400 animate-ping opacity-75" />
            )}
          </div>
          <span className="text-white text-sm font-semibold">
            {isPlaying ? 'Live Waveform' : 'Preview'}
          </span>
        </div>
      </div>

      {/* Status indicator - Enhanced */}
      <div className="absolute top-4 right-4 glass rounded-full px-5 py-2.5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <span className="text-white text-sm font-semibold flex items-center gap-2">
          {isPlaying ? (
            <>
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Active
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              Standby
            </>
          )}
        </span>
      </div>

      {/* Audio Engine Status - Enhanced */}
      {isPlaying && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="glass rounded-full px-6 py-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-purple-300 text-sm font-semibold">
                Audio Engine Active
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Frequency info overlay */}
      <div className="absolute bottom-4 right-4 glass rounded-lg px-4 py-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <div className="text-xs text-gray-400">
          <div className="font-semibold text-white mb-1">Real-time Visualization</div>
          <div>Frequency analysis</div>
        </div>
      </div>
    </div>
  );
};

export default Oscilloscope;
