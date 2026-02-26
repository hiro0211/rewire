import {
  computeAchievements,
  getUnlockedBadges,
  getNextBadge,
  getNextBadgeProgress,
  getAchievementSummary,
} from '../achievementCalculator';
import { BADGES } from '@/constants/badges';

describe('achievementCalculator', () => {
  describe('computeAchievements', () => {
    it('returns all badges with unlock status', () => {
      const result = computeAchievements(0);
      expect(result).toHaveLength(BADGES.length);
      expect(result[0]).toEqual({
        badge: BADGES[0],
        isUnlocked: true,
      });
    });

    it('unlocks only fresh_start at day 0', () => {
      const result = computeAchievements(0);
      const unlocked = result.filter((a) => a.isUnlocked);
      expect(unlocked).toHaveLength(1);
      expect(unlocked[0].badge.id).toBe('fresh_start');
    });

    it('unlocks badges up to 7 days', () => {
      const result = computeAchievements(7);
      const unlocked = result.filter((a) => a.isUnlocked);
      const ids = unlocked.map((a) => a.badge.id);
      expect(ids).toEqual(['fresh_start', 'first_light', 'steady_step', 'one_week']);
    });

    it('unlocks all badges at 1095 days', () => {
      const result = computeAchievements(1095);
      const unlocked = result.filter((a) => a.isUnlocked);
      expect(unlocked).toHaveLength(BADGES.length);
    });
  });

  describe('getUnlockedBadges', () => {
    it('returns only unlocked badges', () => {
      const result = getUnlockedBadges(3);
      expect(result).toHaveLength(3);
      expect(result.map((b) => b.id)).toEqual(['fresh_start', 'first_light', 'steady_step']);
    });

    it('returns empty array for negative streak', () => {
      const result = getUnlockedBadges(-1);
      expect(result).toHaveLength(0);
    });
  });

  describe('getNextBadge', () => {
    it('returns first_light when streak is 0', () => {
      const next = getNextBadge(0);
      expect(next?.id).toBe('first_light');
    });

    it('returns steady_step when streak is 1', () => {
      const next = getNextBadge(1);
      expect(next?.id).toBe('steady_step');
    });

    it('returns null when all badges unlocked', () => {
      const next = getNextBadge(1095);
      expect(next).toBeNull();
    });

    it('returns the correct next badge at boundary', () => {
      const next = getNextBadge(89);
      expect(next?.id).toBe('reboot');
    });
  });

  describe('getNextBadgeProgress', () => {
    it('returns 0 progress at start of segment', () => {
      // At day 1, next badge is steady_step (day 3). Previous was first_light (day 1).
      // Progress within this segment: (1 - 1) / (3 - 1) = 0
      const progress = getNextBadgeProgress(1);
      expect(progress).toBe(0);
    });

    it('returns progress within segment', () => {
      // At day 2, next badge is steady_step (day 3). Previous was first_light (day 1).
      // Progress: (2 - 1) / (3 - 1) = 0.5
      const progress = getNextBadgeProgress(2);
      expect(progress).toBe(0.5);
    });

    it('returns 1 when all badges unlocked', () => {
      const progress = getNextBadgeProgress(1095);
      expect(progress).toBe(1);
    });

    it('returns 0 at day 0 (next badge is first_light, day 1)', () => {
      // At day 0, next is first_light (day 1). Previous is fresh_start (day 0).
      // Progress: (0 - 0) / (1 - 0) = 0
      const progress = getNextBadgeProgress(0);
      expect(progress).toBe(0);
    });
  });

  describe('getAchievementSummary', () => {
    it('returns correct summary at day 0', () => {
      const summary = getAchievementSummary(0);
      expect(summary).toEqual({
        total: 18,
        unlocked: 1,
        percentage: Math.round((1 / 18) * 100),
      });
    });

    it('returns 100% when all unlocked', () => {
      const summary = getAchievementSummary(1095);
      expect(summary).toEqual({
        total: 18,
        unlocked: 18,
        percentage: 100,
      });
    });

    it('returns correct count at day 30', () => {
      const summary = getAchievementSummary(30);
      expect(summary.unlocked).toBe(7); // fresh_start through one_month
    });
  });
});
