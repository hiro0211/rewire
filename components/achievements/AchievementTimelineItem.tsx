import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/Themed';
import { BadgeOrb } from './BadgeOrb';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { BADGE_TIER_COLORS, type BadgeDefinition } from '@/constants/badges';

interface AchievementTimelineItemProps {
  badge: BadgeDefinition;
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
  const tierColor = BADGE_TIER_COLORS[badge.tier];
  const isLeft = position === 'left';

  return (
    <View style={styles.wrapper}>
      {/* Dashed connector */}
      {!isLast && (
        <View style={styles.connectorContainer}>
          <View
            style={[
              styles.connector,
              { borderColor: isUnlocked ? tierColor : COLORS.border },
            ]}
          />
        </View>
      )}

      <View style={[styles.row, isLeft ? styles.rowLeft : styles.rowRight]}>
        {/* Badge orb */}
        <BadgeOrb badge={badge} isUnlocked={isUnlocked} size="medium" />

        {/* Info */}
        <View style={[styles.info, isLeft ? styles.infoLeft : styles.infoRight]}>
          <Text
            style={[
              styles.name,
              !isUnlocked && styles.locked,
            ]}
          >
            {badge.nameJa}
          </Text>
          <View
            style={[
              styles.dayPill,
              isUnlocked && { borderColor: tierColor },
            ]}
          >
            <Text
              style={[
                styles.dayText,
                isUnlocked && { color: tierColor },
              ]}
            >
              {badge.requiredDays} Days
            </Text>
          </View>
          <Text
            style={[
              styles.description,
              !isUnlocked && styles.locked,
            ]}
            numberOfLines={2}
          >
            {badge.descriptionJa}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    marginBottom: SPACING.lg,
  },
  connectorContainer: {
    position: 'absolute',
    left: '50%',
    top: 72,
    bottom: -SPACING.lg,
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
    color: COLORS.text,
    marginBottom: 4,
  },
  dayPill: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 4,
  },
  dayText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  description: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  locked: {
    opacity: 0.5,
  },
});
