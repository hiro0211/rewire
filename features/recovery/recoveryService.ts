import { recoveryStorage } from '@/lib/storage/recoveryStorage';
import type { Recovery } from '@/types/models';
import * as Crypto from 'expo-crypto';

export const recoveryService = {
  async saveRecovery(userId: string, trigger: string, checkinId: string): Promise<Recovery> {
    const recovery: Recovery = {
      id: Crypto.randomUUID(),
      userId,
      checkinId,
      trigger,
      createdAt: new Date().toISOString(),
    };
    await recoveryStorage.save(recovery);
    return recovery;
  },
};
