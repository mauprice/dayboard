<script setup lang="ts">
import { useBackgroundStore } from '@/stores/background';

const background = useBackgroundStore();
</script>

<template>
  <div class="fixed inset-0 -z-10">
    <div
      v-if="background.active.kind === 'gradient'"
      class="absolute inset-0 transition-[background-image] duration-700 ease-out"
      :style="{ backgroundImage: background.active.css }"
    />
    <div
      v-else
      class="absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-out"
      :style="{ backgroundImage: `url(${background.active.imageUrl})` }"
    />
    <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-black/25" />
    <div class="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/45 to-transparent" />
    <div class="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/45 to-transparent" />

    <div class="absolute bottom-16 left-4 flex items-center gap-2 opacity-0 transition-opacity hover:opacity-100 focus-within:opacity-100">
      <button
        type="button"
        class="rounded px-2 py-1 text-xs text-white/70 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        @click="background.skip()"
      >Skip</button>
      <button
        v-if="background.active.kind === 'image'"
        type="button"
        class="rounded px-2 py-1 text-xs hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        :class="background.isFavourited ? 'text-rose-300' : 'text-white/70'"
        @click="background.toggleFavourite()"
      >{{ background.isFavourited ? '♥ Favourited' : '♡ Favourite' }}</button>
      <a
        v-if="background.active.credit"
        :href="background.active.credit.photoUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="text-xs text-white/50 hover:text-white/80"
      >
        Photo by
        <span class="underline">{{ background.active.credit.name }}</span>
        on Unsplash
      </a>
    </div>
  </div>
</template>
