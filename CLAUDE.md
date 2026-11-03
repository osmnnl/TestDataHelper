# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Data Helper is a Chrome extension (Manifest V3) that generates realistic Turkish-locale test data (TCKN, VKN, IBAN, SGK, phone, name, email, address, lorem-ipsum text, etc.) for use in software testing. The same codebase also builds a GitHub Pages landing site.

Primary language in UI, comments, and commit messages: **Turkish**. Keep that convention when editing user-facing strings.

## Commands

- `npm run dev` — Vite dev server (mainly used to iterate on the landing page / `index.html`).
- `npm run build` / `npm run build:ext` — Type-check (`tsc -b`) then `vite build`. Output goes to `dist/` and is what you load as an unpacked extension in `chrome://extensions/`.
- `npm run build:pages` — Same, but sets `BUILD_TARGET=pages` so `vite.config.ts` switches `base` to `/TestDataHelper/` for GitHub Pages deployment.
- `npm run lint` — ESLint over the repo (flat config in `eslint.config.js`).
- `npm run preview` — Preview a production build locally.

There is no test runner configured.

## Architecture

The project produces **two artifacts from one repo** via `@crxjs/vite-plugin` and a dual Rollup input config in `vite.config.ts`:

1. **Chrome extension** (driven by `manifest.json`): popup + side panel + background service worker + on-demand fill engine.
2. **Landing page** (`index.html` → `src/landing/main.tsx`): marketing site hosted on GitHub Pages.

Key boundaries to respect:

- **`src/generators/`** — Pure, framework-free data generators (TCKN, VKN with GİB checksum, 26-char IBAN, MERSİS from VKN, SGK workplace no, il/ilçe/posta/plaka from `src/data/provinces.ts`, salary ≥ minimum wage, purpose dates). No React / Chrome API here.
- **`src/shared/`** — Shared by service worker, engine and UI:
  - `matcher.ts` — `classifyField(hints)` → `FieldKind` (Turkish normalization; label → autocomplete → placeholder → name → id).
  - `values.ts` — `valueFor(kind, ctx)` maps a kind to the persona/company value.
  - `catalog.ts` — the single registry of copyable/insertable items (popup rows, "Alana ekle" menu, bulk columns). **New data types go here.**
  - `bulk.ts` — CSV (BOM, `;`) and XLSX (in-repo store zip + CRC32).
- **`src/content/engine.ts`** — Fill engine. Not a static content script: built as an IIFE to `public/engine.js` by `scripts/build-engine.mjs` and injected on demand with `chrome.scripting.executeScript` (activeTab). Exposes `window.__dataHelper.run({mode, ctx, text, targeted})`; modes `form | preview | field | insert | option | undo | copy | probe`. Fills only the container around the clicked/focused element, handles custom comboboxes, masks, date formats, verify + undo, and draws its toast/preview UI in a shadow root.
- **`src/background/service-worker.ts`** — Persona/company state (`dh.*` in storage), `runInTab` (inject + run, blocked domains, lock/used regeneration), context menu (built once), commands `fill-form` / `fill-field`, and messages `dh:*` from the UI. `globalThis.dataHelper` is exposed for e2e tests.
- **`src/app/`** — One React UI (`App.tsx`, `BulkPanel.tsx`) rendered by both `src/popup/main.tsx` (400×596, must stay ≤600px) and `src/sidepanel/main.tsx`. Side-panel fill needs `optional_host_permissions`, requested from the UI.
- **`src/landing/`** — Standalone landing page; independent from the extension runtime.

## Conventions

- Data lists (names, cities, street names, etc.) live in `src/data/` and are imported by generators — keep static data out of generator modules themselves.
- When you add a new generator, export it from `src/generators/index.ts`, add a `CATALOG` entry in `src/shared/catalog.ts`, and if forms should fill it, a `FieldKind` rule in `matcher.ts` + a case in `values.ts`.
- No new npm dependencies. Permissions stay minimal (`activeTab`, `scripting`, `storage`, `contextMenus`, `sidePanel`; `<all_urls>` only as optional).
