interface AdSlotProps {
  context: "pre-session" | "post-session";
  isFreeTier: boolean;
}

export function AdSlot({ context, isFreeTier }: AdSlotProps) {
  if (!isFreeTier) return null;

  return (
    <aside className="rounded-xl border border-dashed border-cyan-300/50 bg-cyan-400/10 p-3 text-xs text-cyan-100">
      <p className="font-semibold uppercase tracking-wide">Ad Placement</p>
      <p className="mt-1">
        {context === "pre-session"
          ? "Shown before session start (free tier)."
          : "Shown after session completion (free tier)."}
      </p>
    </aside>
  );
}
