// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { copyFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

function tanStackPreviewEntryCompat() {
  return {
    name: "tanstack-preview-entry-compat",
    closeBundle() {
      const indexEntry = join(process.cwd(), "dist/server/index.js");
      const previewEntry = join(process.cwd(), "dist/server/server.js");

      if (!existsSync(indexEntry)) return;

      const current = existsSync(previewEntry) ? readFileSync(previewEntry, "utf8") : null;
      const next = readFileSync(indexEntry, "utf8");
      if (current !== next) copyFileSync(indexEntry, previewEntry);
    },
  };
}

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  plugins: [tanStackPreviewEntryCompat()],
  tanstackStart: {
    server: { entry: "server" },
  },
});
