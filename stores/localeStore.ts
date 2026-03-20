import { create } from 'zustand';
import { asyncStorageClient } from '@/lib/storage/asyncStorageClient';
import type { LocalePreference } from '@/types/i18n';

interface LocaleState {
  localePreference: LocalePreference;
}

interface LocaleActions {
  setLocalePreference: (pref: LocalePreference) => Promise<void>;
  loadLocalePreference: () => Promise<void>;
}

interface SettingsData {
  localePreference?: LocalePreference;
}

export const useLocaleStore = create<LocaleState & LocaleActions>((set) => ({
  localePreference: 'system',

  setLocalePreference: async (pref) => {
    set({ localePreference: pref });
    await asyncStorageClient.set('settings', { localePreference: pref });
  },

  loadLocalePreference: async () => {
    try {
      const data = await asyncStorageClient.get<SettingsData>('settings');
      if (data?.localePreference) {
        set({ localePreference: data.localePreference });
      }
    } catch {
      // Keep default 'system'
    }
  },
}));
