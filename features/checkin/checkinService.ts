import { checkinValidator } from './checkinValidator';
import { userStorage } from '@/lib/storage/userStorage';
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

    // Reset streak if porn was watched
    if (input.watchedPorn) {
       await userStorage.update({ streakStartDate: today });
    } else if (user && !user.streakStartDate) {
      // If no streak start date (e.g. first time), set it
      await userStorage.update({ streakStartDate: today });
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
