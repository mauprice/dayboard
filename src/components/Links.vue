<script setup lang="ts">
import { ref } from 'vue';
import { useLinksStore } from '@/stores/links';

const links = useLinksStore();
const open = ref(false);
const adding = ref(false);
const newLabel = ref('');
const newUrl = ref('');
const editingId = ref<string | null>(null);
const editLabel = ref('');
const editUrl = ref('');
const brokenFavicons = ref(new Set<string>());

function faviconUrl(url: string): string {
  try {
    const { hostname } = new URL(url);
    return `https://www.google.com/s2/favicons?sz=64&domain=${hostname}`;
  } catch {
    return '';
  }
}

function markBroken(id: string) {
  brokenFavicons.value.add(id);
}

function avatarColor(label: string): string {
  const palette = ['#7c3aed', '#be123c', '#0369a1', '#166534', '#b45309', '#334155'];
  let hash = 0;
  for (let i = 0; i < label.length; i++) hash = (hash * 31 + label.charCodeAt(i)) >>> 0;
  return palette[hash % palette.length]!;
}

function submitNew() {
  const label = newLabel.value.trim();
  const url = newUrl.value.trim();
  if (!label || !url) return;
  links.addLink(label, url);
  newLabel.value = '';
  newUrl.value = '';
  adding.value = false;
}

function startEdit(id: string, label: string, url: string) {
  editingId.value = id;
  editLabel.value = label;
  editUrl.value = url;
}

function commitEdit() {
  if (editingId.value) links.editLink(editingId.value, editLabel.value, editUrl.value);
  editingId.value = null;
}
</script>

<template>
  <div class="relative text-white">
    <button
      type="button"
      class="flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-white/90 transition hover:bg-white/10"
      @click="open = !open"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="h-5 w-5 drop-shadow-md">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
        />
      </svg>
      <span class="text-[11px] font-medium tracking-wide drop-shadow-md">Links</span>
    </button>

    <div
      v-if="open"
      class="absolute left-0 top-full z-10 mt-2 w-72 rounded-xl bg-neutral-900/90 p-2 shadow-2xl ring-1 ring-white/10 backdrop-blur-sm"
    >
      <ul class="max-h-80 space-y-1 overflow-y-auto">
        <li
          v-for="link in links.data.links"
          :key="link.id"
          class="group flex items-center gap-2 rounded px-2 py-1.5 hover:bg-white/5"
        >
          <template v-if="editingId === link.id">
            <input v-model="editLabel" type="text" class="w-20 rounded bg-white/10 px-1 text-xs" />
            <input
              v-model="editUrl"
              type="text"
              class="flex-1 rounded bg-white/10 px-1 text-xs"
              @keyup.enter="commitEdit"
            />
            <button type="button" class="text-xs text-white/60 hover:text-white" @click="commitEdit">Save</button>
          </template>
          <template v-else>
            <a :href="link.url" class="flex flex-1 items-center gap-2 overflow-hidden">
              <img
                v-if="!brokenFavicons.has(link.id)"
                :src="faviconUrl(link.url)"
                class="h-5 w-5 shrink-0 rounded-sm"
                alt=""
                @error="markBroken(link.id)"
              />
              <span
                v-else
                class="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm text-[10px] font-semibold text-white"
                :style="{ backgroundColor: avatarColor(link.label) }"
              >{{ link.label.charAt(0).toUpperCase() }}</span>
              <span class="truncate text-sm">{{ link.label }}</span>
            </a>
            <button
              type="button"
              class="shrink-0 text-xs text-white/30 opacity-0 hover:text-white/80 group-hover:opacity-100"
              @click="startEdit(link.id, link.label, link.url)"
            >Edit</button>
            <button
              type="button"
              class="shrink-0 text-white/30 opacity-0 hover:text-white/80 group-hover:opacity-100"
              @click="links.removeLink(link.id)"
            >✕</button>
          </template>
        </li>
      </ul>

      <form v-if="adding" class="mt-2 flex flex-col gap-1 border-t border-white/10 pt-2" @submit.prevent="submitNew">
        <input
          v-model="newLabel"
          type="text"
          placeholder="Label (e.g. Gmail)"
          class="rounded bg-white/10 px-2 py-1 text-sm outline-none ring-1 ring-white/20 focus:ring-white/60"
        />
        <input
          v-model="newUrl"
          type="text"
          placeholder="https://…"
          class="rounded bg-white/10 px-2 py-1 text-sm outline-none ring-1 ring-white/20 focus:ring-white/60"
        />
        <button type="submit" class="rounded bg-white/90 px-2 py-1 text-sm text-neutral-900 hover:bg-white">
          Add link
        </button>
      </form>
      <button
        v-else
        type="button"
        class="mt-2 w-full border-t border-white/10 pt-2 text-sm text-white/60 hover:text-white"
        @click="adding = true"
      >+ Add link</button>
    </div>
  </div>
</template>
