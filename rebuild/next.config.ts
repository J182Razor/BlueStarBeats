import type { NextConfig } from "next";

/**
 * process.cwd() is the rebuild/ directory in every environment that builds
 * this app (local `npm run build` and Vercel's `cd rebuild && npm run build`).
 * __dirname is not safe here: Node 24 loads next.config.ts as native ESM,
 * where __dirname is undefined and Turbopack falls back to a wrong root.
 */
const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
