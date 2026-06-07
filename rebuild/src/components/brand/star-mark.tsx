interface StarMarkProps {
  className?: string;
}

/** Eight-pointed star inside concentric sound rings: the Blue Star Beats mark. */
export function StarMark({ className }: StarMarkProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="22" stroke="#d4af74" strokeOpacity="0.35" strokeWidth="1" />
      <circle cx="24" cy="24" r="16.5" stroke="#d4af74" strokeOpacity="0.5" strokeWidth="1" />
      <path
        d="M24 8l2.7 10.2a4 4 0 0 0 3.1 3.1L40 24l-10.2 2.7a4 4 0 0 0-3.1 3.1L24 40l-2.7-10.2a4 4 0 0 0-3.1-3.1L8 24l10.2-2.7a4 4 0 0 0 3.1-3.1L24 8z"
        fill="url(#starGold)"
      />
      <defs>
        <linearGradient id="starGold" x1="24" y1="8" x2="24" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ecd3a3" />
          <stop offset="1" stopColor="#b8945c" />
        </linearGradient>
      </defs>
    </svg>
  );
}
