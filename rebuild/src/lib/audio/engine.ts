import type { AudioSettings } from "@/lib/audio/types";
import {
  CARRIER_MAX_HZ,
  CARRIER_MIN_HZ,
  ENTRAINMENT_MIN_HZ,
  clampAudioSettings,
} from "@/lib/audio/limits";

export class BrainwaveAudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;

  private leftOsc: OscillatorNode | null = null;
  private rightOsc: OscillatorNode | null = null;
  private isoOsc: OscillatorNode | null = null;
  private lfoOsc: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  private pulseGain: GainNode | null = null;
  private dcOffset: ConstantSourceNode | null = null;

  private isPlaying = false;
  private unlocked = false;
  private settings: AudioSettings;

  constructor(initial: AudioSettings) {
    this.settings = initial;
  }

  private ensureContext() {
    if (this.ctx) return this.ctx;

    this.ctx = new AudioContext({
      latencyHint: "interactive",
      sampleRate: 48000,
    });

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.82;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);

    const hp = this.ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.setValueAtTime(20, this.ctx.currentTime);

    const lp = this.ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(CARRIER_MAX_HZ, this.ctx.currentTime);

    const compressor = this.ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-20, this.ctx.currentTime);
    compressor.knee.setValueAtTime(30, this.ctx.currentTime);
    compressor.ratio.setValueAtTime(8, this.ctx.currentTime);
    compressor.attack.setValueAtTime(0.005, this.ctx.currentTime);
    compressor.release.setValueAtTime(0.2, this.ctx.currentTime);

    this.masterGain.connect(hp);
    hp.connect(lp);
    lp.connect(compressor);
    compressor.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    return this.ctx;
  }

  async unlock() {
    const ctx = this.ensureContext();
    if (ctx.state === "suspended") await ctx.resume();
    this.unlocked = true;
  }

  get hasUnlocked() {
    return this.unlocked;
  }

  get playing() {
    return this.isPlaying;
  }

  getSettings() {
    return this.settings;
  }

  private stopSources() {
    const stopAndDisconnect = (node: AudioNode & { stop?: () => void } | null) => {
      if (!node) return;
      try {
        node.stop?.();
      } catch {
        // already stopped
      }
      try {
        node.disconnect();
      } catch {
        // already disconnected
      }
    };

    stopAndDisconnect(this.leftOsc);
    stopAndDisconnect(this.rightOsc);
    stopAndDisconnect(this.isoOsc);
    stopAndDisconnect(this.lfoOsc);
    stopAndDisconnect(this.lfoGain);
    stopAndDisconnect(this.pulseGain);
    stopAndDisconnect(this.dcOffset);

    this.leftOsc = null;
    this.rightOsc = null;
    this.isoOsc = null;
    this.lfoOsc = null;
    this.lfoGain = null;
    this.pulseGain = null;
    this.dcOffset = null;
  }

  private waveformGainScale() {
    switch (this.settings.waveform) {
      case "square":
      case "sawtooth":
        return 0.5;
      case "triangle":
        return 0.75;
      default:
        return 1;
    }
  }

  private clampOscillatorHz(value: number) {
    return Math.min(CARRIER_MAX_HZ, Math.max(1, value));
  }

  private connectBinaural(ctx: AudioContext) {
    if (!this.masterGain) return;
    this.leftOsc = ctx.createOscillator();
    this.rightOsc = ctx.createOscillator();

    const leftPan = ctx.createStereoPanner();
    const rightPan = ctx.createStereoPanner();
    leftPan.pan.setValueAtTime(-1, ctx.currentTime);
    rightPan.pan.setValueAtTime(1, ctx.currentTime);

    const leftGain = ctx.createGain();
    const rightGain = ctx.createGain();

    const amp = 0.5 * this.waveformGainScale();
    leftGain.gain.setValueAtTime(amp, ctx.currentTime);
    rightGain.gain.setValueAtTime(amp, ctx.currentTime);

    const leftHz = this.settings.carrierHz - this.settings.entrainmentHz / 2;
    const rightHz = this.settings.carrierHz + this.settings.entrainmentHz / 2;

    this.leftOsc.type = this.settings.waveform;
    this.rightOsc.type = this.settings.waveform;
    this.leftOsc.frequency.setValueAtTime(this.clampOscillatorHz(leftHz), ctx.currentTime);
    this.rightOsc.frequency.setValueAtTime(this.clampOscillatorHz(rightHz), ctx.currentTime);

    this.leftOsc.connect(leftGain);
    this.rightOsc.connect(rightGain);
    leftGain.connect(leftPan);
    rightGain.connect(rightPan);
    leftPan.connect(this.masterGain);
    rightPan.connect(this.masterGain);

    this.leftOsc.start();
    this.rightOsc.start();
  }

  private connectIsochronic(ctx: AudioContext) {
    if (!this.masterGain) return;

    this.isoOsc = ctx.createOscillator();
    this.pulseGain = ctx.createGain();
    this.lfoOsc = ctx.createOscillator();
    this.lfoGain = ctx.createGain();
    this.dcOffset = ctx.createConstantSource();

    this.isoOsc.type = this.settings.waveform;
    this.isoOsc.frequency.setValueAtTime(
      Math.min(CARRIER_MAX_HZ, Math.max(CARRIER_MIN_HZ, this.settings.carrierHz)),
      ctx.currentTime,
    );
    this.lfoOsc.type = "sine";
    this.lfoOsc.frequency.setValueAtTime(
      Math.max(ENTRAINMENT_MIN_HZ, this.settings.entrainmentHz),
      ctx.currentTime,
    );

    const base = 0.4 * this.waveformGainScale();
    this.pulseGain.gain.setValueAtTime(base, ctx.currentTime);
    this.lfoGain.gain.setValueAtTime(base * 0.85, ctx.currentTime);
    this.dcOffset.offset.setValueAtTime(base * 0.2, ctx.currentTime);

    this.lfoOsc.connect(this.lfoGain);
    this.lfoGain.connect(this.pulseGain.gain);
    this.dcOffset.connect(this.pulseGain.gain);

    this.isoOsc.connect(this.pulseGain);
    this.pulseGain.connect(this.masterGain);

    this.isoOsc.start();
    this.lfoOsc.start();
    this.dcOffset.start();
  }

  async start(settings?: Partial<AudioSettings>) {
    if (settings) {
      this.settings = clampAudioSettings({ ...this.settings, ...settings });
    } else {
      this.settings = clampAudioSettings(this.settings);
    }
    if (!this.unlocked) throw new Error("Audio context must be unlocked by user gesture");

    const ctx = this.ensureContext();
    this.stopSources();

    if (this.settings.mode === "binaural") {
      this.connectBinaural(ctx);
    } else {
      this.connectIsochronic(ctx);
    }

    if (this.masterGain) {
      const now = ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(0.0001, now);
      this.masterGain.gain.exponentialRampToValueAtTime(
        Math.max(0.0001, this.settings.volume),
        now + 0.08,
      );
    }

    this.isPlaying = true;
  }

  async stop() {
    if (!this.ctx || !this.masterGain) {
      this.isPlaying = false;
      return;
    }

    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(Math.max(this.masterGain.gain.value, 0.0001), now);
    this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

    await new Promise((resolve) => setTimeout(resolve, 70));
    this.stopSources();
    this.isPlaying = false;
  }

  async update(next: Partial<AudioSettings>) {
    this.settings = clampAudioSettings({ ...this.settings, ...next });
    if (!this.isPlaying || !this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    if (typeof next.volume === "number") {
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setTargetAtTime(Math.max(0.0001, next.volume), now, 0.02);
    }

    const modeOrWaveChanged = next.mode || next.waveform;
    if (modeOrWaveChanged) {
      await this.start();
      return;
    }

    if (this.settings.mode === "binaural" && this.leftOsc && this.rightOsc) {
      const leftHz = this.settings.carrierHz - this.settings.entrainmentHz / 2;
      const rightHz = this.settings.carrierHz + this.settings.entrainmentHz / 2;
      this.leftOsc.frequency.setTargetAtTime(this.clampOscillatorHz(leftHz), now, 0.01);
      this.rightOsc.frequency.setTargetAtTime(this.clampOscillatorHz(rightHz), now, 0.01);
    }

    if (this.settings.mode === "isochronic" && this.isoOsc && this.lfoOsc) {
      this.isoOsc.frequency.setTargetAtTime(
        Math.min(CARRIER_MAX_HZ, Math.max(CARRIER_MIN_HZ, this.settings.carrierHz)),
        now,
        0.01,
      );
      this.lfoOsc.frequency.setTargetAtTime(
        Math.max(ENTRAINMENT_MIN_HZ, this.settings.entrainmentHz),
        now,
        0.01,
      );
    }
  }

  async destroy() {
    await this.stop();
    if (!this.ctx) return;
    await this.ctx.close();
    this.ctx = null;
    this.masterGain = null;
    this.analyser = null;
    this.unlocked = false;
  }
}
