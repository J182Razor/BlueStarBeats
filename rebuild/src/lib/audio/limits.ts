import type { AudioMode, AudioSettings, Waveform } from "@/lib/audio/types";

export const CARRIER_MIN_HZ = 20;
export const CARRIER_MAX_HZ = 20000;
export const ENTRAINMENT_MIN_HZ = 0.1;
export const ENTRAINMENT_MAX_HZ = 40;
export const VOLUME_MIN = 0.01;
export const VOLUME_MAX = 1;
export const HIGH_FREQUENCY_WARNING_HZ = 16000;

const AUDIO_MODES = new Set<AudioMode>(["binaural", "isochronic"]);
const WAVEFORMS = new Set<Waveform>(["sine", "triangle", "square", "sawtooth"]);

function round(value: number, decimals: number) {
  return Number(value.toFixed(decimals));
}

export function clampCarrierHz(value: number) {
  return round(Math.min(CARRIER_MAX_HZ, Math.max(CARRIER_MIN_HZ, value)), 3);
}

export function clampEntrainmentHz(value: number) {
  return round(Math.min(ENTRAINMENT_MAX_HZ, Math.max(ENTRAINMENT_MIN_HZ, value)), 3);
}

export function clampVolume(value: number) {
  return round(Math.min(VOLUME_MAX, Math.max(VOLUME_MIN, value)), 3);
}

export function clampAudioSettings(next: AudioSettings): AudioSettings {
  return {
    ...next,
    carrierHz: clampCarrierHz(next.carrierHz),
    entrainmentHz: clampEntrainmentHz(next.entrainmentHz),
    volume: clampVolume(next.volume),
  };
}

export function isValidAudioMode(value: unknown): value is AudioMode {
  return typeof value === "string" && AUDIO_MODES.has(value as AudioMode);
}

export function isValidWaveform(value: unknown): value is Waveform {
  return typeof value === "string" && WAVEFORMS.has(value as Waveform);
}

export function isValidCarrierHz(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= CARRIER_MIN_HZ && value <= CARRIER_MAX_HZ;
}

export function isValidEntrainmentHz(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= ENTRAINMENT_MIN_HZ &&
    value <= ENTRAINMENT_MAX_HZ
  );
}

export function isValidVolume(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= VOLUME_MIN && value <= VOLUME_MAX;
}

export function getHighFrequencyWarning(carrierHz: number) {
  if (carrierHz < HIGH_FREQUENCY_WARNING_HZ) return null;
  return "Hearing and hardware warning: frequencies above 16 kHz may be hard to hear, may cause fatigue at high volume, and many speakers/headphones will not reproduce them accurately.";
}
