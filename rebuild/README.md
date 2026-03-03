# BlueStarBeats v1 Rebuild

Mobile-first Next.js PWA for real-time brainwave entrainment (binaural + isochronic), with presets, program builder, marketplace flows, and day-1 monetization wiring.

## Stack
- Frontend: Next.js App Router + TypeScript + Tailwind v4
- Audio: Web Audio API (`BrainwaveAudioEngine`)
- Data/Auth: Supabase (Auth + Postgres + RLS schema + admin server client)
- Payments: Stripe Checkout + webhook entitlement updates
- PWA: `manifest.webmanifest` + `sw.js`
- Deploy targets: Vercel (recommended) or Netlify
- Mobile wrap readiness: Capacitor-compatible UI and viewport/safe-area handling

## Feature Coverage
- Audio engine with:
  - Binaural split math (`carrier ± beat/2`)
  - Isochronic pulse modulation
  - Real-time tuning updates
  - Mode/waveform switching
  - Fade in/out on play/stop
  - iOS user-gesture unlock prompt
- Presets:
  - Save/load/delete/tag presets
  - Free-tier save limit enforcement
  - Authenticated Supabase CRUD via `/api/presets`
- Programs:
  - Waypoint builder with step/ramp transition modes
  - Program runner with sequential waypoint playback
  - Free-tier waypoint cap enforcement
  - Authenticated Supabase CRUD via `/api/programs`
- Marketplace:
  - Trending/new browse and tag filters
  - Preview playback
  - Import gating by entitlement
  - Publish eligibility gating
  - Supabase-backed public listings via `/api/marketplace/listings`
- Monetization:
  - Pricing plans (Free/Pro/Elite/Founders)
  - Founders banner + countdown
  - Paywall trigger messaging in player flow
  - Free-tier ads shown only pre-session and post-session
- API gating endpoints:
  - `/api/auth/session`
  - `/api/presets`
  - `/api/programs`
  - `/api/marketplace/import`
  - `/api/marketplace/listings`
- Stripe:
  - `/api/stripe/checkout` (subscriptions + one-time)
  - `/api/stripe/webhook` (entitlement updates + purchase logging)

## Repo Tree
```text
rebuild/
  .env.example
  eslint.config.mjs
  next.config.ts
  package.json
  postcss.config.mjs
  public/
    manifest.webmanifest
    sw.js
    favicon + static assets
  src/
    app/
      page.tsx
      pricing/page.tsx
      presets/page.tsx
      programs/page.tsx
      marketplace/page.tsx
      account/page.tsx
      creators/page.tsx
      packs/page.tsx
      faq/page.tsx
      legal/{terms,privacy,disclaimer}/page.tsx
      api/
        presets/route.ts
        programs/route.ts
        marketplace/import/route.ts
        stripe/checkout/route.ts
        stripe/webhook/route.ts
    components/
      player/player-studio.tsx
      navigation/{safe-shell,bottom-tabs}.tsx
      monetization/{founders-banner,ad-slot}.tsx
      pwa/register-sw.tsx
    hooks/
      use-auth-session.ts
      use-local-storage-state.ts
      use-plan-tier.ts
      use-session-metrics.ts
    lib/
      audio/{engine,types}.ts
      supabase/{browser,server,admin}.ts
      stripe/catalog.ts
      server/session.ts
      plans.ts
      entitlements.ts
      domain.ts
      marketplace-seed.ts
      env.ts
      storage.ts
      id.ts
  supabase/
    migrations/0001_initial.sql
    seeds/0001_marketplace_seed.sql
```

## Local Development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy env file:
   ```bash
   cp .env.example .env.local
   ```
3. Start:
   ```bash
   npm run dev
   ```
4. Verify:
   ```bash
   npm run lint
   npm run build
   ```

## Environment Variables
Required values:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL`

Stripe price IDs:
- `STRIPE_PRICE_PRO_MONTHLY`
- `STRIPE_PRICE_PRO_YEARLY`
- `STRIPE_PRICE_ELITE_MONTHLY`
- `STRIPE_PRICE_ELITE_YEARLY`
- `STRIPE_PRICE_FOUNDERS_LIFETIME`

## Supabase Setup
1. Create a Supabase project.
2. Run SQL migration:
   - File: `supabase/migrations/0001_initial.sql`
3. Enable email/password auth in Supabase Auth.
4. Confirm tables exist:
   - `user_profiles`
   - `entitlements`
   - `presets`
   - `programs`
   - `program_waypoints`
   - `marketplace_listings`
   - `purchases`
   - `referrals`

### Seed Marketplace Data
After at least one user account exists in Supabase Auth, run:
- `supabase/seeds/0001_marketplace_seed.sql`

What it does:
- Ensures profile + free entitlements baseline for a seed creator
- Inserts sample preset/program sources
- Inserts sample marketplace listings (idempotent)

## Stripe Setup
Create products/prices:
- Pro Monthly ($12)
- Pro Yearly ($99)
- Elite Monthly ($39)
- Elite Yearly ($299)
- Founders Lifetime ($149 one-time, cap 250, deadline March 31, 2026 11:59 PM PT)
- Optional one-time prices for packs and creator tips

Wire those `price_...` IDs into `.env.local`.

### Webhook
1. Create webhook endpoint:
   - `https://YOUR_DOMAIN/api/stripe/webhook`
2. Subscribe to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
3. Set `STRIPE_WEBHOOK_SECRET`.

## Deploy
### Vercel
1. Import repo.
2. Set all env vars.
3. Deploy.
4. Add Stripe webhook endpoint to deployed domain.

Vercel production optimizations already wired in code:
- Supabase session refresh proxy: [src/proxy.ts](src/proxy.ts)
- Explicit Node runtime + max duration on API routes
- Edge cache headers for public marketplace listing reads (`s-maxage` + `stale-while-revalidate`)
- `turbopack.root` pinned to avoid workspace root mis-detection in monorepo-like directories

### Netlify
1. Connect repo with Next.js support.
2. Set same env vars.
3. Deploy.
4. Ensure webhook route is reachable at `/api/stripe/webhook`.

## Capacitor Wrap Steps
PWA-first architecture is ready for wrap.

```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npx cap init
npm run build
npx cap add ios
npx cap add android
npx cap sync
```

## Notes
- In local environments without Stripe/Supabase configuration, UI falls back to demo-safe behavior for plan/purchase flow previews.
- Core entitlement checks are enforced both in UI and API route handlers.
- When authenticated, presets/programs/marketplace import flows persist to Supabase; guest mode falls back to local storage and seed listings.

## Vercel + Supabase Checklist
1. Ensure these env vars are set in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
2. Redeploy after env updates.
3. Confirm auth cookie refresh is active by signing in and calling `/api/auth/session`.
4. Run migration SQL (`0001_initial.sql`) then seed SQL (`0001_marketplace_seed.sql`) in Supabase SQL editor.
