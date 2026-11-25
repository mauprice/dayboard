# BRIEF — "Dayboard" New-Tab Browser Extension

> Working name: **Dayboard** (placeholder — rename freely; keep the name in one constant/config so it's a one-line change).
> Owner: Maurice Price / IWC Digital
> Goal: A personal, privacy-first replacement for the Momentum browser extension — a calm, beautiful new-tab dashboard for desktop browsers, with no account, no tracking and no paywall.

---

## 1. Objective

Build a browser extension that replaces the browser's New Tab page with a full-screen personal dashboard: background photo, large clock, greeting, a daily focus, to-dos, a quote, weather, search and quick links.

It must:
- Run on **Chrome, Edge, Brave (Chromium)** and **Firefox** desktop from a single codebase.
- Store all data locally in the browser (sync across the user's own devices via the browser's built-in sync storage). **No backend, no user accounts, no analytics.**
- Load instantly (new tab paint < 150 ms with cached assets) and work offline after first load.

Out of scope for v1: mobile, Safari, team features, paid tiers, a server.

---

## 2. Tech Stack (fixed — do not substitute without asking)

| Concern | Choice |
|---|---|
| Extension framework | **WXT** (wxt.dev) — Manifest V3, builds Chrome + Firefox targets |
| UI | **Vue 3** (Composition API, `<script setup>`) + **TypeScript** (strict) |
| Styling | **Tailwind CSS** |
| State | **Pinia**, persisted through a thin wrapper over `browser.storage` |
| Weather | **Open-Meteo** API (free, no API key) + Open-Meteo geocoding for city search |
| Photos | Bundled local photo set (v1) + optional **Unsplash** source (user supplies own Access Key in settings) |
| Quotes | Bundled JSON file (user-editable via settings; supports custom quotes) |
| Testing | **Vitest** (unit) + **Playwright** (load the built extension, smoke-test new tab) |
| Lint/format | ESLint + Prettier |
| Package manager | pnpm |

Use `browser.*` via WXT's polyfill so the code is cross-browser. No jQuery, no heavy UI kits.

---

## 3. Features (v1)

### 3.1 New Tab override
- `chrome_url_overrides.newtab` → the dashboard page.
- Address bar must not steal focus awkwardly; the search box (if enabled) can take focus optionally (setting).

### 3.2 Background
- Full-bleed photo with a subtle dark gradient overlay for text legibility.
- **Sources:**
  - `local` (default): ~20 royalty-free landscape images bundled in `/public/backgrounds/` (Claude Code: use placeholder gradients + a README noting where Maurice drops his own images; do not download images from the web).
  - `unsplash`: if user enters an Unsplash Access Key, fetch a random photo from a chosen topic (nature, architecture, etc.). Must display photographer credit + link (Unsplash guidelines) and trigger the download-tracking endpoint as required.
  - `custom`: user uploads their own images (stored in IndexedDB, not sync storage — size limits).
  - `solid/gradient`: colour option.
- **Rotation:** every new tab / hourly / daily (setting). Pre-fetch and cache the *next* image so the new tab never waits on network.
- "♡ Favourite" and "Skip" controls on hover, bottom-left, with credit text.

### 3.3 Clock & greeting (centre)
- Large time display; 12h/24h setting; optional seconds.
- Greeting: "Good morning / afternoon / evening, {name}." Name set on first-run onboarding; click to edit inline.

### 3.4 Daily Focus
- Below greeting: "What is your main focus for today?" input.
- Once entered, shows the focus with a checkbox; completing it shows a small celebratory message.
- Resets at local midnight (keep a history list in storage — viewable in settings).

### 3.5 To-do list (bottom-right panel)
- Toggle open/close.
- Add, edit inline, complete, delete, drag-to-reorder.
- Multiple lists (Today, Inbox, + user-created).
- Option: clear completed automatically after N days.

### 3.6 Quote (bottom-centre)
- One quote per day (deterministic by date) or per tab (setting).
- Bundled starter set of ~100 public-domain quotes (no copyrighted modern quotes).
- Settings: add/edit/delete custom quotes, import/export as JSON. Option "Only show my quotes".

### 3.7 Weather (top-right)
- Current temp + icon + location; click to expand to 5-day forecast.
- Location: browser geolocation (ask permission only when the user enables weather) **or** manual city search.
- °C default (owner is in Australia), °F toggle.
- Cache for 30 minutes; show last-known value offline.

### 3.8 Search (top-centre, optional)
- Search box that sends the query to the chosen engine (Google, Bing, DuckDuckGo, Brave, custom URL template with `%s`).
- Prefer the `browser.search` API where available so it respects the user's default engine.

### 3.9 Quick links (top-left)
- "Links" dropdown: user-defined links with favicons (use Google/DuckDuckGo favicon service or `chrome://favicon` where permitted; fall back to letter avatar).
- Optional "Top sites" pane using the `topSites` permission (only requested if the user enables it — use optional permissions).

### 3.10 Settings panel (bottom-left gear icon)
Slide-in panel with tabs:
- **General:** name, clock format, show/hide each widget, theme (auto/light text/dark text), font choice (2–3 options).
- **Background:** source, rotation, Unsplash key & topic, manage custom uploads, favourites.
- **Focus & To-do:** history, auto-clear.
- **Quotes:** manage, import/export.
- **Weather:** location, units.
- **Search & Links.**
- **Data:** Export everything as JSON / Import JSON / Reset all.
- **About:** version, privacy statement ("Nothing leaves your browser except requests to the weather and photo services you enable").

### 3.11 Onboarding (first run)
Two-step: "Hello, what's your name?" → "What's your main focus today?" → dashboard. Skippable.

---

## 4. UX & Design

- Calm, minimal, typographic. Text in white with soft shadow over imagery; all widgets fade in on load (≤ 200 ms).
- Widgets hide on idle optionally ("Zen mode": hover reveals).
- Keyboard: `/` focuses search, `t` toggles to-do, `f` edits focus, `Esc` closes panels.
- Accessible: proper labels, focus rings, contrast check on overlay, respects `prefers-reduced-motion`.
- Responsive from 1024 px to 4K; scales clock with `clamp()`.

---

## 5. Data & Storage

- `browser.storage.sync` for small settings + to-dos + focus + quotes (respect quota: 100 KB total / 8 KB per item — chunk to-do lists if needed, and fall back to `storage.local` with a warning if exceeded).
- `browser.storage.local` for weather cache, photo metadata cache.
- **IndexedDB** for uploaded images and cached photo blobs.
- Define all storage shapes as TypeScript interfaces in `src/types/storage.ts` with a `schemaVersion` and a migration function for future changes.

---

## 6. Permissions (minimal)

Required: `storage`.
Optional (requested at the moment the user enables the feature): `geolocation`, `topSites`, `search`.
Host permissions: only `https://api.open-meteo.com/*`, `https://geocoding-api.open-meteo.com/*`, `https://api.unsplash.com/*`, `https://images.unsplash.com/*` — and Unsplash ones as optional host permissions.

No content scripts. No `<all_urls>`. No remote code.

---

## 7. Project Structure (suggested)

```
dayboard/
  wxt.config.ts
  src/
    entrypoints/
      newtab/          # index.html, main.ts, App.vue
      background.ts    # minimal: image prefetch alarm, midnight reset alarm
    components/
      Clock.vue  Greeting.vue  Focus.vue  TodoPanel.vue
      Quote.vue  Weather.vue  Search.vue  Links.vue
      Background.vue  SettingsPanel.vue  Onboarding.vue
    stores/            # Pinia stores per domain
    services/          # weather.ts, unsplash.ts, storage.ts, imageCache.ts
    data/              # quotes.json
    types/
  public/
    backgrounds/       # bundled images (placeholder README)
    icons/             # 16/32/48/128 icons (placeholder)
  tests/
```

---

## 8. Build Phases

Work through these in order. Commit at the end of each phase; stop and report after each so the owner can review.

1. **Scaffold** — WXT + Vue + TS + Tailwind + Pinia; new-tab override shows "Hello"; builds for Chrome and Firefox; loads unpacked successfully.
2. **Core visual** — background (local + gradient), clock, greeting, onboarding, storage layer with types and migrations.
3. **Focus + To-do** — full functionality, midnight reset via `alarms`.
4. **Quotes + Weather + Search + Links.**
5. **Settings panel + Export/Import + Unsplash + custom uploads.**
6. **Polish** — keyboard shortcuts, zen mode, accessibility pass, performance pass (measure new-tab load), Playwright smoke test.
7. **Packaging** — `pnpm build` and `pnpm zip` for both browsers; README with install-unpacked instructions and store-submission checklist (Chrome Web Store, Edge Add-ons, Firefox AMO), plus a `PRIVACY.md` suitable for the store listing.

---

## 9. Acceptance Criteria

- [ ] Installs unpacked in Chrome and Firefox with no console errors.
- [ ] Opening a new tab shows the dashboard with a background image within 150 ms when cached.
- [ ] Every widget can be hidden; settings persist across browser restart and sync between two signed-in Chrome profiles.
- [ ] Focus resets at local midnight; to-dos persist.
- [ ] Works fully offline (except fresh weather/Unsplash), showing cached data.
- [ ] No network requests except to enabled weather/photo endpoints (verify in DevTools Network tab).
- [ ] Export → Reset → Import restores the identical state.
- [ ] Unit tests for storage, date/reset logic, quote-of-the-day selection; Playwright smoke test passes.
- [ ] `pnpm lint` and `pnpm typecheck` clean.

---

## 10. Notes for Claude Code

- Do not copy Momentum's branding, name, wording, icons, or images — this is an original product inspired by the general new-tab-dashboard concept.
- Ask before adding any dependency not listed in §2.
- Keep components small and readable; prefer composables for shared logic (`useStorage`, `useNow`, `useMidnight`).
- Leave clear `TODO(maurice):` markers where owner input is needed (icons, final name, bundled photos, starter quotes).

## 11. Future Ideas (not v1)

Pomodoro timer · habit tracker · notes widget · countdowns · calendar (Google/Outlook) glance · daily reflection/journal prompt · "Quote from my books" mode drawing from Maurice's own writing · optional self-hosted sync via a small Laravel API.
