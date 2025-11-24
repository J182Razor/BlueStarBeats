import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { AudioSettings } from './types';

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

export class IOSAudioEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private leftOscillator: OscillatorNode | null = null;
  private rightOscillator: OscillatorNode | null = null;
  private isoOscillator: OscillatorNode | null = null;
  private isoGain: GainNode | null = null;
  private isoAnimationFrameId: number | null = null;
  private isIOS = Capacitor.getPlatform() === 'ios';
  private isInitialized = false;
  private isPlaying = false;
  private currentSettings: AudioSettings | null = null;

  // iOS-specific properties
  private interruptionListener: (() => void) | null = null;

  constructor() {
    this.setupIOSAudioSession();
  }

  private async setupIOSAudioSession(): Promise<void> {
    if (!this.isIOS) return;

    try {
      // Configure iOS audio session
      if ('webkitAudioContext' in window) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext({
          latencyHint: 'playback'
        });
      }

      // Set up interruption handlers
      this.setupInterruptionHandlers();

      // Resume context on first interaction
      this.setupResumeHandler();

      this.isInitialized = true;
    } catch (error) {
      console.error('iOS Audio Engine initialization failed:', error);
      throw error;
    }
  }

  private setupInterruptionHandlers(): void {
    if (!this.isIOS) return;

    // Handle phone calls, Siri, etc.
    const handleVisibilityChange = () => {
      if (document.hidden && this.isPlaying) {
        this.pause();
      } else if (!document.hidden && this.isPlaying && this.currentSettings) {
        setTimeout(() => this.start(this.currentSettings!), 100);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    this.interruptionListener = handleVisibilityChange;
  }

  private setupResumeHandler(): void {
    const resumeContext = async () => {
      if (this.audioContext?.state === 'suspended') {
        try {
          await this.audioContext.resume();
        } catch (error) {
          console.warn('Failed to resume audio context:', error);
        }
      }
      document.removeEventListener('touchstart', resumeContext);
      document.removeEventListener('click', resumeContext);
    };

    document.addEventListener('touchstart', resumeContext, { once: true });
    document.addEventListener('click', resumeContext, { once: true });
  }

  async initialize(settings: AudioSettings): Promise<void> {
    if (!this.isInitialized) {
      await this.setupIOSAudioSession();
    }

    if (!this.audioContext) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext({
        latencyHint: 'playback'
      });
    }

    // Create audio nodes
    this.masterGain = this.audioContext.createGain();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;

    // Create filters for quality
    const highPassFilter = this.audioContext.createBiquadFilter();
    highPassFilter.type = 'highpass';
    highPassFilter.frequency.setValueAtTime(20, this.audioContext.currentTime);

    const lowPassFilter = this.audioContext.createBiquadFilter();
    lowPassFilter.type = 'lowpass';
    lowPassFilter.frequency.setValueAtTime(18000, this.audioContext.currentTime);

    // Connect nodes
    this.masterGain.connect(highPassFilter);
    highPassFilter.connect(lowPassFilter);
    lowPassFilter.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);

    // Apply initial settings
    this.updateSettings(settings);
  }

  async start(settings: AudioSettings): Promise<void> {
    if (!this.audioContext || !this.masterGain) {
      await this.initialize(settings);
    }

    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }

    // Store current settings
    this.currentSettings = settings;

    // Clean up any existing nodes
    this.cleanup();

    if (settings.mode === 'binaural') {
      this.setupBinauralBeats(settings);
    } else {
      this.setupIsochronicTones(settings);
    }

    this.isPlaying = true;

    // Haptic feedback
    if (this.isIOS) {
      Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
    }
  }

  private setupBinauralBeats(settings: AudioSettings): void {
    if (!this.audioContext || !this.masterGain) return;

    const leftOsc = this.audioContext.createOscillator();
    const rightOsc = this.audioContext.createOscillator();
    const leftGain = this.audioContext.createGain();
    const rightGain = this.audioContext.createGain();

    // Create stereo panners
    let leftPanner: StereoPannerNode | PannerNode;
    let rightPanner: StereoPannerNode | PannerNode;

    if (this.audioContext.createStereoPanner) {
      leftPanner = this.audioContext.createStereoPanner();
      rightPanner = this.audioContext.createStereoPanner();
      (leftPanner as StereoPannerNode).pan.setValueAtTime(-1, this.audioContext.currentTime);
      (rightPanner as StereoPannerNode).pan.setValueAtTime(1, this.audioContext.currentTime);
    } else {
      leftPanner = this.audioContext.createPanner();
      rightPanner = this.audioContext.createPanner();
      (leftPanner as PannerNode).panningModel = 'equalpower';
      (rightPanner as PannerNode).panningModel = 'equalpower';
      (leftPanner as PannerNode).setPosition(-1, 0, 0);
      (rightPanner as PannerNode).setPosition(1, 0, 0);
    }

    leftOsc.type = settings.waveform;
    rightOsc.type = settings.waveform;

    const gainMultiplier = this.getWaveformGainMultiplier(settings.waveform);
    const baseGain = 0.3 * gainMultiplier;

    leftOsc.frequency.setValueAtTime(
      settings.carrierFrequency,
      this.audioContext.currentTime
    );

    rightOsc.frequency.setValueAtTime(
      settings.carrierFrequency + settings.beatFrequency,
      this.audioContext.currentTime
    );

    leftGain.gain.setValueAtTime(baseGain, this.audioContext.currentTime);
    rightGain.gain.setValueAtTime(baseGain, this.audioContext.currentTime);

    leftOsc.connect(leftGain);
    rightOsc.connect(rightGain);
    leftGain.connect(leftPanner);
    rightGain.connect(rightPanner);
    leftPanner.connect(this.masterGain);
    rightPanner.connect(this.masterGain);

    leftOsc.start();
    rightOsc.start();

    this.leftOscillator = leftOsc;
    this.rightOscillator = rightOsc;
  }

  private setupIsochronicTones(settings: AudioSettings): void {
    if (!this.audioContext || !this.masterGain) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = settings.waveform;
    osc.frequency.setValueAtTime(settings.carrierFrequency, this.audioContext.currentTime);

    const gainMultiplier = this.getWaveformGainMultiplier(settings.waveform);
    const baseGain = 0.5 * gainMultiplier;
    const minGain = 0.15 * gainMultiplier;

    gain.gain.setValueAtTime(baseGain, this.audioContext.currentTime);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();

    this.isoOscillator = osc;
    this.isoGain = gain;

    // Start LFO modulation
    this.modulateIsochronic(settings.beatFrequency, baseGain, minGain);
  }

  private modulateIsochronic(beatFrequency: number, baseGain: number, minGain: number): void {
    if (!this.audioContext || !this.isoGain) return;

    const modulationRange = baseGain - minGain;

    const modulate = () => {
      if (!this.isPlaying || !this.isoGain) {
        this.isoAnimationFrameId = null;
        return;
      }

      const now = this.audioContext!.currentTime;
      const lfoValue = Math.sin(now * beatFrequency * 2 * Math.PI);
      const normalizedLFO = (lfoValue + 1) / 2;
      const modulatedGain = minGain + (normalizedLFO * modulationRange);

      this.isoGain.gain.setTargetAtTime(modulatedGain, now, 0.005);

      this.isoAnimationFrameId = requestAnimationFrame(modulate);
    };

    this.isoAnimationFrameId = requestAnimationFrame(modulate);
  }

  private getWaveformGainMultiplier(waveform: string): number {
    switch (waveform) {
      case 'sine':
        return 0.8;
      case 'triangle':
        return 0.6;
      case 'square':
        return 0.35;
      case 'sawtooth':
        return 0.35;
      default:
        return 0.8;
    }
  }

  pause(): void {
    this.isPlaying = false;
    this.cleanup();
    
    if (this.isIOS) {
      Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
    }
  }

  resume(): void {
    if (this.isPlaying || !this.currentSettings) return;
    this.start(this.currentSettings);
  }

  updateSettings(settings: Partial<AudioSettings>): void {
    if (!this.masterGain || !this.currentSettings) return;

    const newSettings = { ...this.currentSettings, ...settings };
    this.currentSettings = newSettings;

    // Update volume
    if (settings.volume !== undefined && this.masterGain) {
      const safeVolume = Math.max(0, Math.min(1, settings.volume));
      this.masterGain.gain.setTargetAtTime(
        safeVolume,
        this.audioContext?.currentTime || 0,
        0.05
      );
    }

    // If playing, restart with new settings
    if (this.isPlaying && (settings.mode !== undefined || settings.waveform !== undefined || 
        settings.carrierFrequency !== undefined || settings.beatFrequency !== undefined)) {
      this.pause();
      setTimeout(() => {
        if (this.currentSettings) {
          this.start(this.currentSettings);
        }
      }, 50);
    }
  }

  getAnalyserData(): Uint8Array | null {
    if (!this.analyser) return null;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(dataArray);
    return dataArray;
  }

  getFrequencyData(): Uint8Array | null {
    if (!this.analyser) return null;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  private cleanup(): void {
    // Cancel animation frame
    if (this.isoAnimationFrameId !== null) {
      cancelAnimationFrame(this.isoAnimationFrameId);
      this.isoAnimationFrameId = null;
    }

    // Clean up oscillators
    if (this.leftOscillator) {
      try {
        this.leftOscillator.stop();
        this.leftOscillator.disconnect();
      } catch (e) {
        // Ignore errors
      }
      this.leftOscillator = null;
    }

    if (this.rightOscillator) {
      try {
        this.rightOscillator.stop();
        this.rightOscillator.disconnect();
      } catch (e) {
        // Ignore errors
      }
      this.rightOscillator = null;
    }

    if (this.isoOscillator) {
      try {
        this.isoOscillator.stop();
        this.isoOscillator.disconnect();
      } catch (e) {
        // Ignore errors
      }
      this.isoOscillator = null;
    }

    if (this.isoGain) {
      try {
        this.isoGain.disconnect();
      } catch (e) {
        // Ignore errors
      }
      this.isoGain = null;
    }
  }

  destroy(): void {
    this.isPlaying = false;
    this.cleanup();

    if (this.analyser) {
      try {
        this.analyser.disconnect();
      } catch (e) {
        // Ignore errors
      }
      this.analyser = null;
    }

    if (this.masterGain) {
      try {
        this.masterGain.disconnect();
      } catch (e) {
        // Ignore errors
      }
      this.masterGain = null;
    }

    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch (e) {
        // Ignore errors
      }
      this.audioContext = null;
    }

    // Remove event listeners
    if (this.interruptionListener) {
      document.removeEventListener('visibilitychange', this.interruptionListener);
    }
  }
}

