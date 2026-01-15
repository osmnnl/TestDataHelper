import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.json";

// https://vite.dev/config/
export default defineConfig(() => {
  // Extension build uses relative paths, GitHub Pages uses absolute
  const isExtensionBuild = process.env.BUILD_TARGET === "extension";

  return {
    plugins: [react(), crx({ manifest })],
    build: {
      outDir: "dist",
      rollupOptions: {
        input: {
          main: "index.html",
          popup: "popup.html",
        },
      },
    },
    base: isExtensionBuild ? "./" : "/TestDataHelper/",
  };
});
