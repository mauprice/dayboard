<script setup lang="ts">
import { onUnmounted, ref } from 'vue';
import { browser } from 'wxt/browser';
import { useSettingsStore } from '@/stores/settings';
import { useBackgroundStore } from '@/stores/background';
import { useFocusStore } from '@/stores/focus';
import { useTodoStore } from '@/stores/todos';
import { useQuotesStore } from '@/stores/quotes';
import { useWeatherStore } from '@/stores/weather';
import { addCustomBackground, removeCustomBackground, type CustomBackground } from '@/services/imageCache';
import { exportAllData, importAllData, resetAllData } from '@/services/backup';
import { APP_NAME } from '@/constants';
import type { QuoteEntry, WeatherLocation, WidgetKey } from '@/types/storage';

const settings = useSettingsStore();
const background = useBackgroundStore();
const focusStore = useFocusStore();
const todos = useTodoStore();
const quotesStore = useQuotesStore();
const weather = useWeatherStore();

const open = ref(false);
type Tab = 'general' | 'background' | 'focus' | 'quotes' | 'weather' | 'search' | 'data' | 'about';
const tab = ref<Tab>('general');
const TABS: { id: Tab; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'background', label: 'Background' },
  { id: 'focus', label: 'Focus & To-do' },
  { id: 'quotes', label: 'Quotes' },
  { id: 'weather', label: 'Weather' },
  { id: 'search', label: 'Search & Links' },
  { id: 'data', label: 'Data' },
  { id: 'about', label: 'About' },
];

const WIDGET_LABELS: Record<WidgetKey, string> = {
  clock: 'Clock',
  greeting: 'Greeting',
  focus: 'Daily focus',
  todo: 'To-do list',
  quote: 'Quote',
  weather: 'Weather',
  search: 'Search box',
  links: 'Quick links',
};

// --- Background: custom uploads ---
const thumbUrls = new Map<string, string>();
function thumbUrl(photo: CustomBackground): string {
  let url = thumbUrls.get(photo.id);
  if (!url) {
    url = URL.createObjectURL(photo.blob);
    thumbUrls.set(photo.id, url);
  }
  return url;
}
onUnmounted(() => {
  for (const url of thumbUrls.values()) URL.revokeObjectURL(url);
});

async function onUploadFiles(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = input.files;
  if (!files) return;
  for (const file of Array.from(files)) await addCustomBackground(file);
  await background.loadCustomPhotos();
  input.value = '';
}

async function removeUpload(id: string) {
  await removeCustomBackground(id);
  await background.loadCustomPhotos();
}

function unfavourite(id: string) {
  const list = background.settings.favouriteIds;
  const index = list.indexOf(id);
  if (index !== -1) list.splice(index, 1);
}

// --- Focus & To-do ---
function toggleAutoClear(event: Event) {
  const checked = (event.target as HTMLInputElement).checked;
  todos.setAutoClear(checked ? 7 : null);
}
function setAutoClearDays(event: Event) {
  const value = Number((event.target as HTMLInputElement).value);
  todos.setAutoClear(Number.isFinite(value) && value > 0 ? value : 1);
}

// --- Quotes ---
const newQuoteText = ref('');
const newQuoteAuthor = ref('');
function submitQuote() {
  quotesStore.addCustomQuote(newQuoteText.value, newQuoteAuthor.value);
  newQuoteText.value = '';
  newQuoteAuthor.value = '';
}
function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
function exportQuotes() {
  downloadJson('dayboard-quotes.json', quotesStore.quotesSettings.custom);
}
async function importQuotesFile(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text()) as QuoteEntry[];
    if (Array.isArray(parsed)) quotesStore.importQuotes(parsed);
  } catch {
    // ignore malformed files — nothing to roll back, state is unchanged
  }
  input.value = '';
}

// --- Weather ---
const citySearch = ref('');
const cityResults = ref<WeatherLocation[]>([]);
async function runCitySearch() {
  const query = citySearch.value.trim();
  if (!query) return;
  cityResults.value = await weather.searchCity(query);
}
function pickCity(location: WeatherLocation) {
  weather.setLocation(location);
  cityResults.value = [];
  citySearch.value = '';
}
function setUnits(event: Event) {
  weather.setUnits((event.target as HTMLSelectElement).value as 'C' | 'F');
}

// --- Data ---
const dataMessage = ref('');
async function exportData() {
  downloadJson('dayboard-backup.json', await exportAllData());
  dataMessage.value = 'Exported.';
}
async function importData(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text()) as Record<string, unknown>;
    await importAllData(parsed);
    dataMessage.value = 'Imported.';
  } catch {
    dataMessage.value = 'Import failed — not a valid Dayboard export.';
  }
  input.value = '';
}
async function confirmReset() {
  if (!window.confirm('Reset all Dayboard data? This cannot be undone.')) return;
  await resetAllData();
  dataMessage.value = 'Reset.';
}

// --- About ---
const version = browser.runtime.getManifest().version;
</script>

<template>
  <div class="fixed bottom-4 left-4 z-30">
    <button
      type="button"
      class="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50"
      aria-label="Settings"
      @click="open = !open"
    >⚙</button>

    <div
      v-if="open"
      class="fixed inset-y-0 left-0 z-40 flex w-full max-w-sm flex-col bg-neutral-900/95 text-white shadow-2xl backdrop-blur-sm"
    >
      <div class="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h2 class="text-sm font-medium">Settings</h2>
        <button type="button" class="text-white/60 hover:text-white" @click="open = false">✕</button>
      </div>

      <nav class="flex flex-wrap gap-1 border-b border-white/10 px-3 py-2">
        <button
          v-for="t in TABS"
          :key="t.id"
          type="button"
          class="rounded px-2 py-1 text-xs"
          :class="tab === t.id ? 'bg-white/20' : 'text-white/60 hover:bg-white/10'"
          @click="tab = t.id"
        >{{ t.label }}</button>
      </nav>

      <div class="flex-1 overflow-y-auto px-4 py-4 text-sm">
        <section v-if="tab === 'general'" class="space-y-4">
          <div>
            <label class="mb-1 block text-xs text-white/60">Name</label>
            <input v-model="settings.settings.name" type="text" class="w-full rounded bg-white/10 px-2 py-1" />
          </div>
          <div>
            <label class="mb-1 block text-xs text-white/60">Clock format</label>
            <select v-model="settings.settings.clockFormat" class="w-full rounded bg-white/10 px-2 py-1">
              <option value="24h">24-hour</option>
              <option value="12h">12-hour</option>
            </select>
          </div>
          <label class="flex items-center gap-2">
            <input v-model="settings.settings.showSeconds" type="checkbox" /> Show seconds
          </label>
          <div>
            <label class="mb-1 block text-xs text-white/60">Text theme</label>
            <select v-model="settings.settings.textTheme" class="w-full rounded bg-white/10 px-2 py-1">
              <option value="auto">Auto</option>
              <option value="light">Light text</option>
              <option value="dark">Dark text</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-xs text-white/60">Font</label>
            <select v-model="settings.settings.fontFamily" class="w-full rounded bg-white/10 px-2 py-1">
              <option value="sans">Sans-serif</option>
              <option value="serif">Serif</option>
              <option value="mono">Monospace</option>
            </select>
          </div>
          <div class="border-t border-white/10 pt-3">
            <p class="mb-1 text-xs text-white/60">Show widgets</p>
            <label v-for="(label, key) in WIDGET_LABELS" :key="key" class="flex items-center gap-2 py-0.5">
              <input v-model="settings.settings.widgetVisibility[key]" type="checkbox" /> {{ label }}
            </label>
          </div>
        </section>

        <section v-if="tab === 'background'" class="space-y-4">
          <div>
            <p class="mb-1 text-xs text-white/60">Source</p>
            <div class="space-y-1">
              <label class="flex items-center gap-2">
                <input
                  type="radio"
                  name="bg-source"
                  :checked="background.settings.source === 'local'"
                  @change="background.setSource('local')"
                /> Local (bundled photos)
              </label>
              <label class="flex items-center gap-2">
                <input
                  type="radio"
                  name="bg-source"
                  :checked="background.settings.source === 'gradient'"
                  @change="background.setSource('gradient')"
                /> Solid gradient
              </label>
              <label class="flex items-center gap-2">
                <input
                  type="radio"
                  name="bg-source"
                  :checked="background.settings.source === 'unsplash'"
                  @change="background.setSource('unsplash')"
                /> Unsplash
              </label>
              <label class="flex items-center gap-2">
                <input
                  type="radio"
                  name="bg-source"
                  :checked="background.settings.source === 'custom'"
                  @change="background.setSource('custom')"
                /> Custom uploads
              </label>
            </div>
            <p v-if="background.settings.source === 'local' && !background.hasLocalPhotos" class="mt-1 text-xs text-amber-300">
              No photos in src/assets/backgrounds yet — showing placeholder gradients until you add some.
            </p>
          </div>

          <div>
            <label class="mb-1 block text-xs text-white/60">Rotation</label>
            <select v-model="background.settings.rotationInterval" class="w-full rounded bg-white/10 px-2 py-1">
              <option value="tab">Every new tab</option>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
            </select>
          </div>

          <div v-if="background.settings.source === 'unsplash'" class="space-y-2 border-t border-white/10 pt-3">
            <label class="mb-1 block text-xs text-white/60">Unsplash Access Key</label>
            <input
              v-model="background.settings.unsplashAccessKey"
              type="password"
              placeholder="Your own key, from unsplash.com/developers"
              class="w-full rounded bg-white/10 px-2 py-1"
            />
            <label class="mb-1 block text-xs text-white/60">Topic</label>
            <select v-model="background.settings.unsplashTopic" class="w-full rounded bg-white/10 px-2 py-1">
              <option value="nature">Nature</option>
              <option value="architecture">Architecture</option>
              <option value="travel">Travel</option>
              <option value="minimal">Minimal</option>
            </select>
            <button
              type="button"
              class="w-full rounded bg-white/10 px-2 py-1 hover:bg-white/20"
              @click="background.refreshUnsplash()"
            >{{ background.unsplashLoading ? 'Fetching…' : 'Fetch new photo' }}</button>
            <p v-if="background.unsplashError" class="text-xs text-rose-300">{{ background.unsplashError }}</p>
          </div>

          <div v-if="background.settings.source === 'custom'" class="space-y-2 border-t border-white/10 pt-3">
            <input type="file" accept="image/*" multiple @change="onUploadFiles" />
            <div class="grid grid-cols-4 gap-1">
              <div v-for="photo in background.customPhotos" :key="photo.id" class="group relative">
                <img :src="thumbUrl(photo)" alt="" class="h-12 w-full rounded object-cover" />
                <button
                  type="button"
                  class="absolute right-0 top-0 rounded-bl bg-black/70 px-1 text-xs opacity-0 group-hover:opacity-100"
                  @click="removeUpload(photo.id)"
                >✕</button>
              </div>
            </div>
            <p v-if="!background.customPhotos.length" class="text-xs text-white/40">No uploads yet.</p>
          </div>

          <div v-if="background.settings.favouriteIds.length" class="border-t border-white/10 pt-3">
            <p class="mb-1 text-xs text-white/60">Favourites</p>
            <ul class="max-h-32 space-y-1 overflow-y-auto text-xs">
              <li v-for="id in background.settings.favouriteIds" :key="id" class="flex items-center justify-between gap-2">
                <span class="truncate">{{ id }}</span>
                <button type="button" class="shrink-0 text-white/50 hover:text-white" @click="unfavourite(id)">Remove</button>
              </li>
            </ul>
          </div>
        </section>

        <section v-if="tab === 'focus'" class="space-y-4">
          <div>
            <p class="mb-1 text-xs text-white/60">Focus history</p>
            <ul class="max-h-40 space-y-1 overflow-y-auto text-xs">
              <li
                v-for="entry in focusStore.focus.history"
                :key="entry.date"
                class="flex items-center justify-between gap-2"
              >
                <span class="shrink-0 text-white/50">{{ entry.date }}</span>
                <span class="flex-1 truncate text-right" :class="{ 'line-through opacity-50': entry.completed }">
                  {{ entry.text }}
                </span>
              </li>
              <li v-if="!focusStore.focus.history.length" class="text-white/40">No history yet.</li>
            </ul>
          </div>
          <div class="border-t border-white/10 pt-3">
            <label class="flex items-center gap-2">
              <input
                type="checkbox"
                :checked="todos.todos.autoClearCompletedAfterDays != null"
                @change="toggleAutoClear"
              /> Auto-clear completed to-dos
            </label>
            <div v-if="todos.todos.autoClearCompletedAfterDays != null" class="mt-2 flex items-center gap-2">
              <span>after</span>
              <input
                type="number"
                min="1"
                class="w-16 rounded bg-white/10 px-2 py-1"
                :value="todos.todos.autoClearCompletedAfterDays"
                @change="setAutoClearDays"
              />
              <span>days</span>
            </div>
          </div>
        </section>

        <section v-if="tab === 'quotes'" class="space-y-3">
          <label class="flex items-center gap-2">
            <input
              type="checkbox"
              :checked="quotesStore.quotesSettings.onlyCustom"
              @change="quotesStore.setOnlyCustom(($event.target as HTMLInputElement).checked)"
            /> Only show my quotes
          </label>

          <div class="space-y-1">
            <div
              v-for="(entry, index) in quotesStore.quotesSettings.custom"
              :key="index"
              class="flex items-center gap-1 text-xs"
            >
              <input v-model="entry.text" class="flex-1 rounded bg-white/10 px-2 py-1" />
              <input v-model="entry.author" class="w-20 rounded bg-white/10 px-2 py-1" />
              <button type="button" class="text-white/40 hover:text-white" @click="quotesStore.removeCustomQuote(index)">✕</button>
            </div>
            <p v-if="!quotesStore.quotesSettings.custom.length" class="text-xs text-white/40">No custom quotes yet.</p>
          </div>

          <form class="flex flex-col gap-1 border-t border-white/10 pt-2" @submit.prevent="submitQuote">
            <input v-model="newQuoteText" placeholder="New quote" class="rounded bg-white/10 px-2 py-1" />
            <input v-model="newQuoteAuthor" placeholder="Author" class="rounded bg-white/10 px-2 py-1" />
            <button type="submit" class="rounded bg-white/10 px-2 py-1 hover:bg-white/20">Add quote</button>
          </form>

          <div class="flex gap-2 border-t border-white/10 pt-2 text-xs">
            <button type="button" class="rounded bg-white/10 px-2 py-1 hover:bg-white/20" @click="exportQuotes">
              Export quotes
            </button>
            <label class="cursor-pointer rounded bg-white/10 px-2 py-1 hover:bg-white/20">
              Import quotes
              <input type="file" accept="application/json" class="hidden" @change="importQuotesFile" />
            </label>
          </div>
        </section>

        <section v-if="tab === 'weather'" class="space-y-3">
          <div>
            <p class="mb-1 text-xs text-white/60">Location</p>
            <p v-if="weather.settings.location" class="mb-2">{{ weather.settings.location.label }}</p>
            <button type="button" class="rounded bg-white/10 px-2 py-1 hover:bg-white/20" @click="weather.useMyLocation()">
              Use my location
            </button>
            <form class="mt-2 flex gap-1" @submit.prevent="runCitySearch">
              <input v-model="citySearch" placeholder="Search city…" class="flex-1 rounded bg-white/10 px-2 py-1" />
            </form>
            <ul v-if="cityResults.length" class="mt-1 max-h-28 overflow-y-auto text-xs">
              <li
                v-for="result in cityResults"
                :key="`${result.latitude}-${result.longitude}`"
                class="cursor-pointer rounded px-1 py-1 hover:bg-white/10"
                @click="pickCity(result)"
              >{{ result.label }}</li>
            </ul>
          </div>
          <div>
            <label class="mb-1 block text-xs text-white/60">Units</label>
            <select :value="weather.settings.units" class="w-full rounded bg-white/10 px-2 py-1" @change="setUnits">
              <option value="C">Celsius</option>
              <option value="F">Fahrenheit</option>
            </select>
          </div>
        </section>

        <section v-if="tab === 'search'" class="space-y-3">
          <div>
            <label class="mb-1 block text-xs text-white/60">Search engine</label>
            <select v-model="settings.settings.searchEngine" class="w-full rounded bg-white/10 px-2 py-1">
              <option value="google">Google</option>
              <option value="bing">Bing</option>
              <option value="duckduckgo">DuckDuckGo</option>
              <option value="brave">Brave</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div v-if="settings.settings.searchEngine === 'custom'">
            <label class="mb-1 block text-xs text-white/60">Custom template (must contain %s)</label>
            <input
              v-model="settings.settings.customSearchTemplate"
              placeholder="https://example.com/search?q=%s"
              class="w-full rounded bg-white/10 px-2 py-1"
            />
          </div>
          <p class="border-t border-white/10 pt-3 text-xs text-white/50">
            Quick links are managed from the "Links" button on the dashboard itself.
          </p>
        </section>

        <section v-if="tab === 'data'" class="space-y-2">
          <button type="button" class="w-full rounded bg-white/10 px-2 py-2 hover:bg-white/20" @click="exportData">
            Export everything (JSON)
          </button>
          <label class="block w-full cursor-pointer rounded bg-white/10 px-2 py-2 text-center hover:bg-white/20">
            Import JSON
            <input type="file" accept="application/json" class="hidden" @change="importData" />
          </label>
          <button
            type="button"
            class="w-full rounded bg-rose-900/60 px-2 py-2 hover:bg-rose-900"
            @click="confirmReset"
          >Reset all</button>
          <p v-if="dataMessage" class="text-xs text-white/60">{{ dataMessage }}</p>
        </section>

        <section v-if="tab === 'about'" class="space-y-2">
          <p>{{ APP_NAME }} v{{ version }}</p>
          <p class="text-white/60">
            Nothing leaves your browser except requests to the weather and photo services you enable.
          </p>
        </section>
      </div>
    </div>
  </div>
</template>
