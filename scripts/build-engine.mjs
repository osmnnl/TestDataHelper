// Sayfa içi doldurma motorunu tek IIFE dosyası olarak public/engine.js'e derler.
// chrome.scripting.executeScript({ files }) modül yükleyemediği için ayrı derlenir.
import { build } from "vite";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

await build({
  root,
  configFile: false,
  logLevel: "warn",
  publicDir: false,
  build: {
    outDir: "public",
    emptyOutDir: false,
    minify: true,
    lib: {
      entry: "src/content/engine.ts",
      formats: ["iife"],
      name: "DataHelperEngine",
      fileName: () => "engine.js",
    },
  },
});
