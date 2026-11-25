# Dayboard

A personal, privacy-first new-tab dashboard browser extension. No account, no
tracking, no paywall. See [BRIEF.md](BRIEF.md) for the full product spec.

Built with [WXT](https://wxt.dev), Vue 3, TypeScript, Tailwind CSS, and Pinia.

## Development

```bash
pnpm install
pnpm dev            # Chrome/Edge/Brave — loads unpacked from .output/chrome-mv3-dev
pnpm dev:firefox    # Firefox
```

## Build

```bash
pnpm build           # Chrome/Edge/Brave
pnpm build:firefox    # Firefox
pnpm zip              # packaged zip, both commands have a :firefox variant
```

## Checks

```bash
pnpm compile   # TypeScript
pnpm lint       # ESLint
pnpm format     # Prettier (writes)
```

## Loading unpacked

- **Chrome/Edge/Brave:** `chrome://extensions` → enable Developer Mode → "Load unpacked" → select `.output/chrome-mv3`.
- **Firefox:** `about:debugging` → "This Firefox" → "Load Temporary Add-on" → select any file inside `.output/firefox-mv2`.

## Status

Phase 3 (focus + to-do) complete — see §8 of [BRIEF.md](BRIEF.md) for the full phase plan.
