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

1. **Chrome extension** (driven by `manifest.json`): popup + background service worker + content script.
2. **Landing page** (`index.html` → `src/landing/main.tsx`): marketing site hosted on GitHub Pages.

Key boundaries to respect:

- **`src/generators/`** — Pure, framework-free functions that produce test data. This is the single source of truth for all data generation (TCKN check digits, IBAN mod-97, phone prefixes, names from `src/data/names.ts`, etc.). All three entry points (popup, service worker, landing page) import from here via the barrel `src/generators/index.ts`. Never add React / Chrome API dependencies into this directory.
- **`src/background/service-worker.ts`** — Registers the `contextMenus` tree on `onInstalled`, listens for clicks, calls the relevant generator, and `chrome.tabs.sendMessage` to the content script with the right `frameId`. The menu structure is driven by `src/background/data-config.ts` (`DATA_ITEMS_CONFIG`), which is also the canonical list tying a menu `id` → label → category → generator function. **When adding a new data type, you must update `DATA_ITEMS_CONFIG` or it will not appear in the context menu.**
- **`src/content/content-script.ts`** — Tracks the last right-clicked `<input>`/`<textarea>`/`contenteditable` element (the `contextmenu` event fires before the menu is shown) and, on receiving a `FILL_INPUT` message, writes the value and dispatches `input`+`change` events so frameworks like React/Vue detect the change.
- **`src/popup/`** — React 19 popup UI (`popup.html` → `src/popup/main.tsx` → `Popup.tsx`). Uses `src/components/`, `src/hooks/useClipboard.ts`, `src/hooks/useFavorites.ts` (backed by `src/storage/favorites.ts` → `chrome.storage`), and `src/data/dataItems.ts` for the category/items registry.
- **`src/landing/`** — Standalone React app mounted via the root `index.html`. Independent from the extension runtime; safe to use browser-only APIs.
- **`src/App.tsx`** — Vite starter leftover, not wired into either build input. Can be ignored or cleaned up; it is not the popup or landing entry.

### Request flow for right-click → filled input

```
contextMenu click (service-worker)
  → lookup DataItemConfig by id
  → item.generator()        // from src/generators
  → tabs.sendMessage({ type: "FILL_INPUT", value }, { frameId })
  → content-script writes value into lastRightClickedElement
  → dispatches input/change events for framework compatibility
```

### Build targets

`vite.config.ts` declares four Rollup inputs: `index.html` (landing), `popup.html` (extension popup), `src/background/service-worker.ts`, and `src/content/content-script.ts`. The `crx({ manifest })` plugin wires the latter three into the MV3 manifest. `base` is `./` for the extension (relative paths required by Chrome) and `/TestDataHelper/` only when `BUILD_TARGET=pages`.

## Conventions

- Data lists (names, cities, street names, etc.) live in `src/data/` and are imported by generators — keep static data out of generator modules themselves.
- When you add a new generator, export it from `src/generators/index.ts` **and** register it in `src/background/data-config.ts` (for the context menu) **and** in `src/data/dataItems.ts` (for the popup UI) — these three registries are not auto-synced.
- `manifest.json` permissions are intentionally minimal (`storage`, `contextMenus`). The README claims `activeTab` / `scripting` but the actual manifest does not use them; the content script is declared statically via `content_scripts` with `<all_urls>`. Don't add permissions without reason.
