import React, { useRef, useEffect, useCallback } from 'react';
import { AudioEngine } from '../lib/audioEngine';

interface OscilloscopeProps {
  audioEngine: AudioEngine;
  isPlaying: boolean;
}

const Oscilloscope: React.FC<OscilloscopeProps> = ({
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
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Draw premium grid lines
    ctx.strokeStyle = 'rgba(218, 165, 32, 0.2)';
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
      // Draw animated premium waveform
      const time = Date.now() * 0.005;
      const centerY = height / 2;
      const amplitude = height * 0.3;

      // Create premium gradient
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, '#DAA520');
      gradient.addColorStop(0.5, '#3B82F6');
      gradient.addColorStop(1, '#FF69B4');

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.shadowColor = '#DAA520';
      ctx.shadowBlur = 15;

      ctx.beginPath();
      for (let x = 0; x < width; x += 2) {
        const y = centerY + Math.sin((x / width) * Math.PI * 6 + time) * amplitude * Math.sin(time * 0.3);
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Add secondary harmonic with blue color
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      for (let x = 0; x < width; x += 2) {
        const y = centerY + Math.sin((x / width) * Math.PI * 12 + time * 1.5) * amplitude * 0.4;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      ctx.shadowBlur = 0;
    } else {
      // Draw static preview waveform
      ctx.strokeStyle = 'rgba(156, 163, 175, 0.5)';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';

      const centerY = height / 2;
      const amplitude = height * 0.2;
      
      ctx.beginPath();
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
  }, [isPlaying]);

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
    <div className="waveform-container relative">
      <canvas
        ref={canvasRef}
        className="w-full h-48 rounded-lg"
        style={{ width: '100%', height: '12rem' }}
      />
      
      {/* Premium Status overlay */}
      <div className="absolute top-4 left-4 bg-black/30 backdrop-blur-sm rounded-full px-4 py-2">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            isPlaying ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
          }`} />
          <span className="text-white text-sm font-medium">
            {isPlaying ? 'Live Waveform' : 'Preview'}
          </span>
        </div>
      </div>

      {/* Status indicator */}
      <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm rounded-full px-4 py-2">
        <span className="text-white text-sm font-medium">
          {isPlaying ? 'Active' : 'Standby'}
        </span>
      </div>

      {/* Audio Engine Status */}
      {isPlaying && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-black/30 backdrop-blur-sm rounded-full px-4 py-2">
            <span className="text-brand-golden text-sm font-medium">
              Audio Engine Active
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Oscilloscope;
