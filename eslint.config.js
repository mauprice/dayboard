import pluginVue from 'eslint-plugin-vue';
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import eslintConfigPrettier from 'eslint-config-prettier';

export default defineConfigWithVueTs(
  { ignores: ['.output/**', '.wxt/**', 'node_modules/**'] },
  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,
  eslintConfigPrettier,
  {
    rules: {
      // BRIEF.md §7 specifies single-word component names (Clock, Greeting, Focus, ...).
      'vue/multi-word-component-names': 'off',
    },
  },
);
