# Data Helper - Chrome Extension

<div align="center">
  <img src="public/icons/icon128.png" alt="Data Helper" width="128" height="128">
  <h3>Test Data Generator for Chrome Browser</h3>
  <p>Turkish-locale fake data: TCKN, IBAN, credit card, plate, address, company, passport — all locally in your browser</p>

  <p>
    <a href="https://chromewebstore.google.com/detail/data-helper/hboimhjgdphpokonjindjhgoihkmboli" target="_blank">
      <img src="https://img.shields.io/badge/🚀_Install-Chrome_Web_Store-green?style=for-the-badge&logo=google-chrome" alt="Install from Chrome Web Store">
    </a>
    <a href="https://osmnnl.github.io/TestDataHelper/" target="_blank">
      <img src="https://img.shields.io/badge/🌐_Visit-Website-blue?style=for-the-badge&logo=github-pages" alt="Visit Website">
    </a>
    <a href="https://github.com/osmnnl/TestDataHelper" target="_blank">
      <img src="https://img.shields.io/badge/⭐_Star-Repository-yellow?style=for-the-badge&logo=github" alt="Star Repository">
    </a>
  </p>
</div>

## ✨ Features

### Generation
- **30+ data types**: TCKN, VKN, IBAN (16 banks), credit card with Luhn + CVV + expiry, MERSIS, SMMM, SGK, KEP email, phone, address, plate, postal code, passport, driver's license, company name, and more
- **🧑 Persona mode** — generate a single coherent identity where TCKN, name, email, IBAN, credit card, address and every other field all match the same fictional person
- **🎲 Deterministic seed** — same seed → same persona; reproducible test data for regression testing
- **🧩 Regex custom patterns** — `[A-Z]{3}-\d{5}` style custom IDs/SKUs
- **⬇ Bulk CSV export** — 25-persona CSV in one click
- **🔗 Persona share code** — `dhp:v1:…` base64 shareable persona (no server)

### Fill
- **Right-click menu** — on `<input>`, `<textarea>`, `<select>`, `contenteditable`
- **⚡ Smart form fill** — scans the page, heuristically matches labels/names/placeholders to persona fields, fills them all
- **📌 Smart autofill (single field)** — detects the most likely data type for the focused input and fills it
- **🎲 Random option on selects** — one-click random choice on native `<select>`
- **🖱️ Drag-to-fill** — drag any data card onto a page input (native browser drop)
- **💾 Form snapshot / replay** — capture the form state on a URL, restore it later (per-origin)

### UI / UX
- **Side Panel** — persistent panel with smart-fill button for the active tab
- **Popup search** — `/` shortcut to filter data cards by label
- **Keyboard shortcut** — `Ctrl+Shift+D` (macOS: `Cmd+Shift+D`) opens the popup
- **Drag-to-reorder favorites** — native HTML5 drag-drop
- **Session history** — last 20 generated values, accessible from popup
- **Automatic dark mode** — `prefers-color-scheme` with full CSS token system
- **Action badge** — short code of the latest generated value

### Privacy
- **No `<all_urls>` content script** — pure on-demand injection via `chrome.scripting.executeScript`
- **Domain blacklist** — glob patterns (`*.banka.com.tr`) that disable the extension on sensitive sites
- **`storage.sync` → `local` → `localStorage` fallback** — favorites sync across devices; extension is fully offline

## 📦 Supported Data Types

| 💳 Financial / Business | 👤 Personal | 📍 Address & Docs | 📝 Text |
|---|---|---|---|
| TC Kimlik No | Ad / Soyad / Ad Soyad | Tam Adres | 50 / 100 / 250 / 500 char |
| Vergi Kimlik No | E-posta | Ülke | Lorem Ipsum |
| IBAN (16 banka) | KEP E-posta | İl / İlçe | **Regex pattern** (özel) |
| SGK Sicil No | Kullanıcı Adı | Mahalle / Cadde / Sokak |  |
| SMMM Sicil No | Telefon (GSM) | Bina No / Daire No |  |
| MERSIS No | Doğum Tarihi | Posta Kodu |  |
| Firma Adı |  | Plaka |  |
| Kredi Kartı (Luhn) |  | Ehliyet Sınıfı + No |  |
| CVV / Son Kullanma |  | Pasaport No |  |

## 🚀 Installation

### From Chrome Web Store (Recommended)

**[👉 Install Data Helper](https://chromewebstore.google.com/detail/data-helper/hboimhjgdphpokonjindjhgoihkmboli)**

### Manual (Developer Mode)

```bash
git clone https://github.com/osmnnl/TestDataHelper.git
cd TestDataHelper
npm install
npm run build
```

Then in Chrome:
1. Go to `chrome://extensions/` and enable **Developer mode**
2. Click **Load unpacked** and select the `dist/` folder

## 📖 Usage

### Right-Click (most common)
1. Right-click any input / select / contenteditable
2. `Data Helper` → pick category → pick data type, **or**
3. `Data Helper → ⚡ Bu formu persona ile doldur` to fill the entire form, **or**
4. `Data Helper → 📌 Akıllı doldur` to auto-detect the data type for the focused field

### Popup
Click the toolbar icon (or `Ctrl+Shift+D`):
- **Persona** tab — view/regenerate the consistent identity, copy fields individually, export as JSON or CSV, use a seed for reproducible output
- **Favoriler / Finansal / Kişisel / Metin / Geçmiş** — browse, filter (`/`), copy, favorite
- **⚙ Ayarlar** — JSON backup/restore, domain blacklist, persona share-code import, form snapshots

### Side Panel
Click `⇨` in the popup header to promote the UI to a persistent side panel with a top-level "⚡ Fill this tab's form" button.

## ⚙️ Technical Details

### Stack
- **Frontend**: React 19 + TypeScript + Vite
- **Extension**: Chrome Manifest V3 (service worker, no background page)
- **Styling**: Vanilla CSS with a light/dark token system

### Permissions

| Permission | Why |
|---|---|
| `storage` | Persist favorites, settings, session history — all local |
| `contextMenus` | Add the "Data Helper" right-click menu |
| `activeTab` | Write generated data into the currently active tab — only when the user clicks a menu item |
| `scripting` | One-shot fill function injection on user action |
| `sidePanel` | Open the persistent side panel UI (Chrome 114+) |

**No** `<all_urls>` content script, **no** host_permissions, **no** remote code.

## 🔒 Security & Privacy

- All data is generated **locally** — no network calls, no analytics, no tracking
- Credit card numbers pass the Luhn checksum but are **not tied to real accounts** — test-only
- Right-click menu injection is **user-gesture triggered** via `activeTab`
- Domain blacklist lets you disable the extension entirely on sensitive hosts (banking, healthcare) — glob syntax: `*.banka.com.tr`
- See [PRIVACY.md](PRIVACY.md) for full policy

## 📝 License

MIT — see [LICENSE](LICENSE).

## 🤝 Contributing

1. Fork this repo
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes
4. Push and open a Pull Request

## 🐛 Bug Reports

[GitHub Issues](https://github.com/osmnnl/TestDataHelper/issues)

## 📞 Contact

- **Developer**: [GitHub](https://github.com/osmnnl)
- **Email**: osmnnldev@gmail.com

---

<div align="center">
  <p>⭐ Star the project if you find it useful!</p>
</div>
