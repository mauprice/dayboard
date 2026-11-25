import { browser } from 'wxt/browser';
import type { WeatherLocation } from '@/types/storage';

const CACHE_KEY = 'dayboard:weather-cache';
const CACHE_TTL_MS = 30 * 60 * 1000;

export interface WeatherDaily {
  date: string;
  weatherCode: number;
  tempMaxC: number;
  tempMinC: number;
}

export interface WeatherSnapshot {
  location: WeatherLocation;
  currentTempC: number;
  weatherCode: number;
  daily: WeatherDaily[];
  fetchedAt: number;
}

interface OpenMeteoForecastResponse {
  current_weather: { temperature: number; weathercode: number };
  daily: {
    time: string[];
    weathercode: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}

interface OpenMeteoGeocodingResult {
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
}

interface OpenMeteoGeocodingResponse {
  results?: OpenMeteoGeocodingResult[];
}

export async function getCachedWeather(): Promise<WeatherSnapshot | null> {
  const stored = await browser.storage.local.get(CACHE_KEY);
  return (stored[CACHE_KEY] as WeatherSnapshot | undefined) ?? null;
}

export function isFresh(snapshot: WeatherSnapshot, ttlMs = CACHE_TTL_MS): boolean {
  return Date.now() - snapshot.fetchedAt < ttlMs;
}

export async function fetchWeather(location: WeatherLocation): Promise<WeatherSnapshot> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(location.latitude));
  url.searchParams.set('longitude', String(location.longitude));
  url.searchParams.set('current_weather', 'true');
  url.searchParams.set('daily', 'weathercode,temperature_2m_max,temperature_2m_min');
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('forecast_days', '5');

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`Open-Meteo request failed: ${response.status}`);
  const data = (await response.json()) as OpenMeteoForecastResponse;

  const daily: WeatherDaily[] = data.daily.time.map((date, i) => ({
    date,
    weatherCode: data.daily.weathercode[i] ?? 0,
    tempMaxC: data.daily.temperature_2m_max[i] ?? 0,
    tempMinC: data.daily.temperature_2m_min[i] ?? 0,
  }));

  const snapshot: WeatherSnapshot = {
    location,
    currentTempC: data.current_weather.temperature,
    weatherCode: data.current_weather.weathercode,
    daily,
    fetchedAt: Date.now(),
  };

  await browser.storage.local.set({ [CACHE_KEY]: snapshot });
  return snapshot;
}

export async function geocodeCity(query: string): Promise<WeatherLocation[]> {
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
  url.searchParams.set('name', query);
  url.searchParams.set('count', '5');

  const response = await fetch(url.toString());
  if (!response.ok) return [];
  const data = (await response.json()) as OpenMeteoGeocodingResponse;

  return (data.results ?? []).map((result) => ({
    label: [result.name, result.admin1, result.country].filter(Boolean).join(', '),
    latitude: result.latitude,
    longitude: result.longitude,
  }));
}
