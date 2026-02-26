import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { BadgeOrb } from './BadgeOrb';
import { SPACING } from '@/constants/theme';
import type { AchievementStatus } from '@/features/achievements/achievementCalculator';

interface BadgePreviewRowProps {
  achievements: AchievementStatus[];
}

export function BadgePreviewRow({ achievements }: BadgePreviewRowProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {achievements.map(({ badge, isUnlocked }) => (
        <BadgeOrb
          key={badge.id}
          badge={badge}
          isUnlocked={isUnlocked}
          size="small"
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.screenPadding,
    gap: SPACING.sm,
  },
});
