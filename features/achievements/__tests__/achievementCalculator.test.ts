import {
  computeAchievements,
  getUnlockedBadges,
  getNextBadge,
  getNextBadgeProgress,
  getAchievementSummary,
} from '../achievementCalculator';
import { BADGE_DEFINITIONS } from '@/constants/badges/BADGE_DEFINITIONS';

describe('achievementCalculator', () => {
  describe('computeAchievements', () => {
    it('全バッジとロック状態を返す', () => {
      const result = computeAchievements(0);
      expect(result).toHaveLength(BADGE_DEFINITIONS.length);
      expect(result[0]).toEqual({
        badge: BADGE_DEFINITIONS[0],
        isUnlocked: true,
      });
    });

    it('day=0ではStardustのみアンロック', () => {
      const result = computeAchievements(0);
      const unlocked = result.filter((a) => a.isUnlocked);
      expect(unlocked).toHaveLength(1);
      expect(unlocked[0].badge.id).toBe('Stardust');
    });

    it('day=7では4つアンロック', () => {
      const result = computeAchievements(7);
      const unlocked = result.filter((a) => a.isUnlocked);
      const ids = unlocked.map((a) => a.badge.id);
      expect(ids).toEqual(['Stardust', 'Nebula', 'Protostar', 'Ignition']);
    });

    it('day=1095で全バッジアンロック', () => {
      const result = computeAchievements(1095);
      const unlocked = result.filter((a) => a.isUnlocked);
      expect(unlocked).toHaveLength(BADGE_DEFINITIONS.length);
    });
  });

  describe('getUnlockedBadges', () => {
    it('アンロック済みバッジのみ返す', () => {
      const result = getUnlockedBadges(3);
      expect(result).toHaveLength(3);
      expect(result.map((b) => b.id)).toEqual(['Stardust', 'Nebula', 'Protostar']);
    });
  });

  describe('getNextBadge', () => {
    it('streak=0の次はNebula', () => {
      expect(getNextBadge(0)?.id).toBe('Nebula');
    });

    it('streak=1の次はProtostar', () => {
      expect(getNextBadge(1)?.id).toBe('Protostar');
    });

    it('全バッジアンロック済みならnull', () => {
      expect(getNextBadge(1095)).toBeNull();
    });

    it('streak=89の次はHabitableWorld', () => {
      expect(getNextBadge(89)?.id).toBe('HabitableWorld');
    });
  });

  describe('getNextBadgeProgress', () => {
    it('セグメント開始時は進捗0', () => {
      expect(getNextBadgeProgress(1)).toBe(0);
    });

    it('セグメント中間は進捗0.5', () => {
      expect(getNextBadgeProgress(2)).toBe(0.5);
    });

    it('全バッジアンロック済みなら1', () => {
      expect(getNextBadgeProgress(1095)).toBe(1);
    });

    it('day=0の進捗は0', () => {
      expect(getNextBadgeProgress(0)).toBe(0);
    });
  });

  describe('getAchievementSummary', () => {
    it('day=0のサマリー', () => {
      expect(getAchievementSummary(0)).toEqual({
        total: 18,
        unlocked: 1,
        percentage: Math.round((1 / 18) * 100),
      });
    });

    it('全アンロック時は100%', () => {
      expect(getAchievementSummary(1095)).toEqual({
        total: 18,
        unlocked: 18,
        percentage: 100,
      });
    });

    it('day=30では7個アンロック', () => {
      expect(getAchievementSummary(30).unlocked).toBe(7);
    });
  });
});
