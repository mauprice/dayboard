<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useWeatherStore } from '@/stores/weather';
import type { WeatherLocation } from '@/types/storage';

const weather = useWeatherStore();
const expanded = ref(false);
const citySearch = ref('');
const cityResults = ref<WeatherLocation[]>([]);
const searching = ref(false);

onMounted(() => {
  if (weather.settings.location) void weather.refresh();
});

function weatherIcon(code: number): string {
  if (code === 0) return '☀️';
  if ([1, 2, 3].includes(code)) return '⛅';
  if ([45, 48].includes(code)) return '🌫️';
  if ([51, 53, 55, 56, 57, 80, 81, 82].includes(code)) return '🌦️';
  if ([61, 63, 65, 66, 67].includes(code)) return '🌧️';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return '❄️';
  if ([95, 96, 99].includes(code)) return '⛈️';
  return '🌡️';
}

function toDisplayTemp(celsius: number): string {
  const value = weather.settings.units === 'F' ? (celsius * 9) / 5 + 32 : celsius;
  return `${Math.round(value)}°${weather.settings.units}`;
}

async function runCitySearch() {
  const query = citySearch.value.trim();
  if (!query) return;
  searching.value = true;
  cityResults.value = await weather.searchCity(query);
  searching.value = false;
}

function pickCity(location: WeatherLocation) {
  weather.setLocation(location);
  cityResults.value = [];
  citySearch.value = '';
}
</script>

<template>
  <div class="relative text-right text-white">
    <button
      v-if="weather.settings.location"
      type="button"
      class="flex items-center gap-2 rounded-lg bg-black/20 px-3 py-2 backdrop-blur-sm hover:bg-black/30"
      @click="expanded = !expanded"
    >
      <span class="text-xl leading-none">{{ weather.snapshot ? weatherIcon(weather.snapshot.weatherCode) : '…' }}</span>
      <span class="text-sm">
        <span v-if="weather.snapshot">{{ toDisplayTemp(weather.snapshot.currentTempC) }}</span>
        <span v-else-if="weather.loading">Loading…</span>
        <span v-else>—</span>
        <span class="block text-xs text-white/60">{{ weather.settings.location.label }}</span>
      </span>
    </button>

    <div v-else class="w-56 rounded-lg bg-black/30 p-3 text-left backdrop-blur-sm">
      <p class="mb-2 text-xs text-white/70">Add your location to see the weather.</p>
      <button
        type="button"
        class="mb-2 w-full rounded bg-white/90 px-2 py-1 text-sm text-neutral-900 hover:bg-white"
        @click="weather.useMyLocation()"
      >Use my location</button>
      <form class="flex gap-1" @submit.prevent="runCitySearch">
        <input
          v-model="citySearch"
          type="text"
          placeholder="Search city…"
          class="flex-1 rounded bg-white/10 px-2 py-1 text-xs text-white outline-none ring-1 ring-white/20 focus:ring-white/60"
        />
      </form>
      <ul v-if="cityResults.length" class="mt-1 max-h-32 overflow-y-auto text-xs">
        <li
          v-for="result in cityResults"
          :key="`${result.latitude}-${result.longitude}`"
          class="cursor-pointer rounded px-1 py-1 hover:bg-white/10"
          @click="pickCity(result)"
        >{{ result.label }}</li>
      </ul>
      <p v-else-if="searching" class="mt-1 text-xs text-white/50">Searching…</p>
    </div>

    <div
      v-if="expanded && weather.snapshot"
      class="absolute right-0 top-full z-10 mt-2 w-64 rounded-lg bg-black/60 p-3 text-left text-sm backdrop-blur-sm"
    >
      <ul class="space-y-1">
        <li v-for="day in weather.snapshot.daily" :key="day.date" class="flex items-center justify-between">
          <span class="text-white/70">{{ day.date.slice(5) }}</span>
          <span>{{ weatherIcon(day.weatherCode) }}</span>
          <span>{{ toDisplayTemp(day.tempMaxC) }} / {{ toDisplayTemp(day.tempMinC) }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
