import { create } from 'zustand';
import { asyncStorageClient } from '@/lib/storage/asyncStorageClient';

interface ReflectionState {
  lastReflectionDate: string | null;
}

interface ReflectionActions {
  markCompleted: (date: string) => Promise<void>;
  isTodayCompleted: (today: string) => boolean;
  loadReflectionState: () => Promise<void>;
  reset: () => void;
}

interface SettingsData {
  lastReflectionDate?: string | null;
}

export const useReflectionStore = create<ReflectionState & ReflectionActions>((set, get) => ({
  lastReflectionDate: null,

  markCompleted: async (date) => {
    set({ lastReflectionDate: date });
    const existing = (await asyncStorageClient.get<Record<string, unknown>>('settings')) ?? {};
    await asyncStorageClient.set('settings', { ...existing, lastReflectionDate: date });
  },

  isTodayCompleted: (today) => {
    const { lastReflectionDate } = get();
    return lastReflectionDate !== null && lastReflectionDate === today;
  },

  loadReflectionState: async () => {
    try {
      const data = await asyncStorageClient.get<SettingsData>('settings');
      if (data?.lastReflectionDate) {
        set({ lastReflectionDate: data.lastReflectionDate });
      }
    } catch {
      // Keep default null
    }
  },

  reset: () => {
    set({ lastReflectionDate: null });
  },
}));
