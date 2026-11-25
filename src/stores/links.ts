import { defineStore } from 'pinia';
import { useStorage } from '@/composables/useStorage';
import { createSyncedStore } from '@/services/storage';
import { DEFAULT_LINKS, migrateLinks } from '@/types/storage';

const linksStore = createSyncedStore('dayboard:links', DEFAULT_LINKS, migrateLinks);

export const useLinksStore = defineStore('links', () => {
  const { state: data, ready } = useStorage(linksStore, DEFAULT_LINKS);

  function addLink(label: string, url: string) {
    data.value.links.push({ id: crypto.randomUUID(), label, url });
  }

  function editLink(id: string, label: string, url: string) {
    const link = data.value.links.find((l) => l.id === id);
    if (!link) return;
    if (label.trim()) link.label = label.trim();
    if (url.trim()) link.url = url.trim();
  }

  function removeLink(id: string) {
    data.value.links = data.value.links.filter((link) => link.id !== id);
  }

  return { data, ready, addLink, editLink, removeLink };
});
