"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";
import { usePlanTier } from "@/hooks/use-plan-tier";
import { BrainwaveAudioEngine } from "@/lib/audio/engine";
import {
  CARRIER_MAX_HZ,
  CARRIER_MIN_HZ,
  ENTRAINMENT_MAX_HZ,
  ENTRAINMENT_MIN_HZ,
  HIGH_FREQUENCY_WARNING_HZ,
  clampCarrierHz,
  clampEntrainmentHz,
  clampVolume,
  getHighFrequencyWarning,
} from "@/lib/audio/limits";
import { getBand } from "@/lib/audio/bands";
import { DEFAULT_AUDIO_SETTINGS, type AudioSettings } from "@/lib/audio/types";
import type { GoalTag, ProgramRecord, ProgramWaypoint } from "@/lib/domain";
import { generateId } from "@/lib/id";

const PROGRAMS_STORAGE_KEY = "bsb_programs";
const GOAL_TAGS: GoalTag[] = ["sleep", "focus", "calm", "meditation", "custom"];

function toAudioSettings(waypoint: ProgramWaypoint): AudioSettings {
  return {
    mode: waypoint.mode,
    waveform: waypoint.waveform,
    carrierHz: waypoint.carrierHz,
    entrainmentHz: waypoint.entrainmentHz,
    volume: waypoint.volume,
  };
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function ProgramsPage() {
  const engineRef = useRef(new BrainwaveAudioEngine(DEFAULT_AUDIO_SETTINGS));
  const abortRef = useRef(false);
  const unlockedRef = useRef(false);

  const { entitlements: guestEntitlements } = usePlanTier();
  const authSession = useAuthSession();
  const usingRemote = authSession.authenticated;
  const entitlements = usingRemote ? authSession.entitlements : guestEntitlements;

  const [localPrograms, setLocalPrograms] = useLocalStorageState<ProgramRecord[]>(PROGRAMS_STORAGE_KEY, []);
  const [remotePrograms, setRemotePrograms] = useState<ProgramRecord[]>([]);
  const [loadingRemote, setLoadingRemote] = useState(false);

  const programs = usingRemote ? remotePrograms : localPrograms;

  const [runningProgramId, setRunningProgramId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [goalTag, setGoalTag] = useState<GoalTag>("focus");
  const [waypoints, setWaypoints] = useState<ProgramWaypoint[]>([
    {
      id: generateId(),
      durationMinutes: 5,
      mode: "binaural",
      waveform: "sine",
      carrierHz: 220,
      entrainmentHz: 8,
      volume: 0.5,
      transitionType: "step",
    },
  ]);

  useEffect(() => {
    if (!usingRemote) return;
    let active = true;

    const load = async () => {
      setLoadingRemote(true);
      try {
        const response = await fetch("/api/programs", { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to load programs");
        const data = (await response.json()) as { programs?: ProgramRecord[] };
        if (active) setRemotePrograms(data.programs ?? []);
      } catch {
        if (active) setMessage("Your synced journeys could not be reached just now.");
      } finally {
        if (active) setLoadingRemote(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [usingRemote]);

  function addWaypoint() {
    if (waypoints.length >= entitlements.maxWaypoints) {
      setMessage("The free plan allows three phases per journey. Premium opens the path.");
      return;
    }

    const previous = waypoints[waypoints.length - 1];
    setWaypoints((current) => [
      ...current,
      {
        ...previous,
        id: generateId(),
        transitionType: "ramp",
      },
    ]);
  }

  function updateWaypoint(id: string, patch: Partial<ProgramWaypoint>) {
    const normalized: Partial<ProgramWaypoint> = { ...patch };
    if (typeof patch.durationMinutes === "number") {
      normalized.durationMinutes = Math.max(1, Math.round(patch.durationMinutes));
    }
    if (typeof patch.carrierHz === "number") {
      normalized.carrierHz = clampCarrierHz(patch.carrierHz);
    }
    if (typeof patch.entrainmentHz === "number") {
      normalized.entrainmentHz = clampEntrainmentHz(patch.entrainmentHz);
    }
    if (typeof patch.volume === "number") {
      normalized.volume = clampVolume(patch.volume);
    }

    setWaypoints((current) =>
      current.map((waypoint) => (waypoint.id === id ? { ...waypoint, ...normalized } : waypoint)),
    );
  }

  function removeWaypoint(id: string) {
    setWaypoints((current) => current.filter((waypoint) => waypoint.id !== id));
  }

  async function saveProgram() {
    if (!name.trim()) {
      setMessage("Give your journey a name first.");
      return;
    }

    const normalizedWaypoints = waypoints.map((waypoint) => ({
      ...waypoint,
      durationMinutes: Math.max(1, Math.round(waypoint.durationMinutes)),
      carrierHz: clampCarrierHz(waypoint.carrierHz),
      entrainmentHz: clampEntrainmentHz(waypoint.entrainmentHz),
      volume: clampVolume(waypoint.volume),
    }));
    setWaypoints(normalizedWaypoints);

    if (usingRemote) {
      try {
        const response = await fetch("/api/programs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            goalTag,
            waypoints: normalizedWaypoints.map((waypoint) => ({
              durationMinutes: waypoint.durationMinutes,
              mode: waypoint.mode,
              waveform: waypoint.waveform,
              carrierHz: waypoint.carrierHz,
              entrainmentHz: waypoint.entrainmentHz,
              volume: waypoint.volume,
              transitionType: waypoint.transitionType,
            })),
          }),
        });

        const data = (await response.json()) as { ok?: boolean; message?: string; program?: ProgramRecord; code?: string };
        if (!response.ok || !data.program) {
          if (data.code === "waypoint_limit_reached") {
            setMessage("That journey has more phases than your plan allows.");
          } else {
            setMessage(data.message ?? "That journey could not be saved.");
          }
          return;
        }

        setRemotePrograms((current) => [data.program!, ...current]);
        setMessage(`"${data.program.name}" saved to your journeys.`);
        return;
      } catch {
        setMessage("That journey could not be saved just now.");
        return;
      }
    }

    if (programs.length >= entitlements.maxPrograms) {
      setMessage("The free plan holds one journey. Premium holds as many as you can dream.");
      return;
    }

    if (normalizedWaypoints.length > entitlements.maxWaypoints) {
      setMessage("That journey has more phases than the free plan allows.");
      return;
    }

    const next: ProgramRecord = {
      id: generateId(),
      name: name.trim(),
      goalTag,
      waypoints: normalizedWaypoints,
      createdAt: new Date().toISOString(),
    };

    setLocalPrograms((current) => [next, ...current]);
    setMessage(`"${next.name}" saved with ${next.waypoints.length} phases.`);
  }

  async function removeProgram(id: string) {
    if (usingRemote) {
      try {
        const response = await fetch(`/api/programs?id=${id}`, { method: "DELETE" });
        if (!response.ok) {
          const data = (await response.json()) as { message?: string };
          setMessage(data.message ?? "That journey could not be removed.");
          return;
        }
        setRemotePrograms((current) => current.filter((program) => program.id !== id));
      } catch {
        setMessage("That journey could not be removed just now.");
      }
      return;
    }

    setLocalPrograms((current) => current.filter((program) => program.id !== id));
  }

  async function runProgram(program: ProgramRecord) {
    if (!unlockedRef.current) {
      await engineRef.current.unlock();
      unlockedRef.current = true;
    }

    abortRef.current = false;
    setRunningProgramId(program.id);
    setMessage(`"${program.name}" has begun.`);

    try {
      await engineRef.current.start(toAudioSettings(program.waypoints[0]));

      for (let index = 0; index < program.waypoints.length; index += 1) {
        if (abortRef.current) break;

        const waypoint = program.waypoints[index];
        const previous = program.waypoints[index - 1];

        if (waypoint.transitionType === "ramp" && previous) {
          const steps = 20;
          for (let step = 1; step <= steps; step += 1) {
            if (abortRef.current) break;
            const t = step / steps;
            const interpolated: AudioSettings = {
              mode: waypoint.mode,
              waveform: waypoint.waveform,
              carrierHz: previous.carrierHz + (waypoint.carrierHz - previous.carrierHz) * t,
              entrainmentHz:
                previous.entrainmentHz + (waypoint.entrainmentHz - previous.entrainmentHz) * t,
              volume: previous.volume + (waypoint.volume - previous.volume) * t,
            };
            await engineRef.current.update(interpolated);
            await wait(200);
          }
        } else {
          await engineRef.current.update(toAudioSettings(waypoint));
        }

        const durationMs = Math.max(1000, waypoint.durationMinutes * 60000);
        await wait(durationMs);
      }

      await engineRef.current.stop();
      setMessage(`"${program.name}" is complete.`);
    } catch (error) {
      const text = error instanceof Error ? error.message : "The journey could not continue.";
      setMessage(text);
    } finally {
      setRunningProgramId(null);
    }
  }

  async function stopProgram() {
    abortRef.current = true;
    await engineRef.current.stop();
    setRunningProgramId(null);
    setMessage("Journey ended early. The silence is yours.");
  }

  return (
    <section className="mx-auto w-full max-w-screen-sm space-y-5 px-5 pb-32 pt-6">
      <header>
        <h1 className="h-display text-[1.75rem]">Journeys</h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          Multi-phase sessions that guide you down, hold you there, and bring you back.
        </p>
      </header>

      {runningProgramId ? (
        <button onClick={() => void stopProgram()} className="btn-quiet w-full text-warn">
          End Journey
        </button>
      ) : null}

      <article className="card space-y-4">
        <h2 className="h-display text-xl">Design a journey</h2>

        <label className="label space-y-1.5">
          Name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Evening Descent"
            className="field"
          />
        </label>

        <label className="label space-y-1.5">
          Intention
          <select
            value={goalTag}
            onChange={(event) => setGoalTag(event.target.value as GoalTag)}
            className="field"
          >
            {GOAL_TAGS.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </label>

        <div className="space-y-2.5">
          {waypoints.map((waypoint, index) => (
            <div
              key={waypoint.id}
              className="rounded-2xl border border-[var(--hairline-soft)] bg-[rgba(11,9,18,0.45)] p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm text-gold-bright">
                  Phase {index + 1}
                  <span className="ml-2 text-[11px] text-ink-faint">
                    {getBand(waypoint.entrainmentHz).name.toLowerCase()} territory
                  </span>
                </p>
                {waypoints.length > 1 ? (
                  <button
                    onClick={() => removeWaypoint(waypoint.id)}
                    className="text-[11px] text-ink-faint hover:text-warn"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <SmallNumber
                  label="Minutes"
                  value={waypoint.durationMinutes}
                  step={1}
                  min={1}
                  max={720}
                  onChange={(value) => updateWaypoint(waypoint.id, { durationMinutes: value })}
                />
                <SmallNumber
                  label="Carrier Hz"
                  value={waypoint.carrierHz}
                  step={1}
                  min={CARRIER_MIN_HZ}
                  max={CARRIER_MAX_HZ}
                  onChange={(value) => updateWaypoint(waypoint.id, { carrierHz: value })}
                />
                <SmallNumber
                  label="Beat Hz"
                  value={waypoint.entrainmentHz}
                  step={0.1}
                  min={ENTRAINMENT_MIN_HZ}
                  max={ENTRAINMENT_MAX_HZ}
                  onChange={(value) => updateWaypoint(waypoint.id, { entrainmentHz: value })}
                />
                <SmallNumber
                  label="Volume"
                  value={waypoint.volume}
                  step={0.01}
                  min={0.01}
                  max={1}
                  onChange={(value) => updateWaypoint(waypoint.id, { volume: value })}
                />
                <SmallSelect
                  label="Method"
                  value={waypoint.mode}
                  options={["binaural", "isochronic"]}
                  onChange={(value) => updateWaypoint(waypoint.id, { mode: value })}
                />
                <SmallSelect
                  label="Arrival"
                  value={waypoint.transitionType}
                  options={["step", "ramp"]}
                  onChange={(value) => updateWaypoint(waypoint.id, { transitionType: value })}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={addWaypoint} className="btn-quiet text-xs">
            Add Phase
          </button>
          <button onClick={() => void saveProgram()} className="btn-gold text-xs">
            Save Journey
          </button>
        </div>

        {message ? <p className="text-xs text-gold-bright">{message}</p> : null}
        {waypoints.some((waypoint) => waypoint.carrierHz >= HIGH_FREQUENCY_WARNING_HZ) ? (
          <p className="rounded-xl border border-[rgba(217,141,141,0.3)] px-3 py-2 text-[11px] text-warn">
            {getHighFrequencyWarning(waypoints.reduce((max, waypoint) => Math.max(max, waypoint.carrierHz), 0))}
          </p>
        ) : null}
      </article>

      {waypoints.length >= entitlements.maxWaypoints && entitlements.maxWaypoints !== 9999 ? (
        <div className="card-gold text-sm">
          <p>Longer journeys, with as many phases as the night requires, come with Premium.</p>
          <Link href="/pricing" className="btn-quiet mt-3 text-xs">
            See Premium
          </Link>
        </div>
      ) : null}

      <article className="card space-y-3">
        <h2 className="h-display text-xl">
          Saved journeys <span className="text-ink-faint">({programs.length})</span>
        </h2>
        {loadingRemote ? <p className="text-xs text-ink-faint">Gathering your journeys…</p> : null}
        {programs.length === 0 && !loadingRemote ? (
          <p className="text-sm text-ink-faint">
            No journeys yet. Design one above, phase by phase.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {programs.map((program) => (
              <li
                key={program.id}
                className="rounded-2xl border border-[var(--hairline-soft)] bg-[rgba(11,9,18,0.45)] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-[15px] font-medium text-ink">{program.name}</h3>
                    <p className="mt-0.5 text-xs text-ink-faint">
                      {program.goalTag} · {program.waypoints.length} phases ·{" "}
                      {program.waypoints.reduce((sum, w) => sum + w.durationMinutes, 0)} min
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => void runProgram(program)}
                      disabled={runningProgramId !== null}
                      className="btn-gold px-4 py-1.5 text-xs"
                    >
                      {runningProgramId === program.id ? "In motion" : "Begin"}
                    </button>
                    <button
                      onClick={() => void removeProgram(program.id)}
                      className="text-[11px] text-ink-faint hover:text-warn"
                    >
                      Remove
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

interface SmallNumberProps {
  label: string;
  value: number;
  step: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

function SmallNumber({ label, value, step, min, max, onChange }: SmallNumberProps) {
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

interface SmallSelectProps<T extends string> {
  label: string;
  value: T;
  options: T[];
  onChange: (value: T) => void;
}

function SmallSelect<T extends string>({ label, value, options, onChange }: SmallSelectProps<T>) {
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
