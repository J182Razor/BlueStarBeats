"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Headphones, SpeakerHigh } from "@/components/icons";
import { AdSlot } from "@/components/monetization/ad-slot";
import { usePlanTier } from "@/hooks/use-plan-tier";
import { useSessionMetrics } from "@/hooks/use-session-metrics";
import { BrainwaveAudioEngine } from "@/lib/audio/engine";
import {
  CARRIER_MAX_HZ,
  CARRIER_MIN_HZ,
  ENTRAINMENT_MAX_HZ,
  ENTRAINMENT_MIN_HZ,
  clampAudioSettings,
  getHighFrequencyWarning,
} from "@/lib/audio/limits";
import { getBand, INTENTIONS, SOLFEGGIO_TONES } from "@/lib/audio/bands";
import {
  DEFAULT_AUDIO_SETTINGS,
  type AudioMode,
  type AudioSettings,
  type Waveform,
} from "@/lib/audio/types";
import { readLocalJson } from "@/lib/storage";

const ACTIVE_SETTINGS_KEY = "bsb_active_settings";

const MODES: Array<{ value: AudioMode; label: string; hint: string }> = [
  { value: "binaural", label: "Binaural", hint: "headphones" },
  { value: "isochronic", label: "Isochronic", hint: "speakers welcome" },
];

const WAVEFORMS: Array<{ value: Waveform; label: string }> = [
  { value: "sine", label: "Pure" },
  { value: "triangle", label: "Soft" },
  { value: "square", label: "Pulse" },
  { value: "sawtooth", label: "Rich" },
];

const FINE_TUNE: Array<{ label: string; delta: Partial<AudioSettings> }> = [
  { label: "Deeper", delta: { entrainmentHz: -1.5, carrierHz: -8 } },
  { label: "Lighter", delta: { entrainmentHz: 1.5, carrierHz: 6 } },
  { label: "Calmer", delta: { entrainmentHz: -0.8 } },
  { label: "Brighter", delta: { entrainmentHz: 1.2 } },
];

/* Carrier slider uses a log scale so the musical range stays easy to reach. */
const CARRIER_SLIDER_STEPS = 1000;
const CARRIER_LOG_RATIO = Math.log(CARRIER_MAX_HZ / CARRIER_MIN_HZ);

function carrierToSlider(hz: number) {
  return Math.round((Math.log(hz / CARRIER_MIN_HZ) / CARRIER_LOG_RATIO) * CARRIER_SLIDER_STEPS);
}

function sliderToCarrier(position: number) {
  return Math.round(CARRIER_MIN_HZ * Math.exp((position / CARRIER_SLIDER_STEPS) * CARRIER_LOG_RATIO));
}

export function PlayerStudio() {
  const engineRef = useRef<BrainwaveAudioEngine>(new BrainwaveAudioEngine(DEFAULT_AUDIO_SETTINGS));
  const unlockedRef = useRef(false);
  const [settings, setSettings] = useState<AudioSettings>(() =>
    clampAudioSettings(readLocalJson<AudioSettings>(ACTIVE_SETTINGS_KEY, DEFAULT_AUDIO_SETTINGS)),
  );
  const [playing, setPlaying] = useState(false);
  const [showPostSessionAd, setShowPostSessionAd] = useState(false);
  const [upgradeNote, setUpgradeNote] = useState<string | null>(null);
  const [safetyMessage, setSafetyMessage] = useState<string | null>(() =>
    getHighFrequencyWarning(settings.carrierHz),
  );
  const { tier, entitlements } = usePlanTier();
  const { metrics, recordCompletedSession } = useSessionMetrics();

  const band = getBand(settings.entrainmentHz);

  useEffect(() => {
    const engine = engineRef.current;
    return () => {
      void engine.destroy();
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(ACTIVE_SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  async function togglePlay() {
    if (!unlockedRef.current) {
      await engineRef.current.unlock();
      unlockedRef.current = true;
    }

    if (playing) {
      await engineRef.current.stop();
      setPlaying(false);
      setShowPostSessionAd(entitlements.adsEnabled);

      const nextTotal = metrics.totalSessions + 1;
      const nextStreak = metrics.currentStreak + 1;
      recordCompletedSession();

      if (nextTotal === 2) {
        setUpgradeNote("Your library can hold more than three presets. Premium removes the limit.");
      } else if (nextTotal === 3) {
        setUpgradeNote("Premium clears away sponsor messages and opens every limit.");
      } else if (nextStreak >= 7) {
        setUpgradeNote("Seven days in a row. The yearly plan honors a practice like that.");
      } else {
        setUpgradeNote(null);
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
    setSafetyMessage(getHighFrequencyWarning(next.carrierHz));
    await engineRef.current.update(next);
  }

  function applyDelta(delta: Partial<AudioSettings>) {
    void patchSettings({
      carrierHz: settings.carrierHz + (delta.carrierHz ?? 0),
      entrainmentHz: settings.entrainmentHz + (delta.entrainmentHz ?? 0),
    });
  }

  return (
    <div className="mt-5 space-y-5">
      <div className="flex flex-wrap gap-2">
        {INTENTIONS.map((intention) => {
          const active =
            settings.entrainmentHz === intention.settings.entrainmentHz &&
            settings.carrierHz === intention.settings.carrierHz;
          return (
            <button
              key={intention.id}
              onClick={() => void patchSettings(intention.settings)}
              title={intention.detail}
              className={`chip ${active ? "chip-active" : ""}`}
            >
              {intention.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col items-center pb-1 pt-4">
        <button
          onClick={() => void togglePlay()}
          className={`orb ${playing ? "orb-live" : ""}`}
          aria-label={playing ? "Pause session" : "Begin session"}
        >
          <span className="hz-readout text-[2.6rem] leading-none text-ink">
            {settings.entrainmentHz.toFixed(settings.entrainmentHz < 10 ? 1 : 0)}
          </span>
          <span className="text-xs tracking-[0.18em] text-gold">HZ · {band.name.toUpperCase()}</span>
          <span className="mt-1.5 text-[11px] text-ink-muted">
            {playing ? "tap to rest" : "tap to begin"}
          </span>
        </button>
        <p className="mt-5 text-sm text-ink-muted">
          <span className="text-gold-bright">{band.name}</span> waves carry {band.state}.
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-faint">
          {settings.mode === "binaural" ? (
            <>
              <Headphones size={14} /> Stereo headphones required for binaural depth
            </>
          ) : (
            <>
              <SpeakerHigh size={14} /> Isochronic pulses carry over speakers
            </>
          )}
        </p>
      </div>

      <AdSlot context="pre-session" isFreeTier={entitlements.adsEnabled && !playing} />
      <AdSlot context="post-session" isFreeTier={entitlements.adsEnabled && showPostSessionAd} />

      {upgradeNote ? (
        <div className="card-gold text-sm text-ink">
          <p>{upgradeNote}</p>
          <Link href="/pricing" className="btn-quiet mt-3 text-xs">
            See Premium
          </Link>
        </div>
      ) : null}

      {safetyMessage ? (
        <div className="card border-[rgba(217,141,141,0.3)] text-xs text-warn">
          <p className="font-medium">Listen gently</p>
          <p className="mt-1 text-[rgba(217,141,141,0.85)]">{safetyMessage}</p>
        </div>
      ) : null}

      <section className="card space-y-5">
        <SliderControl
          label={settings.mode === "binaural" ? "Beat" : "Pulse"}
          display={`${settings.entrainmentHz.toFixed(1)} Hz`}
          min={ENTRAINMENT_MIN_HZ}
          max={ENTRAINMENT_MAX_HZ}
          step={0.1}
          value={settings.entrainmentHz}
          onChange={(value) => void patchSettings({ entrainmentHz: value })}
        />
        <SliderControl
          label="Carrier"
          display={`${Math.round(settings.carrierHz)} Hz`}
          min={0}
          max={CARRIER_SLIDER_STEPS}
          step={1}
          value={carrierToSlider(settings.carrierHz)}
          onChange={(value) => void patchSettings({ carrierHz: sliderToCarrier(value) })}
        />
        <SliderControl
          label="Volume"
          display={`${Math.round(settings.volume * 100)}%`}
          min={1}
          max={100}
          step={1}
          value={Math.round(settings.volume * 100)}
          onChange={(value) => void patchSettings({ volume: value / 100 })}
        />
      </section>

      <section className="card space-y-4">
        <div>
          <p className="label mb-2">Method</p>
          <div className="grid grid-cols-2 gap-2">
            {MODES.map((mode) => (
              <button
                key={mode.value}
                onClick={() => void patchSettings({ mode: mode.value })}
                className={`chip flex flex-col items-center py-2.5 ${
                  settings.mode === mode.value ? "chip-active" : ""
                }`}
              >
                <span className="text-sm">{mode.label}</span>
                <span className="text-[10px] opacity-70">{mode.hint}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="label mb-2">Tone character</p>
          <div className="grid grid-cols-4 gap-2">
            {WAVEFORMS.map((waveform) => (
              <button
                key={waveform.value}
                onClick={() => void patchSettings({ waveform: waveform.value })}
                className={`chip px-2 text-center text-xs ${
                  settings.waveform === waveform.value ? "chip-active" : ""
                }`}
              >
                {waveform.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="label mb-2">Sacred carriers</p>
          <div className="grid grid-cols-6 gap-1.5">
            {SOLFEGGIO_TONES.map((tone) => (
              <button
                key={tone.hz}
                onClick={() => void patchSettings({ carrierHz: tone.hz })}
                title={tone.theme}
                className={`chip px-1 text-center text-xs ${
                  Math.round(settings.carrierHz) === tone.hz ? "chip-active" : ""
                }`}
              >
                {tone.hz}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-ink-faint">
            The six solfeggio tones, ready as carrier frequencies.
          </p>
        </div>
        <div>
          <p className="label mb-2">Fine tune</p>
          <div className="grid grid-cols-4 gap-2">
            {FINE_TUNE.map((item) => (
              <button
                key={item.label}
                onClick={() => applyDelta(item.delta)}
                className="chip px-2 text-center text-xs"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <p className="text-center text-[11px] text-ink-faint">
        {tier === "free" ? "Free plan" : "Premium"} · {metrics.totalSessions} sessions ·{" "}
        {metrics.currentStreak} day streak
      </p>
    </div>
  );
}

interface SliderControlProps {
  label: string;
  display: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

function SliderControl({ label, display, value, min, max, step, onChange }: SliderControlProps) {
  return (
    <label className="block space-y-1.5">
      <div className="flex items-baseline justify-between">
        <span className="label">{label}</span>
        <span className="hz-readout text-lg text-gold-bright">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}
