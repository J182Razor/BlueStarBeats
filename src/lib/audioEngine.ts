import { Capacitor } from '@capacitor/core';
import { IOSAudioManager } from './iosAudioManager';

export type WaveformType = 'sine' | 'square' | 'triangle' | 'sawtooth';
export type AudioMode = 'binaural' | 'isochronic';

export interface AudioSettings {
  carrierFrequency: number;
  beatFrequency: number;
  waveform: WaveformType;
  mode: AudioMode;
  volume: number;
}

interface ScheduledEvent {
  type: 'frequency' | 'gain' | 'volume';
  value: number;
  time: number;
}

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private leftOscillator: OscillatorNode | null = null;
  private rightOscillator: OscillatorNode | null = null;
  private leftGain: GainNode | null = null;
  private rightGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private lowPassFilter: BiquadFilterNode | null = null;
  private highPassFilter: BiquadFilterNode | null = null;
  private analyser: AnalyserNode | null = null;
  private isPlaying = false;
  private wasPlayingBeforeInterruption = false;
  private settings: AudioSettings = {
    carrierFrequency: 440,
    beatFrequency: 10,
    waveform: 'sine',
    mode: 'binaural',
    volume: 0.3
  };

  // Isochronic tone specific nodes
  private isoOscillator: OscillatorNode | null = null;
  private isoGain: GainNode | null = null;
  private isoLFO: OscillatorNode | null = null;
  private isoLFOGain: GainNode | null = null;
  private isoAnimationFrameId: number | null = null;

  // iOS Audio Manager
  private iosAudioManager: IOSAudioManager;
  private isIOSInitialized = false;

  // Web Audio API scheduling
  private scheduledEvents: Map<number, ScheduledEvent> = new Map();

  constructor() {
    this.iosAudioManager = IOSAudioManager.getInstance();
    this.initializeForIOS();
    this.setupEventListeners();
  }

  private async initializeForIOS(): Promise<void> {
    if (Capacitor.getPlatform() === 'ios') {
      try {
        await this.iosAudioManager.initializeIOSAudio();
        this.isIOSInitialized = true;
        console.log('iOS audio successfully initialized');
      } catch (error) {
        console.error('Failed to initialize iOS audio:', error);
        // Fallback to standard Web Audio API
      }
    }
  }

  private setupEventListeners(): void {
    // Handle iOS-specific audio lifecycle events
    window.addEventListener('audioInterruption', ((event: CustomEvent) => {
      switch (event.detail.type) {
        case 'begin':
          this.handleAudioInterruptionBegin();
          break;
        case 'end':
          this.handleAudioInterruptionEnd();
          break;
      }
    }) as EventListener);
  }

  private handleAudioInterruptionBegin(): void {
    // Pause audio generation but maintain state
    if (this.isPlaying) {
      this.wasPlayingBeforeInterruption = true;
      this.stop(); // Stop audio generation
    }
  }

  private async handleAudioInterruptionEnd(): Promise<void> {
    // Resume audio if it was playing before interruption
    if (this.wasPlayingBeforeInterruption) {
      // Small delay to ensure system is ready
      setTimeout(async () => {
        try {
          await this.start();
          this.wasPlayingBeforeInterruption = false;
        } catch (error) {
          console.error('Failed to resume after interruption:', error);
        }
      }, 300);
    }
  }

  async initialize(): Promise<void> {
    // Wait for iOS audio setup if needed
    if (Capacitor.getPlatform() === 'ios' && !this.isIOSInitialized) {
      await this.initializeForIOS();
    }

    // If already initialized, just ensure it's running
    if (this.audioContext) {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      return;
    }

    try {
      // Use iOS audio context if available, otherwise create new one
      const iosContext = this.iosAudioManager.getAudioContext();
      if (iosContext && Capacitor.getPlatform() === 'ios') {
        this.audioContext = iosContext;
      } else {
        // Create high-quality audio context
        // Removed explicit sampleRate to allow system default (avoids initialization errors on some devices)
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioContext({
          latencyHint: 'playback' // Use 'playback' for better background audio support
        });
      }

      // Resume context immediately if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // iOS-specific context management
      if (Capacitor.getPlatform() === 'ios') {
        // Ensure context resumes properly
        const resumeContext = async () => {
          if (this.audioContext?.state === 'suspended') {
            await this.audioContext.resume();
          }
        };

        // Listen for our custom interruption events
        window.addEventListener('audioInterruption', ((event: CustomEvent) => {
          if (event.detail.type === 'end') {
            resumeContext();
          }
        }) as EventListener);
      }

      // Set up event listeners for audio context state changes
      this.setupAudioContextListeners();

      // Pre-initialize audio nodes for faster startup
      this.setupAudioNodes();
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      throw error;
    }
  }

  private setupAudioContextListeners(): void {
    if (!this.audioContext) return;

    // Listen for audio context state changes (important for iOS background playback)
    this.audioContext.addEventListener('statechange', () => {
      console.log('AudioContext state changed to:', this.audioContext?.state);
      
      // If context gets suspended and we're playing, try to resume
      if (this.audioContext?.state === 'suspended' && this.isPlaying) {
        this.audioContext.resume().catch(error => {
          console.error('Failed to resume audio context:', error);
        });
      }
    });
  }

  private setupAudioNodes(): void {
    if (!this.audioContext) return;

    try {
      // Create master gain for volume control
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.setValueAtTime(this.settings.volume, this.audioContext.currentTime);
  
      // Create high-quality filters for anti-aliasing and noise reduction
      this.lowPassFilter = this.audioContext.createBiquadFilter();
      this.lowPassFilter.type = 'lowpass';
      this.lowPassFilter.frequency.setValueAtTime(18000, this.audioContext.currentTime); // Anti-aliasing filter
      this.lowPassFilter.Q.setValueAtTime(0.7, this.audioContext.currentTime);
  
      this.highPassFilter = this.audioContext.createBiquadFilter();
      this.highPassFilter.type = 'highpass';
      this.highPassFilter.frequency.setValueAtTime(20, this.audioContext.currentTime); // Remove DC and low rumble
      this.highPassFilter.Q.setValueAtTime(0.7, this.audioContext.currentTime);
  
      // Create dynamics compressor to prevent clipping and distortion
      this.compressor = this.audioContext.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-12, this.audioContext.currentTime); // Raised threshold
      this.compressor.knee.setValueAtTime(30, this.audioContext.currentTime);
      this.compressor.ratio.setValueAtTime(4, this.audioContext.currentTime); // Lower ratio
      this.compressor.attack.setValueAtTime(0.003, this.audioContext.currentTime);
      this.compressor.release.setValueAtTime(0.25, this.audioContext.currentTime);
  
      // Create analyser for visualization
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;
  
      // Connect the audio processing chain
      this.masterGain.connect(this.highPassFilter);
      this.highPassFilter.connect(this.lowPassFilter);
      this.lowPassFilter.connect(this.compressor);
      this.compressor.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
      
      console.log('Audio nodes setup complete');
    } catch (e) {
      console.error('Error in setupAudioNodes:', e);
    }
  }


  private setupBinauralBeats(): void {
    if (!this.audioContext || !this.masterGain) return;

    this.cleanup();

    // Create stereo gain nodes
    this.leftGain = this.audioContext.createGain();
    this.rightGain = this.audioContext.createGain();

    // Create oscillators for left and right channels
    this.leftOscillator = this.audioContext.createOscillator();
    this.rightOscillator = this.audioContext.createOscillator();

    // Set waveform type
    this.leftOscillator.type = this.settings.waveform;
    this.rightOscillator.type = this.settings.waveform;

    // Calculate frequencies for binaural beats
    const leftFreq = this.settings.carrierFrequency;
    const rightFreq = this.settings.carrierFrequency + this.settings.beatFrequency;

    // Set frequencies with smooth transitions
    this.leftOscillator.frequency.setTargetAtTime(leftFreq, this.audioContext.currentTime, 0.01);
    this.rightOscillator.frequency.setTargetAtTime(rightFreq, this.audioContext.currentTime, 0.01);

    // Adjust gain based on waveform to prevent distortion - reduced further to prevent clipping
    const gainMultiplier = this.getWaveformGainMultiplier();
    // Use lower base gain to prevent distortion and allow headroom
    const baseGain = 0.3 * gainMultiplier;
    this.leftGain.gain.setValueAtTime(baseGain, this.audioContext.currentTime);
    this.rightGain.gain.setValueAtTime(baseGain, this.audioContext.currentTime);

    // Create stereo panner for proper channel separation
    // Fallback for browsers that don't support StereoPannerNode (though most modern ones do)
    let leftPanner: StereoPannerNode | PannerNode;
    let rightPanner: StereoPannerNode | PannerNode;

    if (this.audioContext.createStereoPanner) {
        leftPanner = this.audioContext.createStereoPanner();
        rightPanner = this.audioContext.createStereoPanner();
        (leftPanner as StereoPannerNode).pan.setValueAtTime(-1, this.audioContext.currentTime);
        (rightPanner as StereoPannerNode).pan.setValueAtTime(1, this.audioContext.currentTime);
    } else {
        // Fallback to PannerNode (3D spatialization)
        leftPanner = this.audioContext.createPanner();
        rightPanner = this.audioContext.createPanner();
        (leftPanner as PannerNode).panningModel = 'equalpower';
        (leftPanner as PannerNode).setPosition(-1, 0, 0);
        (rightPanner as PannerNode).panningModel = 'equalpower';
        (rightPanner as PannerNode).setPosition(1, 0, 0);
    }

    // Connect the audio graph
    this.leftOscillator.connect(this.leftGain);
    this.rightOscillator.connect(this.rightGain);
    
    this.leftGain.connect(leftPanner);
    this.rightGain.connect(rightPanner);
    
    leftPanner.connect(this.masterGain);
    rightPanner.connect(this.masterGain);

    // Start oscillators immediately for faster response
    const now = this.audioContext.currentTime;
    this.leftOscillator.start(now);
    this.rightOscillator.start(now);
  }

  private setupIsochronicTones(): void {
    if (!this.audioContext || !this.masterGain) return;

    this.cleanup();

    // Create main oscillator for carrier frequency
    this.isoOscillator = this.audioContext.createOscillator();
    this.isoOscillator.type = this.settings.waveform;
    this.isoOscillator.frequency.setTargetAtTime(this.settings.carrierFrequency, this.audioContext.currentTime, 0.01);

    // Create LFO for pulse modulation
    this.isoLFO = this.audioContext.createOscillator();
    this.isoLFO.type = 'sine';
    this.isoLFO.frequency.setTargetAtTime(this.settings.beatFrequency, this.audioContext.currentTime, 0.01);

    // Create gain nodes
    this.isoGain = this.audioContext.createGain();
    this.isoLFOGain = this.audioContext.createGain();

    // Adjust gain based on waveform
    const gainMultiplier = this.getWaveformGainMultiplier();
    const baseGain = 0.5 * gainMultiplier;
    const minGain = 0.15 * gainMultiplier;
    const modulationRange = baseGain - minGain;
    
    // Set initial gain
    this.isoGain.gain.setValueAtTime(baseGain, this.audioContext.currentTime);
    
    // Connect the main signal chain
    this.isoOscillator.connect(this.isoGain);
    this.isoGain.connect(this.masterGain);
    
    // Start oscillators
    const now = this.audioContext.currentTime;
    this.isoOscillator.start(now);
    this.isoLFO.start(now);
    
    // Create and start the modulation loop using requestAnimationFrame for smoother updates
    // Store the animation frame ID for proper cleanup
    const updateGain = () => {
      if (!this.isPlaying || !this.isoGain || !this.audioContext) {
        this.isoAnimationFrameId = null;
        return;
      }
      
      // Calculate LFO value based on time
      const time = this.audioContext.currentTime;
      const lfoValue = Math.sin(time * this.settings.beatFrequency * 2 * Math.PI); // -1 to 1
      
      // Map -1..1 to minGain..baseGain
      // (lfoValue + 1) / 2 gives 0..1
      const normalizedLFO = (lfoValue + 1) / 2;
      const targetGain = minGain + (normalizedLFO * modulationRange);
      
      // Apply gain with a very short ramp to prevent clicking
      this.isoGain.gain.setTargetAtTime(targetGain, time, 0.005);
      
      this.isoAnimationFrameId = requestAnimationFrame(updateGain);
    };
    
    this.isoAnimationFrameId = requestAnimationFrame(updateGain);
  }

  private getWaveformGainMultiplier(): number {
    // Adjust gain based on waveform to prevent distortion - further reduced for safety
    switch (this.settings.waveform) {
      case 'sine':
        return 0.8; // Reduced from 1.0 to prevent clipping
      case 'triangle':
        return 0.6; // Reduced from 0.8
      case 'square':
        return 0.35; // Reduced from 0.5 - square waves have strong harmonics
      case 'sawtooth':
        return 0.35; // Reduced from 0.5 - sawtooth has strong harmonics
      default:
        return 0.8;
    }
  }


  private cleanup(): void {
    // Cancel isochronic tone animation loop
    if (this.isoAnimationFrameId !== null) {
      cancelAnimationFrame(this.isoAnimationFrameId);
      this.isoAnimationFrameId = null;
    }

    // Clear scheduled events
    this.clearSchedule();

    // Clean up existing oscillators and nodes
    if (this.leftOscillator) {
      try {
        this.leftOscillator.stop();
        this.leftOscillator.disconnect();
      } catch (e) {
        // Ignore errors if already stopped/disconnected
      }
      this.leftOscillator = null;
    }
    if (this.rightOscillator) {
      try {
        this.rightOscillator.stop();
        this.rightOscillator.disconnect();
      } catch (e) {
        // Ignore errors if already stopped/disconnected
      }
      this.rightOscillator = null;
    }
    if (this.isoOscillator) {
      try {
        this.isoOscillator.stop();
        this.isoOscillator.disconnect();
      } catch (e) {
        // Ignore errors if already stopped/disconnected
      }
      this.isoOscillator = null;
    }
    if (this.isoLFO) {
      try {
        this.isoLFO.stop();
        this.isoLFO.disconnect();
      } catch (e) {
        // Ignore errors if already stopped/disconnected
      }
      this.isoLFO = null;
    }
    if (this.leftGain) {
      try {
        this.leftGain.disconnect();
      } catch (e) {
        // Ignore errors
      }
      this.leftGain = null;
    }
    if (this.rightGain) {
      try {
        this.rightGain.disconnect();
      } catch (e) {
        // Ignore errors
      }
      this.rightGain = null;
    }
    if (this.isoGain) {
      try {
        this.isoGain.disconnect();
      } catch (e) {
        // Ignore errors
      }
      this.isoGain = null;
    }
    if (this.isoLFOGain) {
      try {
        this.isoLFOGain.disconnect();
      } catch (e) {
        // Ignore errors
      }
      this.isoLFOGain = null;
    }
  }

  // Web Audio API scheduling methods
  scheduleFrequencyChange(frequency: number, time: number): void {
    if (!this.audioContext) return;
    
    const scheduledTime = this.audioContext.currentTime + time;
    
    if (this.settings.mode === 'binaural') {
      if (this.leftOscillator && this.rightOscillator) {
        const leftFreq = Math.max(20, Math.min(20000, frequency));
        const rightFreq = Math.max(20, Math.min(20000, frequency + this.settings.beatFrequency));
        this.leftOscillator.frequency.setValueAtTime(leftFreq, scheduledTime);
        this.rightOscillator.frequency.setValueAtTime(rightFreq, scheduledTime);
      }
    } else {
      if (this.isoOscillator) {
        const carrierFreq = Math.max(20, Math.min(20000, frequency));
        this.isoOscillator.frequency.setValueAtTime(carrierFreq, scheduledTime);
      }
    }
    
    this.scheduledEvents.set(scheduledTime, { type: 'frequency', value: frequency, time: scheduledTime });
  }

  scheduleBeatFrequencyChange(beatFrequency: number, time: number): void {
    if (!this.audioContext) return;
    
    const scheduledTime = this.audioContext.currentTime + time;
    
    if (this.settings.mode === 'binaural') {
      if (this.leftOscillator && this.rightOscillator) {
        const leftFreq = Math.max(20, Math.min(20000, this.settings.carrierFrequency));
        const rightFreq = Math.max(20, Math.min(20000, this.settings.carrierFrequency + beatFrequency));
        this.leftOscillator.frequency.setValueAtTime(leftFreq, scheduledTime);
        this.rightOscillator.frequency.setValueAtTime(rightFreq, scheduledTime);
      }
    } else {
      if (this.isoLFO) {
        const beatFreq = Math.max(0.1, Math.min(100, beatFrequency));
        this.isoLFO.frequency.setValueAtTime(beatFreq, scheduledTime);
      }
    }
    
    this.scheduledEvents.set(scheduledTime, { type: 'frequency', value: beatFrequency, time: scheduledTime });
  }

  clearSchedule(): void {
    this.scheduledEvents.clear();
  }

  async start(): Promise<void> {
    try {
      if (!this.audioContext) {
        await this.initialize();
      }

      // Ensure audio context is running (critical for background playback)
      if (this.audioContext?.state === 'suspended') {
        try {
          await this.audioContext.resume();
        } catch (error) {
          console.error('Failed to resume audio context:', error);
          await this.initialize();
        }
      }

      // Keep audio context active
      if (this.audioContext && this.audioContext.state !== 'running') {
        try {
          await this.audioContext.resume();
        } catch (error) {
          console.error('Failed to activate audio context:', error);
          throw new Error('Audio context could not be activated');
        }
      }

      // Critical: Ensure master gain exists
      if (!this.masterGain) {
        console.warn('Master gain not found, setting up nodes');
        this.setupAudioNodes();
        if (!this.masterGain) {
          throw new Error('Failed to create master gain node');
        }
      }

      console.log('Starting audio:', this.settings);
      
      if (this.settings.mode === 'binaural') {
        this.setupBinauralBeats();
        console.log('Binaural beats setup complete');
      } else {
        this.setupIsochronicTones();
        console.log('Isochronic tones setup complete');
      }

      this.isPlaying = true;
      console.log('Audio started successfully');
    } catch (error) {
      console.error('Error in start():', error);
      this.isPlaying = false;
      throw error;
    }
  }

  stop(): void {
    if (!this.audioContext || !this.isPlaying) return;

    // Stop immediately for faster response
    this.cleanup();
    this.isPlaying = false;
  }

  updateSettings(newSettings: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...newSettings };

    if (!this.audioContext || !this.isPlaying) return;

    const now = this.audioContext.currentTime;

    // Update volume with smooth transition to prevent clicks/pops
    if (newSettings.volume !== undefined && this.masterGain) {
      // Clamp volume to safe range to prevent distortion
      const safeVolume = Math.max(0, Math.min(1, newSettings.volume));
      this.masterGain.gain.setTargetAtTime(safeVolume, now, 0.05); // Slower transition for smoother volume changes
    }

    // Update frequencies with smooth transitions to prevent clicks/pops
    if (newSettings.carrierFrequency !== undefined || newSettings.beatFrequency !== undefined) {
      if (this.settings.mode === 'binaural') {
        if (this.leftOscillator && this.rightOscillator) {
          const leftFreq = Math.max(20, Math.min(20000, this.settings.carrierFrequency)); // Clamp to audible range
          const rightFreq = Math.max(20, Math.min(20000, this.settings.carrierFrequency + this.settings.beatFrequency));
          // Use longer time constant for smoother transitions
          this.leftOscillator.frequency.setTargetAtTime(leftFreq, now, 0.1);
          this.rightOscillator.frequency.setTargetAtTime(rightFreq, now, 0.1);
        }
      } else {
        if (this.isoOscillator) {
          const carrierFreq = Math.max(20, Math.min(20000, this.settings.carrierFrequency));
          this.isoOscillator.frequency.setTargetAtTime(carrierFreq, now, 0.1);
        }
        if (this.isoLFO) {
          const beatFreq = Math.max(0.1, Math.min(100, this.settings.beatFrequency)); // Clamp beat frequency
          this.isoLFO.frequency.setTargetAtTime(beatFreq, now, 0.1);
        }
      }
    }

    // If waveform or mode changed, restart the audio smoothly
    if (newSettings.waveform !== undefined || newSettings.mode !== undefined) {
      if (this.isPlaying) {
        const wasPlaying = this.isPlaying;
        this.stop();
        // Small delay to ensure cleanup completes, then restart
        setTimeout(async () => {
          if (wasPlaying) {
            try {
              await this.start();
            } catch (error) {
              console.error('Failed to restart audio after mode/waveform change:', error);
            }
          }
        }, 50);
      }
    }
  }

  getAnalyserData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(0);
    
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteTimeDomainData(dataArray);
    return dataArray;
  }

  getFrequencyData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(0);
    
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  destroy(): void {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

