"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";
import { usePlanTier } from "@/hooks/use-plan-tier";
import { BrainwaveAudioEngine } from "@/lib/audio/engine";
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

  const { tier: guestTier, entitlements: guestEntitlements } = usePlanTier();
  const authSession = useAuthSession();
  const usingRemote = authSession.authenticated;
  const tier = usingRemote ? authSession.tier : guestTier;
  const entitlements = usingRemote ? authSession.entitlements : guestEntitlements;

  const [localPrograms, setLocalPrograms] = useLocalStorageState<ProgramRecord[]>(PROGRAMS_STORAGE_KEY, []);
  const [remotePrograms, setRemotePrograms] = useState<ProgramRecord[]>([]);
  const [loadingRemote, setLoadingRemote] = useState(false);

  const programs = usingRemote ? remotePrograms : localPrograms;

  const [runningProgramId, setRunningProgramId] = useState<string | null>(null);
  const [runnerUnlocked, setRunnerUnlocked] = useState(false);
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
        if (active) setMessage("Could not load programs from Supabase.");
      } finally {
        if (active) setLoadingRemote(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [usingRemote]);

  async function unlockRunner() {
    await engineRef.current.unlock();
    setRunnerUnlocked(true);
  }

  function addWaypoint() {
    if (waypoints.length >= entitlements.maxWaypoints) {
      setMessage("Waypoint cap reached for current plan. Upgrade to add more waypoints.");
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
    setWaypoints((current) =>
      current.map((waypoint) => (waypoint.id === id ? { ...waypoint, ...patch } : waypoint)),
    );
  }

  function removeWaypoint(id: string) {
    setWaypoints((current) => current.filter((waypoint) => waypoint.id !== id));
  }

  async function saveProgram() {
    if (!name.trim()) {
      setMessage("Program name is required.");
      return;
    }

    if (usingRemote) {
      try {
        const response = await fetch("/api/programs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            goalTag,
            waypoints: waypoints.map((waypoint) => ({
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
            setMessage("Waypoint count exceeds current plan limit.");
          } else {
            setMessage(data.message ?? "Program save blocked.");
          }
          return;
        }

        setRemotePrograms((current) => [data.program!, ...current]);
        setMessage(`Saved "${data.program.name}" to Supabase.`);
        return;
      } catch {
        setMessage("Could not save program to Supabase.");
        return;
      }
    }

    if (programs.length >= entitlements.maxPrograms) {
      setMessage("Program limit reached on current plan.");
      return;
    }

    if (waypoints.length > entitlements.maxWaypoints) {
      setMessage("Waypoint count exceeds current plan limit.");
      return;
    }

    const next: ProgramRecord = {
      id: generateId(),
      name: name.trim(),
      goalTag,
      waypoints,
      createdAt: new Date().toISOString(),
    };

    setLocalPrograms((current) => [next, ...current]);
    setMessage(`Saved "${next.name}" with ${next.waypoints.length} waypoints.`);
  }

  async function removeProgram(id: string) {
    if (usingRemote) {
      try {
        const response = await fetch(`/api/programs?id=${id}`, { method: "DELETE" });
        if (!response.ok) {
          const data = (await response.json()) as { message?: string };
          setMessage(data.message ?? "Delete failed.");
          return;
        }
        setRemotePrograms((current) => current.filter((program) => program.id !== id));
      } catch {
        setMessage("Could not delete program.");
      }
      return;
    }

    setLocalPrograms((current) => current.filter((program) => program.id !== id));
  }

  async function runProgram(program: ProgramRecord) {
    if (!runnerUnlocked) {
      setMessage("Tap “Unlock Audio Runner” first.");
      return;
    }

    abortRef.current = false;
    setRunningProgramId(program.id);
    setMessage(`Running "${program.name}"...`);

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
      setMessage(`Completed "${program.name}".`);
    } catch (error) {
      const text = error instanceof Error ? error.message : "Program playback failed.";
      setMessage(text);
    } finally {
      setRunningProgramId(null);
    }
  }

  async function stopProgram() {
    abortRef.current = true;
    await engineRef.current.stop();
    setRunningProgramId(null);
    setMessage("Program stopped.");
  }

  return (
    <section className="mx-auto w-full max-w-screen-sm space-y-4 px-4 pb-28 pt-4">
      <header>
        <h1 className="font-display text-2xl font-semibold text-white">Programs</h1>
        <p className="mt-2 text-sm text-slate-200/80">
          Tier <span className="font-semibold">{tier}</span>: {" "}
          {entitlements.maxPrograms === 9999
            ? "Unlimited programs and waypoints."
            : `${entitlements.maxPrograms} program + ${entitlements.maxWaypoints} waypoints limit.`}
        </p>
        <p className="mt-1 text-xs text-slate-300">
          Source: {usingRemote ? "Supabase authenticated storage" : "Local guest storage"}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={unlockRunner}
          className="rounded-xl bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-950"
        >
          Unlock Audio Runner
        </button>
        {runningProgramId ? (
          <button
            onClick={() => void stopProgram()}
            className="rounded-xl bg-rose-500/80 px-3 py-2 text-xs font-semibold text-white"
          >
            Stop Program
          </button>
        ) : null}
      </div>

      <article className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <h2 className="text-sm font-semibold text-cyan-100">Build Program</h2>

        <label className="block space-y-1 text-xs text-slate-300">
          Program Name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Wind Down Sequence"
            className="w-full rounded-lg border border-white/15 bg-slate-900/80 px-3 py-2 text-sm text-white"
          />
        </label>

        <label className="block space-y-1 text-xs text-slate-300">
          Goal Tag
          <select
            value={goalTag}
            onChange={(event) => setGoalTag(event.target.value as GoalTag)}
            className="w-full rounded-lg border border-white/15 bg-slate-900/80 px-3 py-2 text-sm text-white"
          >
            {GOAL_TAGS.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </label>

        <div className="space-y-2">
          {waypoints.map((waypoint, index) => (
            <div key={waypoint.id} className="rounded-xl border border-white/10 bg-slate-900/70 p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-100">Waypoint {index + 1}</p>
                {waypoints.length > 1 ? (
                  <button
                    onClick={() => removeWaypoint(waypoint.id)}
                    className="text-[11px] text-rose-200"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <SmallNumber
                  label="Minutes"
                  value={waypoint.durationMinutes}
                  step={0.5}
                  onChange={(value) => updateWaypoint(waypoint.id, { durationMinutes: value })}
                />
                <SmallNumber
                  label="Carrier Hz"
                  value={waypoint.carrierHz}
                  step={0.5}
                  onChange={(value) => updateWaypoint(waypoint.id, { carrierHz: value })}
                />
                <SmallNumber
                  label="Entrain Hz"
                  value={waypoint.entrainmentHz}
                  step={0.1}
                  onChange={(value) => updateWaypoint(waypoint.id, { entrainmentHz: value })}
                />
                <SmallNumber
                  label="Volume"
                  value={waypoint.volume}
                  step={0.01}
                  onChange={(value) => updateWaypoint(waypoint.id, { volume: value })}
                />
                <SmallSelect
                  label="Mode"
                  value={waypoint.mode}
                  options={["binaural", "isochronic"]}
                  onChange={(value) => updateWaypoint(waypoint.id, { mode: value })}
                />
                <SmallSelect
                  label="Transition"
                  value={waypoint.transitionType}
                  options={["step", "ramp"]}
                  onChange={(value) => updateWaypoint(waypoint.id, { transitionType: value })}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={addWaypoint}
            className="rounded-xl bg-slate-800 px-3 py-2 text-xs text-slate-200"
          >
            Add Waypoint
          </button>
          <button
            onClick={() => void saveProgram()}
            className="rounded-xl bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-950"
          >
            Save Program
          </button>
        </div>

        {message ? <p className="text-xs text-cyan-100">{message}</p> : null}
      </article>

      {waypoints.length >= entitlements.maxWaypoints && entitlements.maxWaypoints !== 9999 ? (
        <div className="rounded-2xl border border-amber-300/35 bg-amber-100/10 p-4 text-sm text-amber-100">
          <p>Trying to add a 4th waypoint is blocked on Free. Upgrade to continue building.</p>
          <Link href="/pricing" className="mt-2 inline-block rounded-lg bg-amber-200/20 px-3 py-1">
            Upgrade Plan
          </Link>
        </div>
      ) : null}

      <article className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
        <h2 className="text-sm font-semibold text-cyan-100">Saved Programs ({programs.length})</h2>
        {loadingRemote ? <p className="text-xs text-slate-400">Loading from Supabase...</p> : null}
        {programs.length === 0 && !loadingRemote ? (
          <p className="text-xs text-slate-400">No programs saved yet.</p>
        ) : (
          <ul className="space-y-2">
            {programs.map((program) => (
              <li key={program.id} className="rounded-xl border border-white/10 bg-slate-900/70 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{program.name}</h3>
                    <p className="text-xs text-slate-300">
                      {program.goalTag} · {program.waypoints.length} waypoints
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => void runProgram(program)}
                      disabled={runningProgramId !== null}
                      className="rounded-lg bg-cyan-400/20 px-2 py-1 text-xs text-cyan-100 disabled:opacity-50"
                    >
                      {runningProgramId === program.id ? "Running..." : "Run"}
                    </button>
                    <button
                      onClick={() => void removeProgram(program.id)}
                      className="rounded-lg bg-rose-400/20 px-2 py-1 text-xs text-rose-100"
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

interface SmallNumberProps {
  label: string;
  value: number;
  step: number;
  onChange: (value: number) => void;
}

function SmallNumber({ label, value, step, onChange }: SmallNumberProps) {
  return (
    <label className="space-y-1 text-[11px] text-slate-300">
      <span>{label}</span>
      <input
        type="number"
        value={value}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full rounded-md border border-white/15 bg-slate-900/80 px-2 py-1 text-xs text-white"
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
    <label className="space-y-1 text-[11px] text-slate-300">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="w-full rounded-md border border-white/15 bg-slate-900/80 px-2 py-1 text-xs text-white"
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
