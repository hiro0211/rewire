import { asyncStorageClient } from './asyncStorageClient';

interface SettingsData {
  lastCelebratedStreak?: number;
}

export const getLastCelebratedStreak = async (): Promise<number | null> => {
  try {
    const data = await asyncStorageClient.get<SettingsData>('settings');
    if (data && typeof data.lastCelebratedStreak === 'number') {
      return data.lastCelebratedStreak;
    }
    return null;
  } catch {
    return null;
  }
};

export const setLastCelebratedStreak = async (streak: number): Promise<void> => {
  const existing =
    (await asyncStorageClient.get<Record<string, unknown>>('settings')) ?? {};
  await asyncStorageClient.set('settings', {
    ...existing,
    lastCelebratedStreak: streak,
  });
};
