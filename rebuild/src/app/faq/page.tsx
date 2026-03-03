const FAQ = [
  {
    question: "How do binaural and isochronic modes differ?",
    answer:
      "Binaural sends slightly different tones left/right to create a perceived beat. Isochronic uses one tone pulsed at the target entrainment frequency.",
  },
  {
    question: "Can I use speakers for binaural mode?",
    answer:
      "Use stereo headphones for binaural mode. Isochronic mode can work over speakers, but headphones are still recommended for consistency.",
  },
  {
    question: "What is included in Pro vs Elite?",
    answer:
      "Pro removes ads and unlocks unlimited presets/programs plus marketplace import/publish. Elite includes everything in Pro plus protocol packs.",
  },
  {
    question: "How do Founders slots work?",
    answer:
      "Founders is a one-time lifetime offer capped at 250 users until March 31, 2026 at 11:59 PM PT.",
  },
  {
    question: "Is this a medical treatment app?",
    answer:
      "No. BlueStarBeats is a wellness and focus tool and does not provide medical diagnosis or treatment.",
  },
];

export default function FaqPage() {
  return (
    <section className="mx-auto w-full max-w-screen-sm px-4 pb-28 pt-4">
      <h1 className="font-display text-2xl font-semibold text-white">FAQ</h1>
      <ul className="mt-4 space-y-2">
        {FAQ.map((item) => (
          <li
            key={item.question}
            className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200/90"
          >
            <p className="font-semibold text-cyan-100">{item.question}</p>
            <p className="mt-1 text-xs text-slate-300">{item.answer}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
