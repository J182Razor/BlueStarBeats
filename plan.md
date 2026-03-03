Got it. Codex-first, deploy to Vercel/Netlify, and **rebuild clean** as a **mobile-first web app** that can be wrapped with **Capacitor** for iOS/Android. Below is the **new complete build prompt** (single paste) tailored to that reality, plus the **deployment plan**, plus the **moat + monetization wiring**.

---

# ✅ THE STACK (codex-friendly, mobile-first, capacitor-ready)

**Frontend:** Next.js (App Router) + Tailwind + PWA  
**Backend:** Supabase (Auth + Postgres + Storage)  
**Payments:** Stripe (subscriptions + one-time)  
**Ads:** (Web) Google AdSense or a lightweight provider (Free tier only)  
**Deploy:** Vercel (recommended) or Netlify  
**Mobile wrap:** Capacitor (later) with PWA assets already compliant

Reason: fastest path to shipping + simplest to iterate with AI tools.

---

# MASTER PROMPT — CODEX REBUILD (MOBILE-FIRST + CAPACITOR-READY + DAY-1 MONEY)

Copy/paste this entire prompt into Codex:

---

## CODEX MASTER BUILD PROMPT — BLUESTARBEATS v1 REBUILD (Mobile-First PWA + Capacitor-ready)

**ROLE:** You are an elite senior product engineer. You build mobile-first PWAs that monetize on day 1. You are ruthless about shipping complete and coherent systems. You write clean, production-ready code. You do not leave broken wiring. You implement end-to-end.

**PROJECT GOAL:** Rebuild BlueStarBeats from scratch as a **mobile-first web app** (PWA) that can be wrapped with **Capacitor** later. The app is a real-time brainwave entrainment studio (binaural + isochronic), with presets, programmable sessions, community sharing/marketplace, and Day-1 monetization (ads + subscription + one-time packs + founders offer).

### Non-Negotiable Outcomes

1. It runs perfectly on mobile browsers (iOS Safari + Android Chrome).
2. It is PWA-compliant and “Capacitor-friendly” (single-page app feel, responsive, safe area handling).
3. Monetization works Day 1: paywall, entitlements, Stripe checkout, and gating are correct.
4. The audio engine is stable and low-latency for tuning changes.
5. The build is deployable to **Vercel or Netlify** with clear env var setup.

---

# REQUIRED FEATURES (MVP+MONETIZATION)

## A) Audio Engine (Web Audio API)

Implement a robust, mobile-friendly audio engine:

* Supports **binaural beats**:

  * left = carrier - (beat/2)
  * right = carrier + (beat/2)
* Supports **isochronic pulses**:

  * carrier oscillator amplitude-modulated at beat frequency
* Real-time control changes:

  * carrier Hz slider
  * entrainment Hz slider
  * volume slider
  * mode toggle (binaural/isochronic)
* Playback controls:

  * play/pause
  * timer (optional)
  * fade in/out
* Must handle iOS autoplay restrictions:

  * audio context starts only on user gesture
  * show “Tap to Start Audio” prompt

Performance target:

* tuning changes should feel instant (<50ms perceived)

## B) Presets

* Save current settings as preset
* Edit preset name/tags
* Load preset
* Delete preset
* Tags: sleep/focus/calm/meditation/custom

## C) Program Builder (Waypoints)

* Create a program: list of waypoints
  Waypoint fields:
* duration minutes
* mode (binaural/isochronic)
* carrier Hz
* entrainment Hz
* volume
* transition type: step or ramp
  Program runner:
* play through waypoints
* transitions as configured

## D) Community Marketplace (v1)

* Users can publish a preset/program
* Public marketplace browsing:

  * trending/new
  * filter by goal tags
* Listing details:

  * creator name/badge
  * play preview (short)
  * import button
* Import is paywalled based on plan

## E) Monetization (Day 1)

### Plans + gates

**FREE (Ad-supported)**

* Ads shown only before session start and after session end
* Limits:

  * max 3 presets saved
  * max 1 program saved
  * max 3 waypoints per program
* Marketplace browse allowed, import locked

**PRO**

* $12/mo or $99/yr
* No ads
* Unlimited presets/programs/waypoints
* Import + publish unlocked

**ELITE**

* $39/mo or $299/yr
* Everything in Pro
* Unlock protocol packs included

**FOUNDERS LIFETIME**

* $149 one-time
* Cap 250 total
* Deadline: March 31, 2026 11:59 PM PT
* Founders badge

### One-time monetization

* Protocol Packs ($19–$49 one-time)
* Creator tips ($5/$10/$25)

### Paywall triggers

Show upgrade prompts at:

1. After session #2 → saving preset
2. After session #3 → remove ads/unlock unlimited
3. When user tries 4th waypoint → blocked
4. When user clicks import → blocked
5. After 7-day streak → offer annual

## F) Auth + Data + Entitlements

Use Supabase Auth + Postgres.  
Tables required:

* users profile table (plan_tier, founders_badge, trial_end_at)
* entitlements table (ads_enabled, max_presets, max_programs, max_waypoints, can_import, can_publish, can_access_packs)
* presets, programs
* marketplace listings
* purchases table
* referral table (optional v1; stub ok)

Entitlements must be computed from plan and enforced in:

* UI
* API (server actions / route handlers)

## G) Payments Integration (Stripe)

Implement:

* Stripe Checkout for subscriptions and one-time purchases
* Webhooks route to update entitlements
* Customer portal link for managing subs (optional but recommended)
* Ensure Vercel deployment works with webhooks

## H) Ads Integration

Implement a simple ad component for Free users only.

* Only show ads in two places:

  * session start screen
  * session end screen
* Never mid-play

## I) Website Pages (built into app)

Must have:

* Home
* Pricing
* Marketplace
* Creators (basic)
* Packs store
* FAQ
* Legal: Terms, Privacy, Disclaimer (no medical claims)

---

# UX / DESIGN REQUIREMENTS (MOBILE FIRST)

* Responsive layout built for iPhone screens first
* Bottom tab navigation:

  * Player
  * Presets
  * Programs
  * Marketplace
  * Account
* Large sliders with clear numeric readouts
* “QuickTune” buttons:

  * Deeper / Lighter / Calm / Alert (simple adjustments)
* Founders banner: persistent but non-annoying, shows countdown + remaining slots

---

# TECH REQUIREMENTS

* Next.js App Router
* Tailwind
* TypeScript preferred
* PWA manifest + service worker (basic)
* Environment variable config documented
* Deployment instructions for Vercel + Netlify
* Capacitor readiness:

  * no reliance on server-only features for core playback
  * mobile safe area and viewport settings correct

---

# OUTPUT REQUIRED FROM YOU (as Codex)

1. Full repo file tree
2. All code files
3. SQL migrations for Supabase
4. Stripe setup instructions + product IDs placeholders
5. Webhook handler + entitlement update logic
6. Complete README with:

   * local run
   * env vars
   * Supabase setup
   * Stripe setup
   * deploy to Vercel/Netlify
   * Capacitor wrap steps

Build it end-to-end now.

---

# START

First, print the repo structure.  
Then implement in this order:

1. Supabase schema + auth
2. Audio engine
3. Presets
4. Programs
5. Marketplace
6. Pricing/paywall + entitlements
7. Stripe checkout + webhooks
8. Ads placements
9. Pages + nav + polish

No placeholders that break the build.

---

# END PROMPT

---

## DEPLOYMENT PLAN (Vercel/Netlify) — EXACT

### Env vars you will need

* `NEXT_PUBLIC_SUPABASE_URL`
* `NEXT_PUBLIC_SUPABASE_ANON_KEY`
* `SUPABASE_SERVICE_ROLE_KEY` (server only)
* `STRIPE_SECRET_KEY`
* `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
* `STRIPE_WEBHOOK_SECRET`
* `NEXT_PUBLIC_APP_URL` (your domain)

### Vercel (recommended)

* Connect repo
* Add env vars
* Deploy
* Add webhook endpoint in Stripe: `https://YOURDOMAIN/api/stripe/webhook`

### Netlify

* Same env vars
* Ensure function routing supports webhook route (or use Next on Netlify adapter)

---

## CAPACITOR WRAP PLAN (when ready)

Because it’s a PWA-first mobile app:

* Add `@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`, `@capacitor/android`
* `npx cap init`
* `npm run build`
* `npx cap add ios && npx cap add android`
* `npx cap sync`  
  This is why we built mobile-first and avoided fragile browser-only assumptions.

---

## 3 MOAT ITERATIONS (post-rebuild, same core)

### v1 (ship) — paywall + packs + founders + marketplace browse/import

### v2 — Protocol DNA ranking (top by goal, saves/imports), creator monetization

### v3 — Personal “State Profile” + Protocol Lab (A/B compare) + licensing tier

(You keep core features unchanged; moat compounds around them.)

---

## SWARM PARALLEL EXECUTION PLAN (MAXIMUM PARALLELISM)

### Parallel Wave 0: Repo/bootstrap (single-owner, unblock all)

* Create Next.js App Router scaffold
* Add Tailwind + TypeScript + lint + format + CI baseline
* Add `.env.example` and runtime config validation
* Define shared domain models and constants

### Parallel Wave 1: Independent foundations (run in parallel)

* **Track A: Data + Auth**
  * Supabase schema migrations
  * RLS policies
  * Auth flows and session middleware
* **Track B: Audio Core**
  * Web Audio engine + iOS gesture unlock
  * Playback state machine + fade in/out
  * QuickTune primitives
* **Track C: UI Shell**
  * Mobile-first layout + safe area + bottom tabs
  * Core pages placeholders (no broken routes)
  * PWA manifest + icons + install prompt baseline
* **Track D: Billing Core**
  * Stripe product/price mapping
  * Checkout session endpoints
  * Webhook skeleton + signature verification

### Parallel Wave 2: Feature verticals (run in parallel after Wave 1 interfaces freeze)

* **Track E: Presets**
  * CRUD + tags + gating limits
* **Track F: Programs**
  * Waypoint builder + runner + transitions
  * Plan-based waypoint cap enforcement
* **Track G: Marketplace**
  * Publish/list/detail/import
  * Trending/new sorting and tag filters
* **Track H: Monetization UX**
  * Pricing page, paywall modals, founders banner/countdown
  * Triggered upsell surfaces at required milestones
* **Track I: Ads**
  * Free-tier ad wrapper
  * Placement only at pre-session and post-session screens

### Parallel Wave 3: Entitlements convergence (single integration wave)

* Wire Stripe webhook events to entitlements table updates
* Enforce entitlement checks in API/server actions and UI
* Validate plan-gating matrix end-to-end (free/pro/elite/founders)

### Parallel Wave 4: Hardening + release (run in parallel where possible)

* **QA Track:** mobile-browser test matrix (iOS Safari, Android Chrome)
* **Perf Track:** audio tuning latency and interaction jank audits
* **Security Track:** webhook, RLS, auth boundary checks
* **Docs Track:** README, deploy guides, Stripe/Supabase setup, Capacitor wrap steps
* **Release Track:** Vercel/Netlify pipeline verification and smoke tests

### Merge Gates (must pass before release)

* `npm run build` passes
* Type/lint/tests pass
* PWA audit: installable + offline shell
* Stripe checkout + webhook + entitlement transitions verified
* Free-tier gating + ad placements verified
* No critical console errors on iOS Safari/Android Chrome

