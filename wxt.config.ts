import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/reference/wxt/interfaces/inlineconfig.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-vue'],
  manifest: {
    name: 'Dayboard',
    description: 'A calm, privacy-first new-tab dashboard.',
    // 'alarms' isn't in BRIEF.md §6's list but is required for the midnight-reset
    // alarm §7/§8 specify for background.ts — no user-visible permission prompt,
    // Chrome/Firefox don't surface 'alarms' in the install dialog.
    // 'geolocation' can't be an optional_permission (Chrome excludes it from
    // the requestable set — it has its own browser-level location prompt
    // instead), so it's declared here; navigator.geolocation is only ever
    // called from the "Use my location" button click (src/stores/weather.ts),
    // never on load, which is what BRIEF.md §3.7/§6 actually care about.
    permissions: ['storage', 'alarms', 'geolocation'],
    // Open-Meteo hosts per BRIEF.md §6 (required, no prompt beyond normal install).
    host_permissions: ['https://api.open-meteo.com/*', 'https://geocoding-api.open-meteo.com/*'],
    // 'search' is requested at the moment the user submits a search (§3.8).
    optional_permissions: ['search'],
    browser_specific_settings: {
      gecko: {
        // TODO(maurice): replace with a real identifier before AMO submission.
        id: 'dayboard@iwcdigital.example',
      },
    },
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
