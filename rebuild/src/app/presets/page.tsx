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
import { getBand } from "@/lib/audio/bands";
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
  void tier;

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

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editTags, setEditTags] = useState<GoalTag[]>([]);

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
        if (active) setMessage("Your synced presets could not be reached just now.");
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

  function toggleEditTag(tag: GoalTag) {
    setEditTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
    );
  }

  async function savePreset() {
    if (!name.trim()) {
      setMessage("Give your preset a name first.");
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
          setMessage(data.message ?? "That preset could not be saved.");
          return;
        }

        setRemotePresets((current) => [data.preset as PresetRecord, ...current]);
        setMessage(`"${data.preset.name}" saved to your library.`);
        return;
      } catch {
        setMessage("That preset could not be saved just now.");
        return;
      }
    }

    if (limitReached) {
      setMessage("The free plan holds three presets. Premium removes the limit.");
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
    setMessage(`"${preset.name}" saved to your library.`);
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
    setMessage(`"${preset.name}" is set in the Studio.`);
  }

  function beginEdit(preset: PresetRecord) {
    setEditingId(preset.id);
    setEditName(preset.name);
    setEditTags(preset.tags);
  }

  async function commitEdit(preset: PresetRecord) {
    const nextName = editName.trim();
    if (!nextName) {
      setMessage("A preset needs a name.");
      return;
    }
    const nextTags = editTags.length ? editTags : (["custom"] as GoalTag[]);

    if (usingRemote) {
      try {
        const response = await fetch("/api/presets", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: preset.id, name: nextName, tags: nextTags }),
        });

        const data = (await response.json()) as { preset?: PresetRecord; message?: string };
        if (!response.ok || !data.preset) {
          setMessage(data.message ?? "That change could not be saved.");
          return;
        }

        setRemotePresets((current) =>
          current.map((item) => (item.id === data.preset!.id ? data.preset! : item)),
        );
      } catch {
        setMessage("That change could not be saved just now.");
        return;
      }
    } else {
      setLocalPresets((current) =>
        current.map((item) =>
          item.id === preset.id ? { ...item, name: nextName, tags: nextTags } : item,
        ),
      );
    }

    setEditingId(null);
    setMessage(`"${nextName}" updated.`);
  }

  async function removePreset(id: string) {
    if (usingRemote) {
      try {
        const response = await fetch(`/api/presets?id=${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const data = (await response.json()) as { message?: string };
          setMessage(data.message ?? "That preset could not be removed.");
          return;
        }

        setRemotePresets((current) => current.filter((preset) => preset.id !== id));
      } catch {
        setMessage("That preset could not be removed just now.");
      }
      return;
    }

    setLocalPresets((current) => current.filter((preset) => preset.id !== id));
  }

  return (
    <section className="mx-auto w-full max-w-screen-sm space-y-5 px-5 pb-32 pt-6">
      <header>
        <h1 className="h-display text-[1.75rem]">Your library</h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          The frequencies you return to, kept exactly as you tuned them.
          {usingRemote ? " Synced to your account." : " Stored on this device until you sign in."}
        </p>
      </header>

      <article className="card space-y-4">
        <h2 className="h-display text-xl">Compose a preset</h2>
        <label className="label space-y-1.5">
          Name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Night Descent"
            className="field"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <SelectField<AudioMode> label="Method" value={mode} onChange={setMode} options={MODES} />
          <SelectField<Waveform> label="Tone" value={waveform} onChange={setWaveform} options={WAVEFORMS} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <NumberField
            label="Carrier Hz"
            value={carrierHz}
            step={1}
            min={CARRIER_MIN_HZ}
            max={CARRIER_MAX_HZ}
            onChange={setCarrierHz}
          />
          <NumberField
            label="Beat Hz"
            value={entrainmentHz}
            step={0.1}
            min={ENTRAINMENT_MIN_HZ}
            max={ENTRAINMENT_MAX_HZ}
            onChange={setEntrainmentHz}
          />
          <NumberField label="Volume" value={volume} step={0.01} min={0.01} max={1} onChange={setVolume} />
        </div>

        <p className="text-[11px] text-ink-faint">
          {getBand(entrainmentHz).name} territory: {getBand(entrainmentHz).state}.
        </p>

        {getHighFrequencyWarning(carrierHz) ? (
          <p className="rounded-xl border border-[rgba(217,141,141,0.3)] px-3 py-2 text-[11px] text-warn">
            {getHighFrequencyWarning(carrierHz)}
          </p>
        ) : null}

        <div className="space-y-1.5">
          <p className="label">Tags</p>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`chip text-xs ${selectedTags.includes(tag) ? "chip-active" : ""}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <button onClick={() => void savePreset()} className="btn-gold w-full">
          Save to Library
        </button>

        {message ? <p className="text-xs text-gold-bright">{message}</p> : null}
      </article>

      {limitReached && entitlements.maxPresets !== 9999 ? (
        <div className="card-gold text-sm">
          <p>Your free library is full. Premium holds an unlimited collection.</p>
          <Link href="/pricing" className="btn-quiet mt-3 text-xs">
            See Premium
          </Link>
        </div>
      ) : null}

      <article className="card space-y-3">
        <h2 className="h-display text-xl">
          Saved presets <span className="text-ink-faint">({presets.length})</span>
        </h2>
        {loadingRemote ? <p className="text-xs text-ink-faint">Gathering your library…</p> : null}
        {presets.length === 0 && !loadingRemote ? (
          <p className="text-sm text-ink-faint">
            Nothing here yet. Tune something in the Studio, then keep it.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {presets.map((preset) => (
              <li
                key={preset.id}
                className="rounded-2xl border border-[var(--hairline-soft)] bg-[rgba(11,9,18,0.45)] p-4"
              >
                {editingId === preset.id ? (
                  <div className="space-y-3">
                    <input
                      value={editName}
                      onChange={(event) => setEditName(event.target.value)}
                      className="field"
                    />
                    <div className="flex flex-wrap gap-2">
                      {TAGS.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleEditTag(tag)}
                          className={`chip text-xs ${editTags.includes(tag) ? "chip-active" : ""}`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => void commitEdit(preset)} className="btn-gold flex-1 text-xs">
                        Save
                      </button>
                      <button onClick={() => setEditingId(null)} className="btn-quiet flex-1 text-xs">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-[15px] font-medium text-ink">{preset.name}</h3>
                      <p className="hz-readout mt-0.5 text-sm text-gold-bright">
                        {preset.entrainmentHz} Hz {getBand(preset.entrainmentHz).name.toLowerCase()} ·{" "}
                        {Math.round(preset.carrierHz)} Hz carrier
                      </p>
                      <p className="mt-1 text-[11px] text-ink-faint">
                        {preset.mode} · {preset.tags.join(", ")}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <button onClick={() => loadPreset(preset)} className="btn-quiet px-3 py-1 text-[11px]">
                        Tune In
                      </button>
                      <div className="flex gap-2 text-[11px] text-ink-faint">
                        <button onClick={() => beginEdit(preset)} className="hover:text-ink-muted">
                          Edit
                        </button>
                        <button
                          onClick={() => void removePreset(preset.id)}
                          className="hover:text-warn"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                )}
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
    <label className="label space-y-1.5">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="field"
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
    <label className="label space-y-1.5">
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
        className="field"
      />
    </label>
  );
}
