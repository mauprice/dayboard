<script setup lang="ts">
import { computed } from 'vue';
import Background from '@/components/Background.vue';
import Clock from '@/components/Clock.vue';
import Greeting from '@/components/Greeting.vue';
import Onboarding from '@/components/Onboarding.vue';
import { useOnboardingStore } from '@/stores/onboarding';

const onboarding = useOnboardingStore();
const showOnboarding = computed(() => onboarding.ready && !onboarding.onboarding.completed);
</script>

<template>
  <main class="relative flex h-screen w-screen flex-col items-center justify-center gap-6 overflow-hidden">
    <Background />
    <div class="relative z-10 flex flex-col items-center gap-4">
      <Clock />
      <Greeting />
    </div>
    <Onboarding v-if="showOnboarding" />
  </main>
</template>
