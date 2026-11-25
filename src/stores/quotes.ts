import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useStorage } from '@/composables/useStorage';
import { createSyncedStore } from '@/services/storage';
import { DEFAULT_QUOTES_SETTINGS, migrateQuotesSettings, type QuoteEntry } from '@/types/storage';
import { QUOTES as BUNDLED_QUOTES } from '@/data/quotes';

const quotesStore = createSyncedStore('dayboard:quotes', DEFAULT_QUOTES_SETTINGS, migrateQuotesSettings);

export const useQuotesStore = defineStore('quotes', () => {
  const { state: quotesSettings, ready } = useStorage(quotesStore, DEFAULT_QUOTES_SETTINGS);

  const pool = computed<QuoteEntry[]>(() => {
    if (quotesSettings.value.onlyCustom) {
      return quotesSettings.value.custom.length ? quotesSettings.value.custom : BUNDLED_QUOTES;
    }
    return [...BUNDLED_QUOTES, ...quotesSettings.value.custom];
  });

  function addCustomQuote(text: string, author: string) {
    const trimmedText = text.trim();
    if (!trimmedText) return;
    quotesSettings.value.custom.push({ text: trimmedText, author: author.trim() || 'Unknown' });
  }

  function editCustomQuote(index: number, text: string, author: string) {
    const entry = quotesSettings.value.custom[index];
    if (!entry) return;
    entry.text = text.trim();
    entry.author = author.trim() || 'Unknown';
  }

  function removeCustomQuote(index: number) {
    quotesSettings.value.custom.splice(index, 1);
  }

  function setOnlyCustom(value: boolean) {
    quotesSettings.value.onlyCustom = value;
  }

  function importQuotes(entries: QuoteEntry[]) {
    quotesSettings.value.custom.push(...entries.filter((entry) => entry.text?.trim()));
  }

  return { quotesSettings, ready, pool, addCustomQuote, editCustomQuote, removeCustomQuote, setOnlyCustom, importQuotes };
});
