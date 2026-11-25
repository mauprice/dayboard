import { computed } from 'vue';
import { useSettingsStore } from '@/stores/settings';

/**
 * Whether the bare overlay text (Clock/Greeting/Focus/Quote — the text with
 * no pill background of its own) should render light. 'auto' and 'light'
 * both resolve to light text, since that's what reads well against the dark
 * gradient overlay (Background.vue) by default; 'dark' is an explicit
 * override for users who've picked an image bright enough to need it.
 */
export function useTextTheme() {
  const settings = useSettingsStore();
  const isLight = computed(() => settings.settings.textTheme !== 'dark');
  return { isLight };
}
