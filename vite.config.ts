import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import { rmSync } from "node:fs";
import manifest from "./manifest.json";

// https://vite.dev/config/
export default defineConfig(() => {
  // Default build is for extension (relative paths)
  // Only GitHub Pages build uses absolute paths
  const isGitHubPages = process.env.BUILD_TARGET === "pages";

  return {
    plugins: [
      react(),
      crx({ manifest }),
      // Site görselleri (public/site) yalnız GitHub Pages'e; eklenti paketine girmez
      !isGitHubPages && {
        name: "drop-site-assets",
        closeBundle() {
          rmSync("dist/site", { recursive: true, force: true });
        },
      },
    ],
    build: {
      outDir: "dist",
      rollupOptions: {
        input: {
          main: "index.html",
          popup: "popup.html",
          sidepanel: "sidepanel.html",
          "service-worker": "src/background/service-worker.ts",
        },
      },
    },
    base: isGitHubPages ? "/TestDataHelper/" : "./",
  };
});
