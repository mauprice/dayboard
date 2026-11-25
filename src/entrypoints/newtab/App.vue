<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import Background from '@/components/Background.vue';
import Clock from '@/components/Clock.vue';
import Greeting from '@/components/Greeting.vue';
import Focus from '@/components/Focus.vue';
import Quote from '@/components/Quote.vue';
import Weather from '@/components/Weather.vue';
import Search from '@/components/Search.vue';
import Links from '@/components/Links.vue';
import TodoPanel from '@/components/TodoPanel.vue';
import Onboarding from '@/components/Onboarding.vue';
import SettingsPanel from '@/components/SettingsPanel.vue';
import { useOnboardingStore } from '@/stores/onboarding';
import { useSettingsStore } from '@/stores/settings';
import { useMidnight } from '@/composables/useMidnight';
import { runDailyRollover } from '@/services/dailyReset';

const onboarding = useOnboardingStore();
const showOnboarding = computed(() => onboarding.ready && !onboarding.onboarding.completed);

const settings = useSettingsStore();
const widgets = computed(() => settings.settings.widgetVisibility);
const fontClass = computed(() => `font-${settings.settings.fontFamily}`);

const { today } = useMidnight();
// Defensive fallback alongside the background alarm (src/entrypoints/background.ts) —
// idempotent, so running it here too just covers a tab left open across midnight
// or a service worker that was asleep at the boundary.
onMounted(() => void runDailyRollover(today.value));
watch(today, (value) => void runDailyRollover(value));
</script>

<template>
  <main
    class="relative flex h-screen w-screen flex-col items-center justify-center gap-6 overflow-hidden"
    :class="fontClass"
  >
    <Background />

    <div v-if="widgets.links" class="fixed left-4 top-4 z-10">
      <Links />
    </div>
    <div v-if="widgets.search" class="fixed left-1/2 top-4 z-10 w-full max-w-md -translate-x-1/2 px-4">
      <Search />
    </div>
    <div v-if="widgets.weather" class="fixed right-4 top-4 z-10">
      <Weather />
    </div>

    <div class="relative z-10 flex flex-col items-center gap-4">
      <Clock v-if="widgets.clock" />
      <Greeting v-if="widgets.greeting" />
      <Focus v-if="widgets.focus" />
    </div>

    <div v-if="widgets.quote" class="fixed bottom-4 left-1/2 z-10 -translate-x-1/2">
      <Quote />
    </div>

    <TodoPanel v-if="widgets.todo" />
    <SettingsPanel />
    <Onboarding v-if="showOnboarding" />
  </main>
</template>
