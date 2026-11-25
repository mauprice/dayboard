export const SETTINGS_SCHEMA_VERSION = 1 as const;
export const ONBOARDING_SCHEMA_VERSION = 1 as const;
export const FOCUS_SCHEMA_VERSION = 1 as const;

export type ClockFormat = '12h' | '24h';
export type RotationInterval = 'tab' | 'hourly' | 'daily';

export interface SettingsData {
  schemaVersion: typeof SETTINGS_SCHEMA_VERSION;
  name: string;
  clockFormat: ClockFormat;
  showSeconds: boolean;
  rotationInterval: RotationInterval;
}

export interface OnboardingData {
  schemaVersion: typeof ONBOARDING_SCHEMA_VERSION;
  completed: boolean;
}

export interface FocusData {
  schemaVersion: typeof FOCUS_SCHEMA_VERSION;
  /** Local YYYY-MM-DD the focus text was set for. */
  date: string;
  text: string;
  completed: boolean;
}

export const DEFAULT_SETTINGS: SettingsData = {
  schemaVersion: SETTINGS_SCHEMA_VERSION,
  name: '',
  clockFormat: '24h',
  showSeconds: false,
  rotationInterval: 'tab',
};

export const DEFAULT_ONBOARDING: OnboardingData = {
  schemaVersion: ONBOARDING_SCHEMA_VERSION,
  completed: false,
};

export const DEFAULT_FOCUS: FocusData = {
  schemaVersion: FOCUS_SCHEMA_VERSION,
  date: '',
  text: '',
  completed: false,
};

// Each migrate fn upgrades whatever shape was previously stored to the
// current one, backfilling fields older schema versions didn't have.
// Only v1 exists today; future bumps add a case per version here.
export function migrateSettings(raw: unknown): SettingsData {
  const data = (raw ?? {}) as Partial<SettingsData>;
  return { ...DEFAULT_SETTINGS, ...data, schemaVersion: SETTINGS_SCHEMA_VERSION };
}

export function migrateOnboarding(raw: unknown): OnboardingData {
  const data = (raw ?? {}) as Partial<OnboardingData>;
  return { ...DEFAULT_ONBOARDING, ...data, schemaVersion: ONBOARDING_SCHEMA_VERSION };
}

export function migrateFocus(raw: unknown): FocusData {
  const data = (raw ?? {}) as Partial<FocusData>;
  return { ...DEFAULT_FOCUS, ...data, schemaVersion: FOCUS_SCHEMA_VERSION };
}
