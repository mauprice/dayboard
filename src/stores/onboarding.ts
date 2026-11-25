import { defineStore } from 'pinia';
import { useStorage } from '@/composables/useStorage';
import { createSyncedStore } from '@/services/storage';
import { DEFAULT_ONBOARDING, migrateOnboarding } from '@/types/storage';

const onboardingStore = createSyncedStore('dayboard:onboarding', DEFAULT_ONBOARDING, migrateOnboarding);

export const useOnboardingStore = defineStore('onboarding', () => {
  const { state: onboarding, ready } = useStorage(onboardingStore, DEFAULT_ONBOARDING);

  function complete() {
    onboarding.value.completed = true;
  }

  return { onboarding, ready, complete };
});
