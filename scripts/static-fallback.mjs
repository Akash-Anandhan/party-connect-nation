#!/usr/bin/env node
/**
 * GitHub Pages needs a root `index.html` (for `/`) and a `404.html` (so deep
 * links like `/verify/<token>` fall back to the app shell and hydrate on the
 * client). TanStack Start's SPA mode emits a single `_shell.html` instead, so
 * publish it as both.
 *
 * Runs as `postbuild`. No-ops unless `GH_PAGES=1` so the normal
 * Cloudflare/server build is untouched.
 */
import { copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

if (process.env.GH_PAGES !== "1") process.exit(0);

const clientDir = resolve("dist/client");
const shell = resolve(clientDir, "_shell.html");

if (!existsSync(shell)) {
  console.error(
    `[static-fallback] ${shell} not found.\n` +
      `Run the static build first: GH_PAGES=1 npm run build`,
  );
  process.exit(1);
}

for (const name of ["index.html", "404.html"]) {
  copyFileSync(shell, resolve(clientDir, name));
}

console.log("[static-fallback] wrote dist/client/index.html and dist/client/404.html");
