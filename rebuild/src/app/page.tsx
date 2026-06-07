import { PlayerStudio } from "@/components/player/player-studio";

export default function HomePage() {
  return (
    <section className="mx-auto w-full max-w-screen-sm px-5 pb-32 pt-6">
      <h1 className="h-display text-[1.75rem]">What are we tuning for?</h1>
      <p className="mt-1.5 text-sm text-ink-muted">
        Choose an intention, or shape every frequency yourself.
      </p>
      <PlayerStudio />
    </section>
  );
}
