const FAQ = [
  {
    question: "What is the difference between binaural and isochronic?",
    answer:
      "Binaural plays a slightly different tone in each ear, and your mind perceives the difference as a slow beat. It needs stereo headphones. Isochronic pulses a single tone on and off at the target rate, so it carries over speakers too.",
  },
  {
    question: "What do the wave names mean?",
    answer:
      "They are the classic brainwave bands. Delta (0.1 to 4 Hz) is linked with deep sleep, theta (4 to 8 Hz) with meditation, alpha (8 to 13 Hz) with relaxed presence, beta (13 to 30 Hz) with alert focus, and gamma (30 to 40 Hz) with peak concentration. The Studio shows you which territory you are in as you tune.",
  },
  {
    question: "What are the sacred carriers?",
    answer:
      "The six solfeggio tones (396, 417, 528, 639, 741, and 852 Hz), available as one-tap carrier frequencies in the Studio. Many practitioners build their sessions around them.",
  },
  {
    question: "What does Premium include?",
    answer:
      "Unlimited presets and journeys, no sponsor messages, and the ability to import community work into your library and publish your own. Inner Circle adds every protocol pack. The instrument itself, every frequency, stays free for everyone.",
  },
  {
    question: "How does Founding Member work?",
    answer:
      "One payment of $149 for lifetime Inner Circle access, limited to 250 members. When the seats are gone, they are gone.",
  },
  {
    question: "Why did I see a listening warning?",
    answer:
      "Carrier frequencies can reach 20,000 Hz, but most ears cannot hear above 16,000 Hz and some headphones distort up there. Keep volume low and rise gently.",
  },
  {
    question: "Is this a medical treatment?",
    answer:
      "No. Blue Star Beats is a wellness and focus practice, not a medical device. It does not diagnose, treat, cure, or prevent any condition. If you have a seizure history or neurological concerns, speak with a professional first.",
  },
];

export default function FaqPage() {
  return (
    <section className="mx-auto w-full max-w-screen-sm px-5 pb-32 pt-6">
      <h1 className="h-display text-[1.75rem]">Questions</h1>
      <ul className="mt-5 space-y-3">
        {FAQ.map((item) => (
          <li key={item.question} className="card">
            <p className="h-display text-lg">{item.question}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{item.answer}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
