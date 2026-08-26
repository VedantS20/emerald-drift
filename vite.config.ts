// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// `npm run build:static` sets STATIC=1 to emit a plain static site in dist/client
// for file-only hosts (Apache/nginx/cPanel, S3+CDN) with no Node runtime.
// Without it the build is untouched — SSR via nitro, which is what Lovable's
// Publish uses. Do not hardcode these: `nitro: false` disables nitro inside
// Lovable's own build too, which would break publishing.
const staticBuild = process.env.STATIC === "1";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    // Prerender the app shell to dist/client/index.html; routes render client-side.
    ...(staticBuild ? { spa: { enabled: true, prerender: { outputPath: "/index" } } } : {}),
  },
  // TanStack's prerenderer boots a preview server that loads dist/server/server.js,
  // a path nitro redirects to .output/ — so nitro has to be off for a static build.
  ...(staticBuild ? { nitro: false } : {}),
});
