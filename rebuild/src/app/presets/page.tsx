"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";
import { usePlanTier } from "@/hooks/use-plan-tier";
import {
  CARRIER_MAX_HZ,
  CARRIER_MIN_HZ,
  ENTRAINMENT_MAX_HZ,
  ENTRAINMENT_MIN_HZ,
  clampCarrierHz,
  clampEntrainmentHz,
  clampVolume,
  getHighFrequencyWarning,
} from "@/lib/audio/limits";
import { DEFAULT_AUDIO_SETTINGS, type AudioMode, type Waveform } from "@/lib/audio/types";
import type { GoalTag, PresetRecord } from "@/lib/domain";
import { generateId } from "@/lib/id";

const PRESET_STORAGE_KEY = "bsb_presets";
const ACTIVE_SETTINGS_KEY = "bsb_active_settings";
const MODES: AudioMode[] = ["binaural", "isochronic"];
const WAVEFORMS: Waveform[] = ["sine", "triangle", "square", "sawtooth"];
const TAGS: GoalTag[] = ["sleep", "focus", "calm", "meditation", "custom"];

export default function PresetsPage() {
  const { tier: guestTier, entitlements: guestEntitlements } = usePlanTier();
  const authSession = useAuthSession();
  const usingRemote = authSession.authenticated;
  const tier = usingRemote ? authSession.tier : guestTier;
  const entitlements = usingRemote ? authSession.entitlements : guestEntitlements;

  const [localPresets, setLocalPresets] = useLocalStorageState<PresetRecord[]>(PRESET_STORAGE_KEY, []);
  const [remotePresets, setRemotePresets] = useState<PresetRecord[]>([]);
  const [loadingRemote, setLoadingRemote] = useState(false);

  const [name, setName] = useState("");
  const [mode, setMode] = useState<AudioMode>(DEFAULT_AUDIO_SETTINGS.mode);
  const [waveform, setWaveform] = useState<Waveform>(DEFAULT_AUDIO_SETTINGS.waveform);
  const [carrierHz, setCarrierHz] = useState(DEFAULT_AUDIO_SETTINGS.carrierHz);
  const [entrainmentHz, setEntrainmentHz] = useState(DEFAULT_AUDIO_SETTINGS.entrainmentHz);
  const [volume, setVolume] = useState(DEFAULT_AUDIO_SETTINGS.volume);
  const [selectedTags, setSelectedTags] = useState<GoalTag[]>(["focus"]);
  const [message, setMessage] = useState<string | null>(null);

  const presets = usingRemote ? remotePresets : localPresets;

  const limitReached = useMemo(
    () => presets.length >= entitlements.maxPresets,
    [entitlements.maxPresets, presets.length],
  );

  useEffect(() => {
    if (!usingRemote) return;
    let active = true;

    const load = async () => {
      setLoadingRemote(true);
      try {
        const response = await fetch("/api/presets", { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to load remote presets");
        const data = (await response.json()) as { presets?: PresetRecord[] };
        if (active) setRemotePresets(data.presets ?? []);
      } catch {
        if (active) setMessage("Could not load presets from Supabase.");
      } finally {
        if (active) setLoadingRemote(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [usingRemote]);

  function toggleTag(tag: GoalTag) {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
    );
  }

  async function savePreset() {
    if (!name.trim()) {
      setMessage("Preset name is required.");
      return;
    }

    const sanitizedCarrierHz = clampCarrierHz(carrierHz);
    const sanitizedEntrainmentHz = clampEntrainmentHz(entrainmentHz);
    const sanitizedVolume = clampVolume(volume);

    setCarrierHz(sanitizedCarrierHz);
    setEntrainmentHz(sanitizedEntrainmentHz);
    setVolume(sanitizedVolume);

    if (usingRemote) {
      try {
        const response = await fetch("/api/presets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            tags: selectedTags.length ? selectedTags : ["custom"],
            mode,
            waveform,
            carrierHz: sanitizedCarrierHz,
            entrainmentHz: sanitizedEntrainmentHz,
            volume: sanitizedVolume,
          }),
        });

        const data = (await response.json()) as { ok?: boolean; message?: string; preset?: PresetRecord };
        if (!response.ok || !data.preset) {
          setMessage(data.message ?? "Preset save blocked.");
          return;
        }

        setRemotePresets((current) => [data.preset as PresetRecord, ...current]);
        setMessage(`Saved "${data.preset.name}" to Supabase.`);
        return;
      } catch {
        setMessage("Could not save preset to Supabase.");
        return;
      }
    }

    if (limitReached) {
      setMessage("Preset limit reached on Free. Upgrade to unlock unlimited saves.");
      return;
    }

    const preset: PresetRecord = {
      id: generateId(),
      name: name.trim(),
      tags: selectedTags.length ? selectedTags : ["custom"],
      mode,
      waveform,
      carrierHz: sanitizedCarrierHz,
      entrainmentHz: sanitizedEntrainmentHz,
      volume: sanitizedVolume,
      createdAt: new Date().toISOString(),
    };

    setLocalPresets((current) => [preset, ...current]);
    setMessage(`Saved "${preset.name}".`);
  }

  function loadPreset(preset: PresetRecord) {
    window.localStorage.setItem(
      ACTIVE_SETTINGS_KEY,
      JSON.stringify({
        mode: preset.mode,
        waveform: preset.waveform,
        carrierHz: preset.carrierHz,
        entrainmentHz: preset.entrainmentHz,
        volume: preset.volume,
      }),
    );
    setMessage(`Loaded "${preset.name}" to Player.`);
  }

  async function editPreset(preset: PresetRecord) {
    const nextName = window.prompt("Preset name", preset.name);
    if (!nextName) return;
    const nextTagsInput = window.prompt("Tags (comma separated)", preset.tags.join(","));
    const nextTags = (nextTagsInput ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean) as GoalTag[];

    if (usingRemote) {
      try {
        const response = await fetch("/api/presets", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: preset.id,
            name: nextName,
            tags: nextTags,
          }),
        });

        const data = (await response.json()) as { preset?: PresetRecord; message?: string };
        if (!response.ok || !data.preset) {
          setMessage(data.message ?? "Update failed.");
          return;
        }

        setRemotePresets((current) =>
          current.map((item) => (item.id === data.preset!.id ? data.preset! : item)),
        );
        setMessage(`Updated "${data.preset.name}".`);
      } catch {
        setMessage("Could not update preset.");
      }
      return;
    }

    setLocalPresets((current) =>
      current.map((item) =>
        item.id === preset.id ? { ...item, name: nextName, tags: nextTags } : item,
      ),
    );
    setMessage(`Updated "${nextName}".`);
  }

  async function removePreset(id: string) {
    if (usingRemote) {
      try {
        const response = await fetch(`/api/presets?id=${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const data = (await response.json()) as { message?: string };
          setMessage(data.message ?? "Delete failed.");
          return;
        }

        setRemotePresets((current) => current.filter((preset) => preset.id !== id));
      } catch {
        setMessage("Could not delete preset.");
      }
      return;
    }

    setLocalPresets((current) => current.filter((preset) => preset.id !== id));
  }

  return (
    <section className="mx-auto w-full max-w-screen-sm space-y-4 px-4 pb-28 pt-4">
      <header>
        <h1 className="font-display text-2xl font-semibold text-white">Presets</h1>
        <p className="mt-2 text-sm text-slate-200/80">
          Save and recall your best protocols. Tier <span className="font-semibold">{tier}</span>:
          {" "}
          {entitlements.maxPresets === 9999 ? "Unlimited presets" : `${entitlements.maxPresets} presets max`}.
        </p>
        <p className="mt-1 text-xs text-slate-300">
          Source: {usingRemote ? "Supabase authenticated storage" : "Local guest storage"}
        </p>
      </header>

      <article className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <h2 className="text-sm font-semibold text-cyan-100">Create Preset</h2>
        <label className="block space-y-1 text-xs text-slate-300">
          Name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Night Focus Ramp"
            className="w-full rounded-lg border border-white/15 bg-slate-900/80 px-3 py-2 text-sm text-white"
          />
        </label>

        <div className="grid grid-cols-2 gap-2">
          <SelectField<AudioMode> label="Mode" value={mode} onChange={setMode} options={MODES} />
          <SelectField<Waveform> label="Waveform" value={waveform} onChange={setWaveform} options={WAVEFORMS} />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <NumberField
            label="Carrier Hz"
            value={carrierHz}
            step={1}
            min={CARRIER_MIN_HZ}
            max={CARRIER_MAX_HZ}
            onChange={setCarrierHz}
          />
          <NumberField
            label="Entrain Hz"
            value={entrainmentHz}
            step={0.1}
            min={ENTRAINMENT_MIN_HZ}
            max={ENTRAINMENT_MAX_HZ}
            onChange={setEntrainmentHz}
          />
          <NumberField label="Volume" value={volume} step={0.01} min={0.01} max={1} onChange={setVolume} />
        </div>

        {getHighFrequencyWarning(carrierHz) ? (
          <p className="rounded-lg border border-rose-300/35 bg-rose-950/30 px-3 py-2 text-[11px] text-rose-100">
            {getHighFrequencyWarning(carrierHz)}
          </p>
        ) : null}

        <div className="space-y-1">
          <p className="text-xs text-slate-300">Tags</p>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full px-3 py-1 text-xs ${
                    active ? "bg-cyan-400/30 text-cyan-100" : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => void savePreset()}
          className="w-full rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950"
        >
          Save Preset
        </button>

        {message ? <p className="text-xs text-cyan-100">{message}</p> : null}
      </article>

      {limitReached ? (
        <div className="rounded-2xl border border-amber-300/40 bg-amber-100/10 p-4 text-sm text-amber-100">
          <p>Free tier reached its preset cap. Upgrade to unlock unlimited saves.</p>
          <Link href="/pricing" className="mt-3 inline-block rounded-lg bg-amber-200/20 px-3 py-1 font-semibold">
            Upgrade Plan
          </Link>
        </div>
      ) : null}

      <article className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
        <h2 className="text-sm font-semibold text-cyan-100">Saved Presets ({presets.length})</h2>
        {loadingRemote ? <p className="text-xs text-slate-400">Loading from Supabase...</p> : null}
        {presets.length === 0 && !loadingRemote ? (
          <p className="text-xs text-slate-400">No presets saved yet.</p>
        ) : (
          <ul className="space-y-2">
            {presets.map((preset) => (
              <li key={preset.id} className="rounded-xl border border-white/10 bg-slate-900/70 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{preset.name}</h3>
                    <p className="text-xs text-slate-300">
                      {preset.mode} · {preset.waveform} · {preset.carrierHz}Hz · {preset.entrainmentHz}Hz
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">{preset.tags.join(", ")}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => loadPreset(preset)}
                      className="rounded-lg bg-cyan-400/20 px-2 py-1 text-[11px] text-cyan-100"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => void editPreset(preset)}
                      className="rounded-lg bg-indigo-400/20 px-2 py-1 text-[11px] text-indigo-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => void removePreset(preset.id)}
                      className="rounded-lg bg-rose-400/20 px-2 py-1 text-[11px] text-rose-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </article>
    </section>
  );
}

interface SelectFieldProps<T extends string> {
  label: string;
  value: T;
  options: T[];
  onChange: (value: T) => void;
}

function SelectField<T extends string>({ label, value, options, onChange }: SelectFieldProps<T>) {
  return (
    <label className="space-y-1 text-xs text-slate-300">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="w-full rounded-lg border border-white/15 bg-slate-900/80 px-3 py-2 text-sm text-white"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

interface NumberFieldProps {
  label: string;
  value: number;
  step: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

function NumberField({ label, value, step, min, max, onChange }: NumberFieldProps) {
  return (
    <label className="space-y-1 text-xs text-slate-300">
      <span>{label}</span>
      <input
        type="number"
        value={value}
        step={step}
        min={min}
        max={max}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (Number.isFinite(next)) onChange(next);
        }}
        className="w-full rounded-lg border border-white/15 bg-slate-900/80 px-3 py-2 text-sm text-white"
      />
    </label>
  );
}
