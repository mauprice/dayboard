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
    permissions: ['storage', 'alarms'],
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
