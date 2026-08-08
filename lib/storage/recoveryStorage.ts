import { asyncStorageClient } from './asyncStorageClient';
import type { Recovery } from '@/types/models';

const STORAGE_KEY = 'recoveries';

export const recoveryStorage = {
  async getAll(): Promise<Recovery[]> {
    // getStrict throws on read/decrypt failure so save()'s re-read aborts
    // instead of overwriting the whole history with a single new record.
    const data = await asyncStorageClient.getStrict<Recovery[]>(STORAGE_KEY);
    return data ?? [];
  },

  async save(recovery: Recovery): Promise<void> {
    const all = await this.getAll();
    all.push(recovery);
    await asyncStorageClient.set(STORAGE_KEY, all);
  },
};
