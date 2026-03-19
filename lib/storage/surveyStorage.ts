import { asyncStorageClient } from './asyncStorageClient';

const STORAGE_KEY = 'survey_completed';

export const surveyStorage = {
  async isCompleted(): Promise<boolean> {
    const value = await asyncStorageClient.get<string>(STORAGE_KEY);
    return value !== null;
  },

  async markCompleted(): Promise<void> {
    await asyncStorageClient.set(STORAGE_KEY, new Date().toISOString());
  },

  async clear(): Promise<void> {
    await asyncStorageClient.remove(STORAGE_KEY);
  },
};
