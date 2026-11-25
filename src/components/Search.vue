<script setup lang="ts">
import { ref } from 'vue';
import { browser } from 'wxt/browser';
import { useSettingsStore } from '@/stores/settings';
import type { SearchEngine } from '@/types/storage';

const settings = useSettingsStore();
const query = ref('');

const ENGINE_TEMPLATES: Record<Exclude<SearchEngine, 'custom'>, string> = {
  google: 'https://www.google.com/search?q=%s',
  bing: 'https://www.bing.com/search?q=%s',
  duckduckgo: 'https://duckduckgo.com/?q=%s',
  brave: 'https://search.brave.com/search?q=%s',
};

function buildUrl(q: string): string {
  const engine = settings.settings.searchEngine;
  const template = engine === 'custom' ? settings.settings.customSearchTemplate : ENGINE_TEMPLATES[engine];
  if (!template.includes('%s')) return ENGINE_TEMPLATES.google.replace('%s', encodeURIComponent(q));
  return template.replace('%s', encodeURIComponent(q));
}

async function submit() {
  const q = query.value.trim();
  if (!q) return;

  // Prefer browser.search so results respect the user's actual default
  // engine (BRIEF.md §3.8); only request the optional 'search' permission here.
  try {
    const granted = await browser.permissions.request({ permissions: ['search'] });
    const searchApi = (
      browser as unknown as {
        search?: { search: (opts: { query: string; disposition?: string }) => Promise<void> };
      }
    ).search;
    if (granted && searchApi?.search) {
      await searchApi.search({ query: q, disposition: 'CURRENT_TAB' });
      query.value = '';
      return;
    }
  } catch {
    // fall through to a direct URL
  }

  window.location.href = buildUrl(q);
}
</script>

<template>
  <form class="w-full max-w-md" @submit.prevent="submit">
    <input
      v-model="query"
      type="text"
      placeholder="Search the web…"
      class="w-full rounded-full bg-black/20 px-4 py-2 text-sm text-white placeholder-white/50 outline-none ring-1 ring-white/20 backdrop-blur-sm focus:ring-white/60"
    />
  </form>
</template>
