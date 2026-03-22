import { create } from 'zustand';
import { asyncStorageClient } from '@/lib/storage/asyncStorageClient';
import type { ThemePreference } from '@/types/theme';

interface ThemeState {
  themePreference: ThemePreference;
}

interface ThemeActions {
  setThemePreference: (pref: ThemePreference) => Promise<void>;
  loadThemePreference: () => Promise<void>;
}

interface SettingsData {
  themePreference?: ThemePreference;
}

export const useThemeStore = create<ThemeState & ThemeActions>((set) => ({
  themePreference: 'dark',

  setThemePreference: async (pref) => {
    set({ themePreference: pref });
    const existing = await asyncStorageClient.get<Record<string, unknown>>('settings') ?? {};
    await asyncStorageClient.set('settings', { ...existing, themePreference: pref });
  },

  loadThemePreference: async () => {
    try {
      const data = await asyncStorageClient.get<SettingsData>('settings');
      if (data?.themePreference) {
        set({ themePreference: data.themePreference });
      }
    } catch {
      // Keep default 'dark'
    }
  },
}));
