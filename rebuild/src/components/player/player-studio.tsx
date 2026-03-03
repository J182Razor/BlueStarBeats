"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AdSlot } from "@/components/monetization/ad-slot";
import { usePlanTier } from "@/hooks/use-plan-tier";
import { useSessionMetrics } from "@/hooks/use-session-metrics";
import { BrainwaveAudioEngine } from "@/lib/audio/engine";
import { DEFAULT_AUDIO_SETTINGS, type AudioMode, type AudioSettings, type Waveform } from "@/lib/audio/types";
import { readLocalJson } from "@/lib/storage";

const WAVEFORMS: Waveform[] = ["sine", "triangle", "square", "sawtooth"];
const MODES: AudioMode[] = ["binaural", "isochronic"];
const ACTIVE_SETTINGS_KEY = "bsb_active_settings";
const QUICK_TUNE: Array<{ label: string; delta: Partial<AudioSettings> }> = [
  { label: "Deeper", delta: { entrainmentHz: -1.5, carrierHz: -8 } },
  { label: "Lighter", delta: { entrainmentHz: 1.5, carrierHz: 6 } },
  { label: "Calm", delta: { entrainmentHz: -0.8 } },
  { label: "Alert", delta: { entrainmentHz: 1.2 } },
];

export function PlayerStudio() {
  const engineRef = useRef<BrainwaveAudioEngine>(new BrainwaveAudioEngine(DEFAULT_AUDIO_SETTINGS));
  const [settings, setSettings] = useState<AudioSettings>(() =>
    clampAudioSettings(readLocalJson<AudioSettings>(ACTIVE_SETTINGS_KEY, DEFAULT_AUDIO_SETTINGS)),
  );
  const [playing, setPlaying] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [showPostSessionAd, setShowPostSessionAd] = useState(false);
  const [paywallMessage, setPaywallMessage] = useState<string | null>(null);
  const { tier, entitlements } = usePlanTier();
  const { metrics, recordCompletedSession } = useSessionMetrics();

  useEffect(() => {
    const engine = engineRef.current;
    return () => {
      void engine.destroy();
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(ACTIVE_SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  async function unlockAudio() {
    await engineRef.current.unlock();
    setUnlocked(true);
  }

  async function togglePlay() {
    if (!unlocked) return;
    if (playing) {
      await engineRef.current.stop();
      setPlaying(false);
      setShowPostSessionAd(entitlements.adsEnabled);

      const nextTotal = metrics.totalSessions + 1;
      const nextStreak = metrics.currentStreak + 1;
      recordCompletedSession();

      if (nextTotal === 2) {
        setPaywallMessage("After session #2: upgrade to unlock unlimited preset saving.");
      } else if (nextTotal === 3) {
        setPaywallMessage("After session #3: remove ads and unlock full protocol limits.");
      } else if (nextStreak >= 7) {
        setPaywallMessage("7-day streak unlocked: annual billing offer available now.");
      } else {
        setPaywallMessage(null);
      }
      return;
    }
    setShowPostSessionAd(false);
    await engineRef.current.start(settings);
    setPlaying(true);
  }

  async function patchSettings(partial: Partial<AudioSettings>) {
    const next = clampAudioSettings({ ...settings, ...partial });
    setSettings(next);
    await engineRef.current.update(next);
  }

  function applyDelta(delta: Partial<AudioSettings>) {
    const next = clampAudioSettings({
      ...settings,
      carrierHz: settings.carrierHz + (delta.carrierHz ?? 0),
      entrainmentHz: settings.entrainmentHz + (delta.entrainmentHz ?? 0),
      volume: settings.volume + (delta.volume ?? 0),
      mode: delta.mode ?? settings.mode,
      waveform: delta.waveform ?? settings.waveform,
    });
    void patchSettings(next);
  }

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/65 p-4 shadow-[0_20px_40px_rgba(0,0,0,0.35)] backdrop-blur">
      {!unlocked ? (
        <button
          onClick={unlockAudio}
          className="w-full rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950"
        >
          Tap to Start Audio
        </button>
      ) : (
        <button
          onClick={togglePlay}
          className="w-full rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950"
        >
          {playing ? "Pause Session" : "Start Session"}
        </button>
      )}

      <AdSlot context="pre-session" isFreeTier={entitlements.adsEnabled && !playing} />
      <AdSlot context="post-session" isFreeTier={entitlements.adsEnabled && showPostSessionAd} />

      <section className="rounded-xl border border-cyan-300/20 bg-cyan-400/10 p-3 text-xs text-cyan-100">
        <div className="flex items-center justify-between gap-3">
          <span className="font-semibold uppercase tracking-wide">Plan</span>
          <span className="rounded-full bg-slate-950/40 px-2 py-1 text-[11px]">{tier}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-slate-200">
          <span>Sessions complete: {metrics.totalSessions}</span>
          <span>Streak: {metrics.currentStreak} days</span>
        </div>
      </section>

      {paywallMessage ? (
        <div className="rounded-xl border border-amber-300/35 bg-amber-100/10 p-3 text-xs text-amber-100">
          <p>{paywallMessage}</p>
          <Link
            href="/pricing"
            className="mt-2 inline-block rounded-lg bg-amber-200/20 px-3 py-1 font-semibold text-amber-50"
          >
            View Upgrade Options
          </Link>
        </div>
      ) : null}

      <section className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-3">
        <h2 className="text-sm font-semibold text-slate-100">Mode</h2>
        <div className="grid grid-cols-2 gap-2">
          {MODES.map((mode) => (
            <button
              key={mode}
              onClick={() => void patchSettings({ mode })}
              className={`rounded-lg px-3 py-2 text-xs font-medium ${
                settings.mode === mode
                  ? "bg-cyan-400/30 text-cyan-100"
                  : "bg-slate-800 text-slate-300"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-3">
        <h2 className="text-sm font-semibold text-slate-100">Waveform</h2>
        <div className="grid grid-cols-4 gap-2">
          {WAVEFORMS.map((waveform) => (
            <button
              key={waveform}
              onClick={() => void patchSettings({ waveform })}
              className={`rounded-lg px-2 py-2 text-[11px] font-medium ${
                settings.waveform === waveform
                  ? "bg-cyan-400/30 text-cyan-100"
                  : "bg-slate-800 text-slate-300"
              }`}
            >
              {waveform}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-3">
        <SliderControl
          label="Carrier"
          unit="Hz"
          min={20}
          max={1000}
          step={0.1}
          value={settings.carrierHz}
          onChange={(value) => void patchSettings({ carrierHz: value })}
        />
        <SliderControl
          label={settings.mode === "binaural" ? "Beat" : "Pulse"}
          unit="Hz"
          min={0.1}
          max={40}
          step={0.1}
          value={settings.entrainmentHz}
          onChange={(value) => void patchSettings({ entrainmentHz: value })}
        />
        <SliderControl
          label="Volume"
          unit="%"
          min={1}
          max={100}
          step={1}
          value={Math.round(settings.volume * 100)}
          onChange={(value) => void patchSettings({ volume: value / 100 })}
        />
      </section>

      <section className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-3">
        <h2 className="text-sm font-semibold text-slate-100">QuickTune</h2>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_TUNE.map((item) => (
            <button
              key={item.label}
              onClick={() => applyDelta(item.delta)}
              className="rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-200"
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function clampAudioSettings(next: AudioSettings): AudioSettings {
  return {
    ...next,
    carrierHz: Math.min(1000, Math.max(20, Number(next.carrierHz.toFixed(3)))),
    entrainmentHz: Math.min(40, Math.max(0.1, Number(next.entrainmentHz.toFixed(3)))),
    volume: Math.min(1, Math.max(0.01, Number(next.volume.toFixed(3)))),
  };
}

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}

function SliderControl({ label, value, min, max, step, unit, onChange }: SliderControlProps) {
  return (
    <label className="block space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-100">{label}</span>
        <span className="font-mono text-cyan-100">
          {value.toFixed(2)} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-cyan-300"
      />
    </label>
  );
}
