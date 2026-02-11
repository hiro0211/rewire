import { asyncStorageClient } from './asyncStorageClient';
import type { BreathSession } from '@/types/models';

const STORAGE_KEY = 'breath_sessions';

export const breathSessionStorage = {
  async getAll(): Promise<BreathSession[]> {
    const data = await asyncStorageClient.get<BreathSession[]>(STORAGE_KEY);
    return data ?? [];
  },

  async save(session: BreathSession): Promise<void> {
    const all = await this.getAll();
    all.push(session);
    await asyncStorageClient.set(STORAGE_KEY, all);
  },
};
