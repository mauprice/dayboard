import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useStorage } from '@/composables/useStorage';
import { createSyncedStore } from '@/services/storage';
import { DEFAULT_WEATHER_SETTINGS, migrateWeatherSettings, type WeatherLocation } from '@/types/storage';
import { fetchWeather, geocodeCity, getCachedWeather, isFresh, type WeatherSnapshot } from '@/services/weather';

const weatherSettingsStore = createSyncedStore('dayboard:weather', DEFAULT_WEATHER_SETTINGS, migrateWeatherSettings);

export const useWeatherStore = defineStore('weather', () => {
  const { state: settings, ready } = useStorage(weatherSettingsStore, DEFAULT_WEATHER_SETTINGS);
  const snapshot = ref<WeatherSnapshot | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function refresh(force = false) {
    const location = settings.value.location;
    if (!location) return;

    if (!force) {
      const cached = snapshot.value ?? (await getCachedWeather());
      if (cached && isFresh(cached) && cached.location.label === location.label) {
        snapshot.value = cached;
        return;
      }
    }

    loading.value = true;
    error.value = null;
    try {
      snapshot.value = await fetchWeather(location);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Weather unavailable';
      snapshot.value = snapshot.value ?? (await getCachedWeather());
    } finally {
      loading.value = false;
    }
  }

  // geolocation is a required (not optional) manifest permission — see
  // wxt.config.ts — so the only gate on "ask only when enabled" is that this
  // is never called except from the user's "Use my location" click.
  async function useMyLocation() {
    await new Promise<void>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          settings.value.location = {
            label: 'My location',
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          settings.value.mode = 'auto';
          resolve();
        },
        () => resolve(),
        { timeout: 10_000 },
      );
    });

    await refresh(true);
  }

  function searchCity(query: string): Promise<WeatherLocation[]> {
    return geocodeCity(query);
  }

  function setLocation(location: WeatherLocation) {
    settings.value.location = location;
    settings.value.mode = 'manual';
    void refresh(true);
  }

  function setUnits(units: 'C' | 'F') {
    settings.value.units = units;
  }

  return { settings, ready, snapshot, loading, error, refresh, useMyLocation, searchCity, setLocation, setUnits };
});
