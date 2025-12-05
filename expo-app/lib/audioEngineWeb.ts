/**
 * Web Audio Engine for BlueStarBeats
 * Generates binaural beats and isochronic tones using Web Audio API
 */

type WaveformType = 'sine' | 'square' | 'sawtooth' | 'triangle';
type AudioMode = 'binaural' | 'isochronic';

class WebAudioEngine {
    private audioContext: AudioContext | null = null;
    private leftOscillator: OscillatorNode | null = null;
    private rightOscillator: OscillatorNode | null = null;
    private gainNode: GainNode | null = null;
    private channelMerger: ChannelMergerNode | null = null;
    private isPlaying: boolean = false;

    private carrierFrequency: number = 440;
    private beatFrequency: number = 7.83;
    private waveform: WaveformType = 'sine';
    private mode: AudioMode = 'binaural';
    private volume: number = 0.7;

    initAudioContext(): void {
        if (typeof window !== 'undefined' && !this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    }

    start(): void {
        if (!this.audioContext) {
            this.initAudioContext();
        }
        if (!this.audioContext || this.isPlaying) return;

        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        this.setupAudioGraph();
        this.isPlaying = true;
    }

    stop(): void {
        if (!this.isPlaying) return;

        this.leftOscillator?.stop();
        this.rightOscillator?.stop();
        this.leftOscillator?.disconnect();
        this.rightOscillator?.disconnect();
        this.gainNode?.disconnect();
        this.channelMerger?.disconnect();

        this.leftOscillator = null;
        this.rightOscillator = null;
        this.isPlaying = false;
    }

    private setupAudioGraph(): void {
        if (!this.audioContext) return;

        // Create gain node for volume control
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);

        if (this.mode === 'binaural') {
            // Binaural beats: different frequencies in each ear
            const leftFreq = this.carrierFrequency - this.beatFrequency / 2;
            const rightFreq = this.carrierFrequency + this.beatFrequency / 2;

            // Create stereo panner for left channel
            this.leftOscillator = this.audioContext.createOscillator();
            this.leftOscillator.type = this.waveform;
            this.leftOscillator.frequency.setValueAtTime(leftFreq, this.audioContext.currentTime);

            // Create stereo panner for right channel
            this.rightOscillator = this.audioContext.createOscillator();
            this.rightOscillator.type = this.waveform;
            this.rightOscillator.frequency.setValueAtTime(rightFreq, this.audioContext.currentTime);

            // Create channel merger for stereo output
            this.channelMerger = this.audioContext.createChannelMerger(2);

            // Connect oscillators to merger
            const leftGain = this.audioContext.createGain();
            const rightGain = this.audioContext.createGain();

            this.leftOscillator.connect(leftGain);
            this.rightOscillator.connect(rightGain);

            leftGain.connect(this.channelMerger, 0, 0);
            rightGain.connect(this.channelMerger, 0, 1);

            this.channelMerger.connect(this.gainNode);
            this.gainNode.connect(this.audioContext.destination);

            this.leftOscillator.start();
            this.rightOscillator.start();
        } else {
            // Isochronic tones: single frequency with pulsing
            this.leftOscillator = this.audioContext.createOscillator();
            this.leftOscillator.type = this.waveform;
            this.leftOscillator.frequency.setValueAtTime(this.carrierFrequency, this.audioContext.currentTime);

            // Create pulsing effect
            const pulseGain = this.audioContext.createGain();
            const pulseOsc = this.audioContext.createOscillator();
            pulseOsc.frequency.setValueAtTime(this.beatFrequency, this.audioContext.currentTime);

            pulseGain.gain.setValueAtTime(0.5, this.audioContext.currentTime);
            pulseOsc.connect(pulseGain.gain);

            this.leftOscillator.connect(pulseGain);
            pulseGain.connect(this.gainNode);
            this.gainNode.connect(this.audioContext.destination);

            this.leftOscillator.start();
            pulseOsc.start();
        }
    }

    setVolume(volume: number): void {
        this.volume = volume;
        if (this.gainNode && this.audioContext) {
            this.gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        }
    }

    setWaveform(waveform: WaveformType): void {
        this.waveform = waveform;
        if (this.leftOscillator) {
            this.leftOscillator.type = waveform;
        }
        if (this.rightOscillator) {
            this.rightOscillator.type = waveform;
        }
    }

    setMode(mode: AudioMode): void {
        if (this.mode !== mode) {
            this.mode = mode;
            if (this.isPlaying) {
                this.stop();
                this.start();
            }
        }
    }

    updateFrequencies(carrier: number, beat: number): void {
        this.carrierFrequency = carrier;
        this.beatFrequency = beat;

        if (this.isPlaying && this.audioContext && this.mode === 'binaural') {
            const leftFreq = carrier - beat / 2;
            const rightFreq = carrier + beat / 2;

            if (this.leftOscillator) {
                this.leftOscillator.frequency.setValueAtTime(leftFreq, this.audioContext.currentTime);
            }
            if (this.rightOscillator) {
                this.rightOscillator.frequency.setValueAtTime(rightFreq, this.audioContext.currentTime);
            }
        }
    }
}

export const audioEngine = new WebAudioEngine();
