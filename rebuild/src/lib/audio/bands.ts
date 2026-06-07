import type { AudioSettings } from "@/lib/audio/types";

export interface BrainwaveBand {
  name: "Delta" | "Theta" | "Alpha" | "Beta" | "Gamma";
  range: string;
  state: string;
}

const BANDS: Array<BrainwaveBand & { maxHz: number }> = [
  { name: "Delta", maxHz: 4, range: "0.1 to 4 Hz", state: "deep sleep and restoration" },
  { name: "Theta", maxHz: 8, range: "4 to 8 Hz", state: "meditation and inner imagery" },
  { name: "Alpha", maxHz: 13, range: "8 to 13 Hz", state: "relaxed, present awareness" },
  { name: "Beta", maxHz: 30, range: "13 to 30 Hz", state: "alert focus and clear thought" },
  { name: "Gamma", maxHz: 40.001, range: "30 to 40 Hz", state: "peak concentration" },
];

export function getBand(entrainmentHz: number): BrainwaveBand {
  const band = BANDS.find((item) => entrainmentHz < item.maxHz) ?? BANDS[BANDS.length - 1];
  return { name: band.name, range: band.range, state: band.state };
}

export interface Intention {
  id: string;
  label: string;
  detail: string;
  settings: AudioSettings;
}

export const INTENTIONS: Intention[] = [
  {
    id: "sleep",
    label: "Sleep",
    detail: "2.5 Hz delta over a low 144 Hz carrier",
    settings: { mode: "binaural", waveform: "sine", carrierHz: 144, entrainmentHz: 2.5, volume: 0.3 },
  },
  {
    id: "meditate",
    label: "Meditate",
    detail: "6 Hz theta over a warm 216 Hz carrier",
    settings: { mode: "binaural", waveform: "sine", carrierHz: 216, entrainmentHz: 6, volume: 0.35 },
  },
  {
    id: "focus",
    label: "Focus",
    detail: "14 Hz beta over a bright 256 Hz carrier",
    settings: { mode: "binaural", waveform: "sine", carrierHz: 256, entrainmentHz: 14, volume: 0.35 },
  },
  {
    id: "manifest",
    label: "Manifest",
    detail: "7.83 Hz earth resonance over a 432 Hz carrier",
    settings: { mode: "binaural", waveform: "sine", carrierHz: 432, entrainmentHz: 7.83, volume: 0.35 },
  },
];

export interface SolfeggioTone {
  hz: number;
  theme: string;
}

export const SOLFEGGIO_TONES: SolfeggioTone[] = [
  { hz: 396, theme: "release" },
  { hz: 417, theme: "renewal" },
  { hz: 528, theme: "harmony" },
  { hz: 639, theme: "connection" },
  { hz: 741, theme: "expression" },
  { hz: 852, theme: "intuition" },
];
