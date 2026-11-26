# Dayboard Privacy Policy

_Last updated: 2026-11-26_

Dayboard is a new-tab dashboard browser extension. This policy explains what data it handles and why.

## Summary

Dayboard does not operate any server of its own, does not collect analytics, and does not send your data to its developer. Everything you configure — your name, focus, to-dos, links, quotes, and settings — is stored only in your own browser, using the browser's built-in extension storage. The only network requests Dayboard makes are the ones described below, and they go straight from your browser to the third-party service in question.

## Data stored locally

The following is stored using `chrome.storage` (synced across your signed-in browser profile via your browser's own sync, exactly like a bookmark) and never leaves your device except as described under "Third-party services" below:

- Your name and display preferences (clock format, font, theme, widget visibility)
- Your daily focus text and its history
- Your to-do lists and items
- Your quick links
- Your custom quotes
- Your weather location (either a city you searched for, or coordinates from "Use my location")
- Your background settings, including your own Unsplash Access Key if you choose to enter one

Custom background photos you upload are stored locally in your browser's IndexedDB and are never uploaded anywhere.

## Third-party services

Dayboard talks directly to the following services, only when the relevant feature is used:

- **Open-Meteo** (`api.open-meteo.com`, `geocoding-api.open-meteo.com`) — powers the weather widget. When you set a location, your latitude/longitude (or the city name you search) is sent to Open-Meteo to fetch a forecast. Open-Meteo is a free, keyless weather API; Dayboard does not send your name or any other identifying information with these requests. See [Open-Meteo's own privacy policy](https://open-meteo.com/en/terms) for how they handle requests.
- **Unsplash** (`api.unsplash.com`, `images.unsplash.com`) — optional background photo source. This is off by default. If you enable it, you supply your **own** Unsplash Access Key (free to obtain from unsplash.com/developers), and Dayboard uses it to request photos directly from Unsplash. Your key is stored locally and is never sent anywhere except to Unsplash itself.
- **Your default search engine** (Google, Bing, DuckDuckGo, Brave, or a custom engine you configure) — when you search from the dashboard, your query is sent to whichever engine you've selected, the same as typing into your browser's address bar.
- **Favicon lookups** for Quick Links use Google's public favicon service to display a small icon next to each link.

No other servers are contacted. Dayboard has no backend, no analytics, and no error/crash reporting.

## Permissions

- `storage` — to save your settings locally, as described above.
- `alarms` — to reset daily state (focus, to-dos) at local midnight.
- `geolocation` — only used if you click "Use my location" in the weather widget; never requested automatically.
- `search` (optional, requested only when you first search) — lets search queries respect your browser's actual default search engine.
- Unsplash host permissions (optional, requested only when you enable Unsplash as a background source).

## Your data, your control

- **Export** — Settings → Data → "Export everything" downloads all of the above as a JSON file to your own device.
- **Import** — restores from a previous export.
- **Reset** — Settings → Data → "Reset all" permanently deletes everything Dayboard has stored, including custom background uploads.

Uninstalling the extension also removes all locally stored data.

## Changes to this policy

If this policy changes, the "Last updated" date above will change accordingly.

## Contact

Questions about this policy can be directed to the developer via the extension's listing page.
