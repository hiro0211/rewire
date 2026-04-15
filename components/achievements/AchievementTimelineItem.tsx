import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { BadgeOrb } from './BadgeOrb';
import { SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import type { NeuralBadgeDefinition } from '@/constants/badges/BADGE_DEFINITIONS';

interface AchievementTimelineItemProps {
  badge: NeuralBadgeDefinition;
  isUnlocked: boolean;
  position: 'left' | 'right';
  isLast: boolean;
}

export function AchievementTimelineItem({
  badge,
  isUnlocked,
  position,
  isLast,
}: AchievementTimelineItemProps) {
  const glowColor = badge.colors.glow;
  const isLeft = position === 'left';
  const { colors } = useTheme();
  const { isJapanese } = useLocale();

  return (
    <View style={styles.wrapper}>
      {!isLast && (
        <View style={styles.connectorContainer}>
          <View
            style={[
              styles.connector,
              { borderColor: isUnlocked ? glowColor : colors.border },
            ]}
          />
        </View>
      )}

      <View style={[styles.row, isLeft ? styles.rowLeft : styles.rowRight]}>
        <BadgeOrb badge={badge} isUnlocked={isUnlocked} size="medium" />

        <View style={[styles.info, isLeft ? styles.infoLeft : styles.infoRight]}>
          <Text
            style={[
              styles.name,
              { color: colors.text },
              !isUnlocked && styles.locked,
            ]}
          >
            {isJapanese ? badge.nameJa : badge.nameEn}
          </Text>
          <View
            style={[
              styles.dayPill,
              { borderColor: colors.border },
              isUnlocked && { borderColor: glowColor },
            ]}
          >
            <Text
              style={[
                styles.dayText,
                { color: colors.textSecondary },
                isUnlocked && { color: glowColor },
              ]}
            >
              {badge.day} Days
            </Text>
          </View>
          <Text
            style={[
              styles.description,
              { color: colors.textSecondary },
              !isUnlocked && styles.locked,
            ]}
            numberOfLines={2}
          >
            {badge.message}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    marginBottom: SPACING.xxl,
  },
  connectorContainer: {
    position: 'absolute',
    left: '50%',
    top: 72,
    bottom: -SPACING.xxl,
    width: 1,
    alignItems: 'center',
  },
  connector: {
    flex: 1,
    borderLeftWidth: 2,
    borderStyle: 'dashed',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenPadding,
    gap: SPACING.md,
  },
  rowLeft: {
    flexDirection: 'row',
  },
  rowRight: {
    flexDirection: 'row-reverse',
  },
  info: {
    flex: 1,
  },
  infoLeft: {
    alignItems: 'flex-start',
  },
  infoRight: {
    alignItems: 'flex-end',
  },
  name: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    marginBottom: 4,
  },
  dayPill: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    marginBottom: 4,
  },
  dayText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  description: {
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
  },
  locked: {
    opacity: 0.5,
  },
});
