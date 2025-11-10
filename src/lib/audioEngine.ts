export type WaveformType = 'sine' | 'square' | 'triangle' | 'sawtooth';
export type AudioMode = 'binaural' | 'isochronic';

export interface AudioSettings {
  carrierFrequency: number;
  beatFrequency: number;
  waveform: WaveformType;
  mode: AudioMode;
  volume: number;
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
  private waveshaper: WaveShaperNode | null = null;

  async initialize(): Promise<void> {
    try {
      // Create high-quality audio context with optimized settings
      this.audioContext = new AudioContext({
        sampleRate: 44100, // Use standard sample rate for better compatibility and faster initialization
        latencyHint: 'interactive'
      });

      // Resume context immediately if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Pre-initialize audio nodes for faster startup
      this.setupAudioNodes();
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      throw error;
    }
  }

  private setupAudioNodes(): void {
    if (!this.audioContext) return;

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
    this.compressor.threshold.setValueAtTime(-24, this.audioContext.currentTime);
    this.compressor.knee.setValueAtTime(30, this.audioContext.currentTime);
    this.compressor.ratio.setValueAtTime(12, this.audioContext.currentTime);
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
  }

  private createWaveshaperCurve(): Float32Array {
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;
    
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      // Sigmoid curve for smooth isochronic pulses
      curve[i] = (3 + 30) * x * 20 * deg / (Math.PI + 30 * Math.abs(x));
    }
    
    return curve;
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

    // Adjust gain based on waveform to prevent distortion
    const gainMultiplier = this.getWaveformGainMultiplier();
    this.leftGain.gain.setValueAtTime(0.5 * gainMultiplier, this.audioContext.currentTime);
    this.rightGain.gain.setValueAtTime(0.5 * gainMultiplier, this.audioContext.currentTime);

    // Create stereo panner for proper channel separation
    const leftPanner = this.audioContext.createStereoPanner();
    const rightPanner = this.audioContext.createStereoPanner();
    leftPanner.pan.setValueAtTime(-1, this.audioContext.currentTime); // Full left
    rightPanner.pan.setValueAtTime(1, this.audioContext.currentTime); // Full right

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

    // Create waveshaper for smooth pulse transitions
    this.waveshaper = this.audioContext.createWaveShaper();
    this.waveshaper.curve = new Float32Array(this.createWaveshaperCurve());
    this.waveshaper.oversample = '4x'; // High-quality oversampling

    // Adjust gain based on waveform
    const gainMultiplier = this.getWaveformGainMultiplier();
    this.isoGain.gain.setValueAtTime(gainMultiplier, this.audioContext.currentTime);

    // Set LFO gain for modulation depth (0.5 = 50% modulation depth)
    this.isoLFOGain.gain.setValueAtTime(0.4, this.audioContext.currentTime);

    // Add DC offset to prevent complete silence during pulse troughs
    const dcOffset = this.audioContext.createConstantSource();
    dcOffset.offset.setValueAtTime(0.1, this.audioContext.currentTime);

    // Connect the modulation chain
    this.isoLFO.connect(this.isoLFOGain);
    dcOffset.connect(this.isoLFOGain);
    this.isoLFOGain.connect(this.waveshaper);
    this.waveshaper.connect(this.isoGain.gain);

    // Connect the main signal chain
    this.isoOscillator.connect(this.isoGain);
    this.isoGain.connect(this.masterGain);

    // Start oscillators immediately for faster response
    const now = this.audioContext.currentTime;
    this.isoOscillator.start(now);
    this.isoLFO.start(now);
    dcOffset.start(now);
  }

  private getWaveformGainMultiplier(): number {
    // Adjust gain based on waveform to prevent distortion
    switch (this.settings.waveform) {
      case 'sine':
        return 1.0;
      case 'triangle':
        return 0.8;
      case 'square':
      case 'sawtooth':
        return 0.5; // These waveforms have higher harmonic content
      default:
        return 1.0;
    }
  }

  private cleanup(): void {
    // Clean up existing oscillators and nodes
    if (this.leftOscillator) {
      this.leftOscillator.stop();
      this.leftOscillator.disconnect();
      this.leftOscillator = null;
    }
    if (this.rightOscillator) {
      this.rightOscillator.stop();
      this.rightOscillator.disconnect();
      this.rightOscillator = null;
    }
    if (this.isoOscillator) {
      this.isoOscillator.stop();
      this.isoOscillator.disconnect();
      this.isoOscillator = null;
    }
    if (this.isoLFO) {
      this.isoLFO.stop();
      this.isoLFO.disconnect();
      this.isoLFO = null;
    }
    if (this.leftGain) {
      this.leftGain.disconnect();
      this.leftGain = null;
    }
    if (this.rightGain) {
      this.rightGain.disconnect();
      this.rightGain = null;
    }
    if (this.isoGain) {
      this.isoGain.disconnect();
      this.isoGain = null;
    }
    if (this.isoLFOGain) {
      this.isoLFOGain.disconnect();
      this.isoLFOGain = null;
    }
    if (this.waveshaper) {
      this.waveshaper.disconnect();
      this.waveshaper = null;
    }
  }

  async start(): Promise<void> {
    if (!this.audioContext) {
      await this.initialize();
    }

    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }

    if (this.settings.mode === 'binaural') {
      this.setupBinauralBeats();
    } else {
      this.setupIsochronicTones();
    }

    this.isPlaying = true;
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

    // Update volume
    if (newSettings.volume !== undefined && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(newSettings.volume, now, 0.01);
    }

    // Update frequencies
    if (newSettings.carrierFrequency !== undefined || newSettings.beatFrequency !== undefined) {
      if (this.settings.mode === 'binaural') {
        if (this.leftOscillator && this.rightOscillator) {
          const leftFreq = this.settings.carrierFrequency;
          const rightFreq = this.settings.carrierFrequency + this.settings.beatFrequency;
          this.leftOscillator.frequency.setTargetAtTime(leftFreq, now, 0.01);
          this.rightOscillator.frequency.setTargetAtTime(rightFreq, now, 0.01);
        }
      } else {
        if (this.isoOscillator) {
          this.isoOscillator.frequency.setTargetAtTime(this.settings.carrierFrequency, now, 0.01);
        }
        if (this.isoLFO) {
          this.isoLFO.frequency.setTargetAtTime(this.settings.beatFrequency, now, 0.01);
        }
      }
    }

    // If waveform or mode changed, restart the audio immediately
    if (newSettings.waveform !== undefined || newSettings.mode !== undefined) {
      if (this.isPlaying) {
        this.stop();
        // Restart immediately without delay
        setTimeout(() => this.start(), 10);
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

