import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.json";

// https://vite.dev/config/
export default defineConfig(() => {
  // Default build is for extension (relative paths)
  // Only GitHub Pages build uses absolute paths
  const isGitHubPages = process.env.BUILD_TARGET === "pages";

  return {
    plugins: [react(), crx({ manifest })],
    build: {
      outDir: "dist",
      rollupOptions: {
        input: {
          main: "index.html",
          popup: "popup.html",
          "service-worker": "src/background/service-worker.ts",
          "content-script": "src/content/content-script.ts",
        },
      },
    },
    base: isGitHubPages ? "/TestDataHelper/" : "./",
  };
});
