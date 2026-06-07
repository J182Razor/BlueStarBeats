# BlueStarBeats Workspace

- Active application: `rebuild/` (Next.js 16, Midnight & Gold redesign)
- Archived legacy code: `legacy/old-app-2026-03-03/`
- App store submission assets: `app-store-kit/`

Run the active app from `rebuild/`:

```bash
cd rebuild
npm install
npm run dev
```

## Deploying

Vercel builds from this repo's `main` branch. `vercel.json` installs and
builds inside `rebuild/` directly (no workspace hoisting), which keeps the
`next` package inside `rebuild/node_modules` where Turbopack expects it.
`next.config.ts` pins `turbopack.root` to `process.cwd()` because Node 24
loads TypeScript configs as native ESM, where `__dirname` is undefined.

To ship: commit and `git push origin main`.
