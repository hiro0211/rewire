import { asyncStorageClient } from './asyncStorageClient';
import type { BreathSession } from '@/types/models';

const STORAGE_KEY = 'breath_sessions';

export const breathSessionStorage = {
  async getAll(): Promise<BreathSession[]> {
    // getStrict throws on read/decrypt failure so save()'s re-read aborts
    // instead of overwriting the whole history with a single new record.
    const data = await asyncStorageClient.getStrict<BreathSession[]>(STORAGE_KEY);
    return data ?? [];
  },

  async save(session: BreathSession): Promise<void> {
    const all = await this.getAll();
    all.push(session);
    await asyncStorageClient.set(STORAGE_KEY, all);
  },
};
