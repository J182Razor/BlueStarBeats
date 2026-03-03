export type AudioMode = "binaural" | "isochronic";
export type Waveform = OscillatorType;

export interface AudioSettings {
  mode: AudioMode;
  waveform: Waveform;
  carrierHz: number;
  entrainmentHz: number;
  volume: number;
}

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  mode: "binaural",
  waveform: "sine",
  carrierHz: 220,
  entrainmentHz: 8,
  volume: 0.35,
};
