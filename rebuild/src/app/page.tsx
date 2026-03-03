import { PlayerStudio } from "@/components/player/player-studio";

export default function HomePage() {
  return (
    <section className="mx-auto w-full max-w-screen-sm px-4 pb-28 pt-4">
      <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-200/80">
          BlueStarBeats
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-white">
          Mobile Brainwave Studio
        </h1>
        <p className="mt-2 text-sm text-slate-200/80">
          Binaural and isochronic generation with low-latency tuning and
          gesture-safe playback for iOS Safari and Android Chrome.
        </p>
      </div>
      <PlayerStudio />
    </section>
  );
}
