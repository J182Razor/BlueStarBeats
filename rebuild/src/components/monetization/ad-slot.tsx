interface AdSlotProps {
  context: "pre-session" | "post-session";
  isFreeTier: boolean;
}

export function AdSlot({ context, isFreeTier }: AdSlotProps) {
  if (!isFreeTier) return null;

  return (
    <aside className="rounded-2xl border border-dashed border-[var(--hairline-soft)] px-4 py-3 text-[11px] text-ink-faint">
      <p>
        {context === "pre-session"
          ? "A brief sponsor message appears here on the free plan."
          : "Sponsor message · Premium listens without these."}
      </p>
    </aside>
  );
}
