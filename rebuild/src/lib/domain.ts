import type { AudioMode, AudioSettings, Waveform } from "@/lib/audio/types";

export type GoalTag = "sleep" | "focus" | "calm" | "meditation" | "custom";

export interface PresetRecord extends AudioSettings {
  id: string;
  name: string;
  tags: GoalTag[];
  createdAt: string;
}

export interface ProgramWaypoint {
  id: string;
  durationMinutes: number;
  mode: AudioMode;
  waveform: Waveform;
  carrierHz: number;
  entrainmentHz: number;
  volume: number;
  transitionType: "step" | "ramp";
}

export interface ProgramRecord {
  id: string;
  name: string;
  goalTag: GoalTag;
  waypoints: ProgramWaypoint[];
  createdAt: string;
}

export interface MarketplaceListing {
  id: string;
  title: string;
  creator: string;
  creatorBadge?: string;
  type: "preset" | "program";
  tags: GoalTag[];
  trendScore: number;
  createdAt: string;
  preview: AudioSettings;
}
