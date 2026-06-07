# Blue Star Beats: App Store Submission Kit

Everything in this folder is sized to current store requirements and ready to upload. The app itself is a PWA; wrap it with Capacitor before native submission (notes in section 6).

---

## 1. App identity

| Field | Value |
|---|---|
| Display name | Blue Star Beats |
| Positioning line | The luxury frequency studio for your mind |
| Category (iOS) | Health & Fitness (alternate: Lifestyle) |
| Category (Play) | Health & Fitness |
| Content rating | 4+ / Everyone |
| Icon | `icons/icon-1024.png` (iOS, no alpha), `icons/icon-512.png` (Play), `icons/icon-master.svg` (source) |

---

## 2. Apple App Store listing

**Title (25 of 30 chars):**
`Blue Star Beats: Binaural`

**Subtitle (27 of 30 chars):**
`Solfeggio, Sleep & Manifest`

**Keyword field (97 of 100 chars, no spaces):**
`brainwaves,isochronic,frequency,generator,528,432,theta,delta,meditation,focus,calm,tones,healing`

**Promotional text (167 of 170 chars):**
`Tune any frequency from 0.1 to 40 Hz, live. Binaural and isochronic synthesis, all six solfeggio carriers, and journeys that guide you down, hold you, and bring you back.`

**Description:**

```
Tune your mind like an instrument.

Blue Star Beats is a real-time frequency studio. Nothing here is a
recording: every tone is synthesized live on your device, so sessions
never loop and never repeat. You hold the controls other apps lock away.

THE INSTRUMENT, FREE FOREVER
• Binaural beats (stereo headphones) and isochronic pulses (speakers welcome)
• Beat frequency from 0.1 to 40 Hz: delta, theta, alpha, beta, and gamma
• Carrier frequency from 20 to 20,000 Hz on a precision dial
• All six solfeggio tones, one tap away: 396, 417, 528, 639, 741, 852 Hz
• Four tone characters: pure, soft, pulse, rich
• One-tap intentions: Sleep, Meditate, Focus, Manifest
• A live readout that teaches you which brainwave territory you are in

JOURNEYS
Design multi-phase sessions that move on their own: descend from 8 Hz
alpha into 2.5 Hz delta over twenty minutes, hold, then end in silence.
Step changes or smooth ramps, up to any length your night requires.

THE MARKET
A community of practitioners shares their tuned presets and journeys.
Preview anything free. Keep the ones that carry you.

OUR PROMISES
• What is free today stays free. We will never move it behind a paywall.
• No card needed for the free plan. No surprise charges.
• Cancel any time from your account page, in one tap.

PREMIUM ($12 a month, $99 a year)
Unlimited presets and journeys synced across devices, no sponsor
messages, and market import and publishing. Inner Circle adds every
protocol pack. A limited Founding Member seat ($149 once) carries
lifetime access.

Headphones note: binaural mode needs stereo headphones to work.
Isochronic mode carries over speakers.

Blue Star Beats is a wellness and focus practice, not a medical device.
It does not diagnose, treat, cure, or prevent any condition. If you have
a seizure history, a pacemaker, or neurological concerns, consult a
professional first. Do not listen while driving.
```

**Screenshot upload order (iOS, first 3 decide the install):**

| Slot | File | Caption on frame |
|---|---|---|
| 1 | `ios/6.9-inch/01-studio-idle.png` | Tune your own frequency |
| 2 | `ios/6.9-inch/02-studio-live.png` | Generated live. Never a loop. |
| 3 | `ios/6.9-inch/03-solfeggio.png` | All six sacred tones |
| 4 | `ios/6.9-inch/04-journeys.png` | Journeys that guide you down |
| 5 | `ios/6.9-inch/05-library.png` | Keep what carries you |
| 6 | `ios/6.9-inch/06-market.png` | Tuned by practitioners |
| 7 | `ios/6.9-inch/07-pricing.png` | No tricks. Cancel in one tap. |

Sizes provided: 1320x2868 (6.9 inch, required; auto-scales to all smaller iPhones), 1290x2796 (6.7 inch slot), 1284x2778 (6.5 inch legacy slot). PNG, no alpha.

---

## 3. Google Play listing

**Title (25 of 30 chars):**
`Blue Star Beats: Binaural`

**Short description (79 of 80 chars):**
`Binaural beats & solfeggio frequency studio for sleep, focus and manifesting.`

**Long description:** use the iOS description above; Play indexes it, and the binaural beats, solfeggio, frequency, sleep, focus, meditation, and manifest terms already appear naturally two to three times each. Plain text, no emoji walls.

**Assets:**

| Asset | File | Spec |
|---|---|---|
| Feature graphic | `google-play/feature-graphic-1024x500.png` | 1024x500, required |
| Phone screenshots | `google-play/phone/01...07.png` | 1080x1920, upload all 7 (min 2, max 8) |
| Icon | `icons/icon-512.png` | 512x512 PNG |

---

## 4. ASO keyword map

| Tier | Terms |
|---|---|
| Head terms (title/subtitle) | binaural beats, solfeggio, sleep, manifest |
| Core niche (keyword field, Play long description) | brainwaves, isochronic tones, frequency generator, 528 hz, 432 hz, theta waves, delta waves, healing frequencies, meditation frequencies |
| Long tail (Play long description) | brainwave entrainment, sleep frequencies, manifestation frequencies, brown noise alternative, adhd focus sounds, lucid dreaming sounds, chakra sounds |

Competitor gap this listing owns: nobody combines "real frequency instrument" with luxury finish and honest pricing. The category leaders lock the frequencies (Endel, Calm, Synctuition) or look like 2010 utilities (the Play binaural cluster).

---

## 5. Health and policy wording rules

Safe (wellness framing): "supports relaxation", "designed for restful sleep", "promotes focus", "frequencies traditionally associated with meditation states", "supports your manifestation practice".

Never use (rejection risk): treats/cures/relieves anxiety, insomnia, depression, ADHD, tinnitus, migraines, or any named condition; "clinically proven"; "doctor recommended"; efficacy percentages; drug or dose language.

Both stores: the in-app Wellness note (legal/disclaimer) plus the description disclaimer above satisfy the standard disclaimer hygiene. Google Play requires the **Health Apps Declaration** in Play Console (mandatory since August 2025) - declare as wellness/sleep support, request no health data.

---

## 6. Pre-submission checklist (Capacitor wrap)

1. **Apple 4.2 minimum functionality:** wrap with Capacitor, enable the `audio` UIBackgroundMode (real background playback), wire Now Playing controls and a native sleep timer. Real-time synthesis is strong native-app evidence; surface it in the review notes.
2. **Apple 1.2 user content (the market):** ship report and block controls plus a moderation path BEFORE submitting. Terms already state removal policy.
3. **Apple 3.1.1 payments:** subscriptions, packs, and Founding Member must use StoreKit in-app purchase on iOS (Play Billing on Android). Web Stripe checkout stays for the web PWA only.
4. **Subscription disclosure:** price, period, and auto-renewal shown on the paywall screen (the pricing page already states all three plus the cancel promise).
5. **Play Health Apps Declaration:** complete in Play Console before review.
6. **Review notes to attach:** "All audio is synthesized in real time on device via the Web Audio API wrapped in a native shell; no recordings are streamed. Binaural mode requires stereo headphones, stated in app."

---

## 7. What changed in the redesign (for release notes)

Midnight & Gold redesign: a breathing orb player with a live brainwave readout, one-tap intentions (Sleep, Meditate, Focus, Manifest), solfeggio carrier shortcuts, journeys with phases, a refined market, honest pricing with the cancel-in-one-tap promise, log-scale carrier dial, one-tap audio start, and a full pass on every word of copy.
