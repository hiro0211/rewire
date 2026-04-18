import { BadgeOrb } from '@/components/achievements/BadgeOrb';
import { getBadgeProgress } from '@/lib/badges/getBadgeProgress';
import { getNextBadge } from '@/lib/badges/getNextBadge';
import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { type DimensionValue, StyleSheet, Text, View } from 'react-native';

interface NextBadgeProgressProps {
  currentDay: number;
}

/**
 * ダッシュボード用「次バッジ進捗」コンポーネント。
 * 次バッジのBadgeOrb + 名前 + LinearProgressBarを表示する。
 * 最終バッジ到達済みなら「全バッジ達成」テキストを表示。
 */
export function NextBadgeProgress({ currentDay }: NextBadgeProgressProps) {
  const { colors } = useTheme();
  const nextBadge = getNextBadge(currentDay);
  const progress = getBadgeProgress(currentDay);

  if (!nextBadge) {
    return (
      <View style={styles.container}>
        <Text
          testID="next-badge-all-achieved"
          style={[styles.allAchieved, { color: colors.text }]}
        >
          🌌 全バッジ達成
        </Text>
      </View>
    );
  }

  const progressPercent = `${Math.round(progress * 100)}%` as DimensionValue;

  return (
    <View style={styles.container}>
      <BadgeOrb
        colors={nextBadge.colors}
        size={32}
        isUnlocked={false}
        chapterId={nextBadge.chapter}
        badgeId={nextBadge.id}
      />

      <View style={styles.info}>
        <Text
          testID="next-badge-name"
          style={[styles.name, { color: colors.text }]}
        >
          {nextBadge.nameJa}
        </Text>

        <View
          testID="next-badge-progress-bar"
          style={[styles.bar, { backgroundColor: colors.textSecondary + '33' }]}
        >
          <View
            testID="next-badge-progress-fill"
            style={[
              styles.fill,
              { width: progressPercent, backgroundColor: nextBadge.colors.glow },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  info: {
    flex: 1,
    gap: 6,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
  },
  bar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
  allAchieved: {
    fontSize: 14,
    fontWeight: '600',
  },
});
