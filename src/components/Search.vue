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
  <form class="relative w-full max-w-md" @submit.prevent="submit">
    <input
      v-model="query"
      type="text"
      placeholder="Search the web…"
      class="w-full rounded-full bg-white/10 py-3 pl-10 pr-4 text-sm text-white placeholder-white/50 outline-none ring-1 ring-white/20 backdrop-blur-sm focus:ring-white/60"
    />
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
      />
    </svg>
  </form>
</template>
