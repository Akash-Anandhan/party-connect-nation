// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig, type LovableViteTanstackOptions } from "@lovable.dev/vite-tanstack-config";

/**
 * GitHub Pages can only serve static files, while the default build emits a
 * Nitro (Cloudflare) server. Set `GH_PAGES=1` to produce a fully static site
 * instead: Nitro is skipped, TanStack Start switches to SPA mode and the Vite
 * base path is pointed at `/<repo>/` (where GitHub Pages serves a project site).
 *
 * Set `CUSTOM_DOMAIN=1` as well (GitHub Pages custom domain) to use `/` instead:
 * a custom domain serves the site from the root, so a `/<repo>/` prefix would
 * 404 every asset and leave the page blank.
 *
 * Left unset, the normal Cloudflare/server build is untouched — so Lovable's
 * deploy keeps working exactly as before.
 */
const staticBuild = process.env["GH_PAGES"] === "1";
const customDomain = process.env["CUSTOM_DOMAIN"] === "1";

/** GitHub Pages project sites are served from https://<owner>.github.io/<repo>/ */
const repoName =
  process.env["GITHUB_REPOSITORY"]?.split("/")[1]?.trim() || "party-connect-nation";
/** Custom domains serve from the root; project sites from /<repo>/. */
const base = customDomain ? "/" : `/${repoName}/`;

const options: LovableViteTanstackOptions = {
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    // Static build: serve one prerendered shell for every path, hydrated client-side.
    ...(staticBuild ? { spa: { enabled: true, prerender: { enabled: true } } } : {}),
  },

  // No server runtime on GitHub Pages — skip Nitro entirely for static builds.
  ...(staticBuild ? { nitro: false as const } : {}),

  vite: {
    // `base` also feeds TanStack Start's router `basepath`, so no manual
    // basepath is needed in src/router.tsx (it becomes a no-op "/" for a
    // custom domain).
    ...(staticBuild ? { base } : {}),
    server: {
      // Port 8080 is reserved/occupied on Windows (excluded port range + System
      // process), which makes Vite fail with EACCES. Use a free port instead.
      host: "localhost",
      port: 5173,
    },
  },
};

export default defineConfig(options);
