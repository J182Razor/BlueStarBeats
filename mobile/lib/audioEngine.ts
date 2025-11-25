/**
 * React Native Audio Engine for Blue Star Beats
 * Generates binaural beats and isochronic tones using expo-av
 */

import { Audio } from 'expo-av';

export type WaveformType = 'sine' | 'square' | 'triangle' | 'sawtooth';
export type AudioMode = 'binaural' | 'isochronic';

export interface AudioSettings {
  carrierFrequency: number;
  beatFrequency: number;
  waveform: WaveformType;
  mode: AudioMode;
  volume: number;
}

export class ReactNativeAudioEngine {
  private sound: Audio.Sound | null = null;
  private isPlaying = false;
  private settings: AudioSettings = {
    carrierFrequency: 200,
    beatFrequency: 10,
    waveform: 'sine',
    mode: 'binaural',
    volume: 0.7,
  };
  private audioDataUri: string | null = null;

  constructor() {
    this.initializeAudio();
  }

  private async initializeAudio() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }

  /**
   * Generate audio buffer for binaural beats or isochronic tones
   */
  private generateAudioBuffer(
    duration: number = 10,
    sampleRate: number = 44100
  ): Float32Array {
    const frameCount = Math.floor(sampleRate * duration);
    const buffer = new Float32Array(frameCount * 2); // Stereo

    const { carrierFrequency, beatFrequency, waveform, mode, volume } = this.settings;

    if (mode === 'binaural') {
      // Binaural beats: different frequencies in left and right channels
      const leftFreq = carrierFrequency - beatFrequency / 2;
      const rightFreq = carrierFrequency + beatFrequency / 2;

      for (let i = 0; i < frameCount; i++) {
        const t = i / sampleRate;
        const leftSample = this.generateWaveformSample(leftFreq * t * 2 * Math.PI, waveform);
        const rightSample = this.generateWaveformSample(rightFreq * t * 2 * Math.PI, waveform);
        
        buffer[i * 2] = leftSample * volume; // Left channel
        buffer[i * 2 + 1] = rightSample * volume; // Right channel
      }
    } else {
      // Isochronic tones: same frequency in both channels with pulsing
      for (let i = 0; i < frameCount; i++) {
        const t = i / sampleRate;
        const carrierPhase = carrierFrequency * t * 2 * Math.PI;
        const pulsePhase = beatFrequency * t * 2 * Math.PI;
        
        const carrierSample = this.generateWaveformSample(carrierPhase, waveform);
        const pulseEnvelope = (Math.sin(pulsePhase) + 1) / 2; // 0 to 1
        
        const sample = carrierSample * volume * pulseEnvelope;
        buffer[i * 2] = sample; // Left channel
        buffer[i * 2 + 1] = sample; // Right channel
      }
    }

    return buffer;
  }

  /**
   * Generate waveform sample
   */
  private generateWaveformSample(phase: number, waveform: WaveformType): number {
    // Normalize phase to [0, 2π]
    phase = phase % (2 * Math.PI);
    if (phase < 0) phase += 2 * Math.PI;

    switch (waveform) {
      case 'sine':
        return Math.sin(phase);
      case 'square':
        return phase < Math.PI ? 1 : -1;
      case 'triangle':
        return phase < Math.PI
          ? (2 * phase) / Math.PI - 1
          : 3 - (2 * phase) / Math.PI;
      case 'sawtooth':
        return (2 * phase) / (2 * Math.PI) - 1;
      default:
        return Math.sin(phase);
    }
  }

  /**
   * Convert Float32Array to base64 WAV file
   */
  private float32ArrayToWav(buffer: Float32Array, sampleRate: number): string {
    const length = buffer.length / 2; // Stereo, so half the frames
    const arrayBuffer = new ArrayBuffer(44 + length * 2 * 2); // 44 byte header + data
    const view = new DataView(arrayBuffer);
    const samples = new Int16Array(arrayBuffer, 44);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * 2 * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 2, true); // Stereo
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2 * 2, true);
    view.setUint16(32, 2 * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * 2 * 2, true);

    // Convert float samples to 16-bit PCM
    for (let i = 0; i < length; i++) {
      const left = Math.max(-1, Math.min(1, buffer[i * 2]));
      const right = Math.max(-1, Math.min(1, buffer[i * 2 + 1]));
      samples[i * 2] = left < 0 ? left * 0x8000 : left * 0x7FFF;
      samples[i * 2 + 1] = right < 0 ? right * 0x8000 : right * 0x7FFF;
    }

    // Convert to base64 (React Native compatible)
    const bytes = new Uint8Array(arrayBuffer);
    const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    let i = 0;
    while (i < bytes.length) {
      const a = bytes[i++];
      const b = i < bytes.length ? bytes[i++] : 0;
      const c = i < bytes.length ? bytes[i++] : 0;
      const bitmap = (a << 16) | (b << 8) | c;
      result += base64Chars.charAt((bitmap >> 18) & 63);
      result += base64Chars.charAt((bitmap >> 12) & 63);
      result += i - 2 < bytes.length ? base64Chars.charAt((bitmap >> 6) & 63) : '=';
      result += i - 1 < bytes.length ? base64Chars.charAt(bitmap & 63) : '=';
    }
    return result;
  }

  /**
   * Start audio playback
   */
  async start(): Promise<void> {
    if (this.isPlaying) return;

    try {
      // Generate audio buffer (10 seconds, looped)
      const buffer = this.generateAudioBuffer(10, 44100);
      const wavBase64 = this.float32ArrayToWav(buffer, 44100);
      const dataUri = `data:audio/wav;base64,${wavBase64}`;

      // Unload previous sound if exists
      if (this.sound) {
        await this.sound.unloadAsync();
      }

      // Create and play sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: dataUri },
        {
          shouldPlay: true,
          isLooping: true,
          volume: this.settings.volume,
        }
      );

      this.sound = sound;
      this.isPlaying = true;
    } catch (error) {
      console.error('Failed to start audio:', error);
    }
  }

  /**
   * Stop audio playback
   */
  async stop(): Promise<void> {
    if (!this.isPlaying || !this.sound) return;

    try {
      await this.sound.stopAsync();
      await this.sound.unloadAsync();
      this.sound = null;
      this.isPlaying = false;
    } catch (error) {
      console.error('Failed to stop audio:', error);
    }
  }

  /**
   * Update audio settings
   */
  async updateSettings(newSettings: Partial<AudioSettings>): Promise<void> {
    const wasPlaying = this.isPlaying;
    
    this.settings = { ...this.settings, ...newSettings };

    if (wasPlaying) {
      await this.stop();
      await this.start();
    }
  }

  /**
   * Set volume
   */
  async setVolume(volume: number): Promise<void> {
    this.settings.volume = Math.max(0, Math.min(1, volume));
    
    if (this.sound) {
      await this.sound.setVolumeAsync(this.settings.volume);
    }
  }

  /**
   * Get current settings
   */
  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  /**
   * Get playing state
   */
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Cleanup
   */
  async cleanup(): Promise<void> {
    await this.stop();
  }
}

// Singleton instance
let audioEngineInstance: ReactNativeAudioEngine | null = null;

export const getAudioEngine = (): ReactNativeAudioEngine => {
  if (!audioEngineInstance) {
    audioEngineInstance = new ReactNativeAudioEngine();
  }
  return audioEngineInstance;
};

