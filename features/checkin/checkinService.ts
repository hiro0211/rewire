import { checkinValidator } from './checkinValidator';
import { userStorage } from '@/lib/storage/userStorage';
import { checkinStorage } from '@/lib/storage/checkinStorage';
import type { CheckinFormInput } from '@/types/checkin';
import type { DailyCheckin } from '@/types/models';
import * as Crypto from 'expo-crypto';
import { format } from 'date-fns';

export const checkinService = {
  async processCheckin(input: CheckinFormInput): Promise<DailyCheckin> {
    const validation = checkinValidator.validate(input);
    if (!validation.ok) {
      throw new Error(validation.error);
    }

    const today = format(new Date(), 'yyyy-MM-dd');
    const user = await userStorage.get();

    if (input.watchedPorn) {
      // バックアップ保存してからリセット（ISO日時で保存）
      await userStorage.update({
        previousStreakStartDate: user?.streakStartDate ?? null,
        streakStartDate: new Date().toISOString(),
      });
    } else {
      // やり直し: 今日の既存チェックインが「観ました」なら連続記録を復元
      const existingToday = await checkinStorage.getByDate(today);
      if (existingToday?.watchedPorn && user?.previousStreakStartDate) {
        await userStorage.update({
          streakStartDate: user.previousStreakStartDate,
          previousStreakStartDate: null,
        });
      } else if (user && !user.streakStartDate) {
        await userStorage.update({ streakStartDate: new Date().toISOString() });
      }
    }

    const checkin: DailyCheckin = {
      id: Crypto.randomUUID(),
      userId: user?.id || 'unknown',
      date: today,
      watchedPorn: input.watchedPorn!,
      urgeLevel: input.urgeLevel as any,
      stressLevel: input.stressLevel as any,
      qualityOfLife: input.qualityOfLife as any,
      memo: input.memo,
      createdAt: new Date().toISOString(),
    };

    return checkin;
  },
};
