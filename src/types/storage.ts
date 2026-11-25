export const SETTINGS_SCHEMA_VERSION = 1 as const;
export const ONBOARDING_SCHEMA_VERSION = 1 as const;
export const FOCUS_SCHEMA_VERSION = 2 as const;
export const TODO_SCHEMA_VERSION = 1 as const;
export const WEATHER_SCHEMA_VERSION = 1 as const;
export const LINKS_SCHEMA_VERSION = 1 as const;

export const MAX_FOCUS_HISTORY = 60;

export type ClockFormat = '12h' | '24h';
export type RotationInterval = 'tab' | 'hourly' | 'daily';
export type QuoteMode = 'daily' | 'tab';
export type SearchEngine = 'google' | 'bing' | 'duckduckgo' | 'brave' | 'custom';

export interface SettingsData {
  schemaVersion: typeof SETTINGS_SCHEMA_VERSION;
  name: string;
  clockFormat: ClockFormat;
  showSeconds: boolean;
  rotationInterval: RotationInterval;
  quoteMode: QuoteMode;
  searchEngine: SearchEngine;
  /** Used when searchEngine === 'custom'; must contain a literal %s placeholder. */
  customSearchTemplate: string;
}

export interface OnboardingData {
  schemaVersion: typeof ONBOARDING_SCHEMA_VERSION;
  completed: boolean;
}

export interface FocusEntry {
  /** Local YYYY-MM-DD the focus text was set for. */
  date: string;
  text: string;
  completed: boolean;
}

export interface FocusData {
  schemaVersion: typeof FOCUS_SCHEMA_VERSION;
  today: FocusEntry;
  /** Most recent first, capped to MAX_FOCUS_HISTORY. */
  history: FocusEntry[];
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  /** Local YYYY-MM-DD the item was completed; null while incomplete. Drives auto-clear. */
  completedAt: string | null;
}

export interface TodoList {
  id: string;
  name: string;
  items: TodoItem[];
}

export interface TodoData {
  schemaVersion: typeof TODO_SCHEMA_VERSION;
  lists: TodoList[];
  activeListId: string;
  /** Auto-delete completed items after N days; null disables it. */
  autoClearCompletedAfterDays: number | null;
}

export interface WeatherLocation {
  label: string;
  latitude: number;
  longitude: number;
}

export interface WeatherSettingsData {
  schemaVersion: typeof WEATHER_SCHEMA_VERSION;
  mode: 'unset' | 'auto' | 'manual';
  location: WeatherLocation | null;
  units: 'C' | 'F';
}

export interface LinkItem {
  id: string;
  label: string;
  url: string;
}

export interface LinksData {
  schemaVersion: typeof LINKS_SCHEMA_VERSION;
  links: LinkItem[];
}

export const DEFAULT_SETTINGS: SettingsData = {
  schemaVersion: SETTINGS_SCHEMA_VERSION,
  name: '',
  clockFormat: '24h',
  showSeconds: false,
  rotationInterval: 'tab',
  quoteMode: 'daily',
  searchEngine: 'google',
  customSearchTemplate: '',
};

export const DEFAULT_WEATHER_SETTINGS: WeatherSettingsData = {
  schemaVersion: WEATHER_SCHEMA_VERSION,
  mode: 'unset',
  location: null,
  units: 'C',
};

export const DEFAULT_LINKS: LinksData = {
  schemaVersion: LINKS_SCHEMA_VERSION,
  links: [
    { id: 'gmail', label: 'Gmail', url: 'https://mail.google.com/' },
    { id: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/' },
    { id: 'calendar', label: 'Calendar', url: 'https://calendar.google.com/' },
    { id: 'drive', label: 'Drive', url: 'https://drive.google.com/' },
  ],
};

export const DEFAULT_ONBOARDING: OnboardingData = {
  schemaVersion: ONBOARDING_SCHEMA_VERSION,
  completed: false,
};

const DEFAULT_FOCUS_ENTRY: FocusEntry = { date: '', text: '', completed: false };

export const DEFAULT_FOCUS: FocusData = {
  schemaVersion: FOCUS_SCHEMA_VERSION,
  today: { ...DEFAULT_FOCUS_ENTRY },
  history: [],
};

export const DEFAULT_TODO_DATA: TodoData = {
  schemaVersion: TODO_SCHEMA_VERSION,
  lists: [
    { id: 'today', name: 'Today', items: [] },
    { id: 'inbox', name: 'Inbox', items: [] },
  ],
  activeListId: 'today',
  autoClearCompletedAfterDays: null,
};

// Each migrate fn upgrades whatever shape was previously stored to the
// current one, backfilling fields older schema versions didn't have.
export function migrateSettings(raw: unknown): SettingsData {
  const data = (raw ?? {}) as Partial<SettingsData>;
  return { ...DEFAULT_SETTINGS, ...data, schemaVersion: SETTINGS_SCHEMA_VERSION };
}

export function migrateOnboarding(raw: unknown): OnboardingData {
  const data = (raw ?? {}) as Partial<OnboardingData>;
  return { ...DEFAULT_ONBOARDING, ...data, schemaVersion: ONBOARDING_SCHEMA_VERSION };
}

export function migrateFocus(raw: unknown): FocusData {
  const data = (raw ?? {}) as Record<string, unknown>;

  if (data.schemaVersion === FOCUS_SCHEMA_VERSION && data.today) {
    const partial = data as Partial<FocusData>;
    return {
      schemaVersion: FOCUS_SCHEMA_VERSION,
      today: { ...DEFAULT_FOCUS_ENTRY, ...partial.today },
      history: Array.isArray(partial.history) ? partial.history : [],
    };
  }

  // v1 shape stored the entry flat: { schemaVersion: 1, date, text, completed }.
  if (typeof data.date === 'string' || typeof data.text === 'string') {
    return {
      schemaVersion: FOCUS_SCHEMA_VERSION,
      today: {
        date: typeof data.date === 'string' ? data.date : '',
        text: typeof data.text === 'string' ? data.text : '',
        completed: Boolean(data.completed),
      },
      history: [],
    };
  }

  return { ...DEFAULT_FOCUS, today: { ...DEFAULT_FOCUS_ENTRY } };
}

export function migrateTodos(raw: unknown): TodoData {
  const data = (raw ?? {}) as Partial<TodoData>;
  return {
    schemaVersion: TODO_SCHEMA_VERSION,
    lists: Array.isArray(data.lists) && data.lists.length > 0 ? data.lists : DEFAULT_TODO_DATA.lists,
    activeListId: data.activeListId ?? DEFAULT_TODO_DATA.activeListId,
    autoClearCompletedAfterDays: data.autoClearCompletedAfterDays ?? null,
  };
}

export function migrateWeatherSettings(raw: unknown): WeatherSettingsData {
  const data = (raw ?? {}) as Partial<WeatherSettingsData>;
  return { ...DEFAULT_WEATHER_SETTINGS, ...data, schemaVersion: WEATHER_SCHEMA_VERSION };
}

export function migrateLinks(raw: unknown): LinksData {
  const data = (raw ?? {}) as Partial<LinksData>;
  return {
    schemaVersion: LINKS_SCHEMA_VERSION,
    links: Array.isArray(data.links) ? data.links : DEFAULT_LINKS.links,
  };
}
