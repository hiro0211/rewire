import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FONT_SIZE, SPACING } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { BadgeOrb } from './BadgeOrb';
import type { NeuralBadgeDefinition } from '@/constants/badges/BADGE_DEFINITIONS';

export type BadgeOrbRowAlignment = 'left' | 'center' | 'right';

interface BadgeOrbRowProps {
  badge: NeuralBadgeDefinition;
  isUnlocked: boolean;
  alignment: BadgeOrbRowAlignment;
}

const X_OFFSET = 20;

/**
 * Orb + バッジ名 + メッセージ + Day ラベルの1行。
 * ジグザグ配置するため、X方向に ±20px オフセット可能。
 */
export function BadgeOrbRow({ badge, isUnlocked, alignment }: BadgeOrbRowProps) {
  const { colors } = useTheme();
  const { isJapanese } = useLocale();

  const translateX =
    alignment === 'left' ? -X_OFFSET : alignment === 'right' ? X_OFFSET : 0;

  const name = isJapanese ? badge.nameJa : badge.nameEn;
  const textColor = isUnlocked ? colors.text : colors.textSecondary;
  const mutedColor = colors.textSecondary;

  return (
    <View
      testID={`badge-orb-row-${badge.id}`}
      style={styles.row}
    >
      <View style={[styles.orbWrapper, { transform: [{ translateX }] }]}>
        <BadgeOrb
          colors={badge.colors}
          isUnlocked={isUnlocked}
          chapterId={badge.chapter}
          badgeId={badge.id}
        />
      </View>

      <View style={styles.textBlock}>
        <Text style={[styles.name, { color: textColor }]}>{name}</Text>
        <Text style={[styles.day, { color: mutedColor }]}>Day {badge.day}</Text>
        <Text
          style={[styles.message, { color: mutedColor }]}
          numberOfLines={2}
        >
          {badge.message}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
  },
  orbWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    marginTop: SPACING.xs,
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  name: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    textAlign: 'center',
  },
  day: {
    fontSize: FONT_SIZE.xs,
    marginTop: 2,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  message: {
    fontSize: FONT_SIZE.sm,
    marginTop: SPACING.xs,
    textAlign: 'center',
    lineHeight: 20,
  },
});
