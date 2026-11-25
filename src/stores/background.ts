import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import { browser } from 'wxt/browser';
import { useStorage } from '@/composables/useStorage';
import { useNow } from '@/composables/useNow';
import { createSyncedStore } from '@/services/storage';
import { GRADIENTS } from '@/data/gradients';
import { listCustomBackgrounds, type CustomBackground } from '@/services/imageCache';
import { fetchRandomUnsplashPhoto, type UnsplashPhoto } from '@/services/unsplash';
import { DEFAULT_BACKGROUND_SETTINGS, migrateBackgroundSettings } from '@/types/storage';

// Vite can auto-discover files under src/ at build time but not under
// public/ — drop real photos in src/assets/backgrounds/ and they just show
// up here, no manifest to maintain. See that folder's README.
const LOCAL_PHOTOS = import.meta.glob('/src/assets/backgrounds/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  import: 'default',
}) as Record<string, string>;
const LOCAL_PHOTO_ENTRIES = Object.entries(LOCAL_PHOTOS);

const UNSPLASH_ORIGINS = ['https://api.unsplash.com/*', 'https://images.unsplash.com/*'];

const backgroundStore = createSyncedStore(
  'dayboard:background',
  DEFAULT_BACKGROUND_SETTINGS,
  migrateBackgroundSettings,
);

export interface ActiveBackground {
  /** Stable identity used for favouriting. */
  id: string;
  kind: 'gradient' | 'image';
  css?: string;
  imageUrl?: string;
  credit?: { name: string; profileUrl: string; photoUrl: string } | null;
}

export const useBackgroundStore = defineStore('background', () => {
  const { state: settings, ready } = useStorage(backgroundStore, DEFAULT_BACKGROUND_SETTINGS);

  const now = useNow(60_000);
  const tabSeed = Math.floor(Math.random() * 1000);
  const manualOffset = ref(0);

  function bucket(poolSize: number): number {
    if (poolSize <= 0) return 0;
    switch (settings.value.rotationInterval) {
      case 'hourly':
        return now.value.getHours() % poolSize;
      case 'daily':
        return now.value.getDate() % poolSize;
      default:
        return tabSeed % poolSize;
    }
  }

  const gradientActive = computed<ActiveBackground>(() => {
    const index = (bucket(GRADIENTS.length) + manualOffset.value) % GRADIENTS.length;
    const gradient = GRADIENTS[index]!;
    return { id: `gradient:${gradient.id}`, kind: 'gradient', css: gradient.css, credit: null };
  });

  const localActive = computed<ActiveBackground | null>(() => {
    if (LOCAL_PHOTO_ENTRIES.length === 0) return null;
    const index = (bucket(LOCAL_PHOTO_ENTRIES.length) + manualOffset.value) % LOCAL_PHOTO_ENTRIES.length;
    const entry = LOCAL_PHOTO_ENTRIES[index]!;
    return { id: `local:${entry[0]}`, kind: 'image', imageUrl: entry[1], credit: null };
  });

  const customPhotos = ref<CustomBackground[]>([]);
  const customObjectUrls = new Map<string, string>();

  function customPhotoUrl(record: CustomBackground): string {
    let url = customObjectUrls.get(record.id);
    if (!url) {
      url = URL.createObjectURL(record.blob);
      customObjectUrls.set(record.id, url);
    }
    return url;
  }

  async function loadCustomPhotos() {
    customPhotos.value = await listCustomBackgrounds();
  }

  const customActive = computed<ActiveBackground | null>(() => {
    if (customPhotos.value.length === 0) return null;
    const index = (bucket(customPhotos.value.length) + manualOffset.value) % customPhotos.value.length;
    const record = customPhotos.value[index]!;
    return { id: `custom:${record.id}`, kind: 'image', imageUrl: customPhotoUrl(record), credit: null };
  });

  const unsplashPhoto = ref<UnsplashPhoto | null>(null);
  const unsplashLoading = ref(false);
  const unsplashError = ref<string | null>(null);

  async function enableUnsplash(): Promise<boolean> {
    try {
      return await browser.permissions.request({ origins: UNSPLASH_ORIGINS });
    } catch (err) {
      // permissions.request() rejects (rather than resolving false) if the
      // browser refuses the request outright — e.g. called outside a direct
      // user gesture, or the origins aren't in the manifest's
      // optional_host_permissions. Surface it instead of swallowing it.
      console.error('[dayboard] Unsplash permission request failed', err);
      unsplashError.value = err instanceof Error ? `Permission request failed: ${err.message}` : 'Permission request failed.';
      return false;
    }
  }

  async function refreshUnsplash() {
    if (!settings.value.unsplashAccessKey) {
      unsplashError.value = 'Add an Unsplash Access Key in Settings → Background.';
      return;
    }
    unsplashLoading.value = true;
    unsplashError.value = null;
    try {
      const photo = await fetchRandomUnsplashPhoto(settings.value.unsplashAccessKey, settings.value.unsplashTopic);
      if (unsplashPhoto.value) URL.revokeObjectURL(unsplashPhoto.value.blobUrl);
      unsplashPhoto.value = photo;
    } catch (err) {
      unsplashError.value = err instanceof Error ? err.message : 'Unsplash request failed.';
    } finally {
      unsplashLoading.value = false;
    }
  }

  const unsplashActive = computed<ActiveBackground | null>(() => {
    const photo = unsplashPhoto.value;
    if (!photo) return null;
    return {
      id: `unsplash:${photo.id}`,
      kind: 'image',
      imageUrl: photo.blobUrl,
      credit: { name: photo.photographerName, profileUrl: photo.photographerProfileUrl, photoUrl: photo.photoLinkUrl },
    };
  });

  const active = computed<ActiveBackground>(() => {
    switch (settings.value.source) {
      case 'local':
        return localActive.value ?? gradientActive.value;
      case 'custom':
        return customActive.value ?? gradientActive.value;
      case 'unsplash':
        return unsplashActive.value ?? gradientActive.value;
      default:
        return gradientActive.value;
    }
  });

  function skip() {
    manualOffset.value += 1;
    if (settings.value.source === 'unsplash') void refreshUnsplash();
  }

  const isFavourited = computed(() => settings.value.favouriteIds.includes(active.value.id));

  function toggleFavourite() {
    const id = active.value.id;
    const list = settings.value.favouriteIds;
    const index = list.indexOf(id);
    if (index === -1) list.push(id);
    else list.splice(index, 1);
  }

  async function setSource(source: typeof settings.value.source) {
    if (source === 'unsplash' && settings.value.source !== 'unsplash') {
      unsplashError.value = null;
      const granted = await enableUnsplash();
      if (!granted) {
        // enableUnsplash() already set a more specific message if it threw;
        // only set the generic one if it resolved false without explaining why.
        unsplashError.value ??= 'Permission to reach Unsplash was not granted, so the source stayed unchanged.';
        return;
      }
    }
    settings.value.source = source;
  }

  watch(
    () => settings.value.source,
    (source) => {
      if (source === 'custom') void loadCustomPhotos();
      if (source === 'unsplash' && !unsplashPhoto.value) void refreshUnsplash();
    },
    { immediate: true },
  );

  return {
    settings,
    ready,
    active,
    isFavourited,
    customPhotos,
    unsplashLoading,
    unsplashError,
    hasLocalPhotos: LOCAL_PHOTO_ENTRIES.length > 0,
    skip,
    toggleFavourite,
    setSource,
    refreshUnsplash,
    loadCustomPhotos,
  };
});
