# Chrome Web Store — Privacy Practices Tab

Reference text for the "Privacy practices" section of the Chrome Web Store
developer dashboard. Paste directly into the corresponding fields.

## Single purpose description

> Dayboard replaces the new tab page with a personal daily dashboard — clock,
> greeting, daily focus, to-do list, local weather, search, quick links, and
> quotes — over a background photo of the user's choosing.

## Permission justifications

**storage**

> Saves all user preferences and content (display name, daily focus, to-dos,
> quick links, quotes, weather location, background settings) using
> chrome.storage so they persist across sessions and sync across the user's
> signed-in devices. No external database is used.

**alarms**

> Uses a single daily alarm to reset the day's focus text and roll over to-do
> state at local midnight, so the dashboard reflects a new day even if the
> browser was closed at midnight or the service worker was asleep at that
> moment.

**geolocation**

> Used only when the user explicitly clicks "Use my location" in the weather
> widget, to look up weather for their current position without typing a
> city name. Never requested automatically on load. Users can instead type a
> city to search, bypassing geolocation entirely.

**host permissions — `https://api.open-meteo.com/*`, `https://geocoding-api.open-meteo.com/*`**

> These are Open-Meteo's free weather-forecast and geocoding APIs. Dayboard
> sends the user's chosen location's latitude/longitude (or a city-name
> search string) to fetch current conditions and a 5-day forecast for the
> weather widget. No API key or user-identifying data is sent.

**optional permission — `search`**

> Requested only at the moment the user performs their first search from the
> dashboard's search box, so Dayboard can call chrome.search.query to run the
> search through the user's actual default search engine rather than a
> hardcoded one. If declined, Dayboard falls back to opening a URL for the
> user's selected search engine directly.

**optional host permissions — `https://api.unsplash.com/*`, `https://images.unsplash.com/*`**

> Requested only if the user opts into "Unsplash" as their background photo
> source in Settings → Background, and only after they've supplied their own
> personal Unsplash API access key. Used solely to fetch a background photo
> by topic (e.g. nature, travel); the key is stored locally and never leaves
> the user's browser except to authenticate directly with Unsplash's API.

## Remote code

> No. All JavaScript and CSS is bundled in the extension package at build
> time. Nothing is fetched and executed at runtime, and no eval()-style
> dynamic code execution is used.

## Data usage disclosure

| Category | Collected? | Notes |
|---|---|---|
| Personally identifiable information | Yes | User's optional display name, entered locally, stored only in chrome.storage, never transmitted anywhere. |
| Location | Yes | Coordinates from navigator.geolocation, only on explicit "Use my location" click, sent only to Open-Meteo to fetch weather. |
| Authentication information | Yes | The user's own Unsplash access key, if they choose to add one, stored locally and sent only to Unsplash to authenticate their own requests. |
| Health information | No | — |
| Financial and payment information | No | — |
| Personal communications | No | — |
| Web history | No | No browsing history is read or stored. |
| User activity | No | No clicks, keystrokes, or usage analytics are collected. |
| Website content | No | — |

**Certifications (all true for Dayboard):**
- I do not sell or transfer user data to third parties outside the approved use cases.
- I do not use or transfer user data for purposes unrelated to the item's single purpose.
- I do not use or transfer user data to determine creditworthiness or for lending purposes.

**Privacy policy URL:** https://mauprice.github.io/dayboard/PRIVACY.html
