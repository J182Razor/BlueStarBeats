import { DEFAULT_AUDIO_SETTINGS } from "@/lib/audio/types";
import type { MarketplaceListing } from "@/lib/domain";

export const MARKETPLACE_SEED: MarketplaceListing[] = [
  {
    id: "mkp-sleep-ramp",
    title: "Deep Sleep Ramp 25m",
    creator: "NeuroNest",
    creatorBadge: "Top Creator",
    type: "program",
    tags: ["sleep", "calm"],
    trendScore: 98,
    createdAt: "2026-02-28T10:12:00.000Z",
    preview: {
      ...DEFAULT_AUDIO_SETTINGS,
      mode: "binaural",
      carrierHz: 180,
      entrainmentHz: 2.5,
    },
  },
  {
    id: "mkp-focus-lock",
    title: "Focus Lock 40Hz",
    creator: "BlueLab",
    creatorBadge: "Verified",
    type: "preset",
    tags: ["focus", "custom"],
    trendScore: 93,
    createdAt: "2026-03-01T21:20:00.000Z",
    preview: {
      ...DEFAULT_AUDIO_SETTINGS,
      mode: "isochronic",
      carrierHz: 430,
      entrainmentHz: 18,
      waveform: "square",
    },
  },
  {
    id: "mkp-calm-reset",
    title: "Calm Reset 12m",
    creator: "ZenCurrent",
    type: "program",
    tags: ["calm", "meditation"],
    trendScore: 90,
    createdAt: "2026-03-02T06:08:00.000Z",
    preview: {
      ...DEFAULT_AUDIO_SETTINGS,
      mode: "binaural",
      carrierHz: 240,
      entrainmentHz: 7.5,
      waveform: "triangle",
    },
  },
];
