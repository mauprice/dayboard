import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/reference/wxt/interfaces/inlineconfig.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-vue'],
  manifest: {
    name: 'Dayboard',
    description: 'A calm, privacy-first new-tab dashboard.',
    permissions: ['storage'],
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
