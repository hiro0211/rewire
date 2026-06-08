import { calculateStreak } from '@/features/checkin/streakCalculator';
import { calculateRelapseCount } from '@/lib/stats/statsCalculator';
import type { DailyCheckin } from '@/types/models';

import { analyticsClient } from './analyticsClient';

/**
 * Syncs streak-depth user properties to analytics so GA4 retention cohorts can
 * be segmented by how far along a user is (e.g. D7 retention of streak>=7 users
 * vs streak=0). Call AFTER the user store is reloaded so the streak reflects the
 * just-recorded check-in (a relapse resets streakStartDate).
 */
export function setRetentionUserProperties(
  streakStartDate: string | undefined,
  checkins: DailyCheckin[],
): void {
  const currentStreak = streakStartDate
    ? calculateStreak(streakStartDate, checkins)
    : 0;

  analyticsClient.setUserProperty('current_streak', String(currentStreak));
  analyticsClient.setUserProperty('relapse_count', String(calculateRelapseCount(checkins)));
}
