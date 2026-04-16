import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SPACING } from '@/constants/theme';
import { BADGE_DEFINITIONS } from '@/constants/badges/BADGE_DEFINITIONS';
import { BadgeOrbRow, type BadgeOrbRowAlignment } from './BadgeOrbRow';
import { GravityThread } from './GravityThread';
import type { AchievementStatus } from '@/features/achievements/achievementCalculator';

interface StellarPathTimelineProps {
  streak: number;
  achievements: AchievementStatus[];
}

function alignmentFor(index: number): BadgeOrbRowAlignment {
  if (index === 0) return 'center';
  return index % 2 === 1 ? 'left' : 'right';
}

/**
 * 18 バッジを縦に並べた「恒星の航路」タイムライン。
 * バッジ間は GravityThread（蛇行SVG）で繋がる。
 * 章境界は色の自然な変化で示し、章ヘッダーは置かない。
 */
export function StellarPathTimeline({
  streak,
  achievements,
}: StellarPathTimelineProps) {
  const unlockedMap = new Map(
    achievements.map((a) => [a.badge.id, a.isUnlocked]),
  );

  return (
    <View style={styles.container}>
      {BADGE_DEFINITIONS.map((badge, index) => {
        const isUnlocked = unlockedMap.get(badge.id) ?? streak >= badge.day;
        const isLast = index === BADGE_DEFINITIONS.length - 1;
        const alignment = alignmentFor(index);

        // Thread direction alternates so the path meanders
        const threadDirection: 'left' | 'right' =
          index % 2 === 0 ? 'right' : 'left';

        return (
          <View key={badge.id}>
            <BadgeOrbRow
              badge={badge}
              isUnlocked={isUnlocked}
              alignment={alignment}
            />
            {!isLast && (
              <View style={styles.threadWrapper}>
                <GravityThread
                  color={badge.colors.glow}
                  isActive={isUnlocked}
                  direction={threadDirection}
                />
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.screenPadding,
  },
  threadWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
