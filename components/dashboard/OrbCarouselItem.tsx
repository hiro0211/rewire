import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { AnimatedOrb } from './AnimatedOrb';
import { StaticOrb } from './StaticOrb';
import type { NeuralBadgeDefinition } from '@/constants/badges/BADGE_DEFINITIONS';
import { SPACING } from '@/constants/theme';

const INACTIVE_SCALE = 0.55;
const INACTIVE_OPACITY = 0.55;
const LOCKED_ACTIVE_OPACITY = 0.4;
const LOCKED_INACTIVE_OPACITY = 0.3;
const ACTIVE_LABEL_SIZE = 22;
const INACTIVE_LABEL_SIZE = 13;
const ACTIVE_SUBLABEL_SIZE = 15;
const INACTIVE_SUBLABEL_SIZE = 11;
const ORB_AREA_HEIGHT_RATIO = 1.6;

interface OrbCarouselItemProps {
  badge: NeuralBadgeDefinition;
  itemWidth: number;
  activeOrbSize: number;
  isActive: boolean;
  currentDays: number;
  onLongPress?: () => void;
}

function formatDayLabel(day: number, isJapanese: boolean): string {
  if (isJapanese) return `${day}日`;
  return day === 1 ? '1 day' : `${day} days`;
}

function formatA11yLabel(
  badge: NeuralBadgeDefinition,
  isJapanese: boolean,
  isUnlocked: boolean
): string {
  if (isJapanese) {
    return `${badge.nameJa}、${badge.day}日で到達${isUnlocked ? '' : '（未達成）'}`;
  }
  return `${badge.nameEn}, reached at day ${badge.day}${isUnlocked ? '' : ' (locked)'}`;
}

function resolveStaticOpacity(isActive: boolean, isUnlocked: boolean): number {
  if (isActive && !isUnlocked) return LOCKED_ACTIVE_OPACITY;
  if (!isActive && isUnlocked) return INACTIVE_OPACITY;
  return LOCKED_INACTIVE_OPACITY;
}

function OrbCarouselItemComponent({
  badge,
  itemWidth,
  activeOrbSize,
  isActive,
  currentDays,
  onLongPress,
}: OrbCarouselItemProps) {
  const { colors } = useTheme();
  const { isJapanese } = useLocale();

  const isUnlocked = badge.day <= currentDays;
  const showAnimatedOrb = isActive && isUnlocked;

  const name = isJapanese ? badge.nameJa : badge.nameEn;
  const dayLabel = formatDayLabel(badge.day, isJapanese);
  const a11yLabel = formatA11yLabel(badge, isJapanese, isUnlocked);
  const staticOpacity = resolveStaticOpacity(isActive, isUnlocked);
  const staticScale = isActive ? 1 : INACTIVE_SCALE;

  return (
    <View style={[styles.container, { width: itemWidth }]}>
      <View style={[styles.orbArea, { height: activeOrbSize * ORB_AREA_HEIGHT_RATIO }]}>
        {showAnimatedOrb ? (
          <TouchableOpacity
            testID="orb-carousel-item-active-touch"
            onLongPress={onLongPress}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel={a11yLabel}
            accessibilityState={{ selected: true, disabled: false }}
          >
            <AnimatedOrb colors={badge.colors} chapterId={badge.chapter} badgeId={badge.id} size={activeOrbSize} />
          </TouchableOpacity>
        ) : (
          <View
            testID="static-orb-wrapper"
            accessibilityRole="image"
            accessibilityLabel={a11yLabel}
            accessibilityState={{ selected: isActive, disabled: !isUnlocked }}
            style={{
              opacity: staticOpacity,
              transform: [{ scale: staticScale }],
            }}
          >
            <StaticOrb colors={badge.colors} size={activeOrbSize} />
          </View>
        )}
      </View>

      <Text
        numberOfLines={1}
        style={[
          styles.label,
          {
            fontSize: isActive ? ACTIVE_LABEL_SIZE : INACTIVE_LABEL_SIZE,
            fontWeight: isActive ? 'bold' : 'normal',
            color: isActive ? colors.text : colors.textSecondary,
          },
        ]}
      >
        {name}
      </Text>
      <Text
        numberOfLines={1}
        style={[
          styles.subLabel,
          {
            fontSize: isActive ? ACTIVE_SUBLABEL_SIZE : INACTIVE_SUBLABEL_SIZE,
            color: colors.textSecondary,
          },
        ]}
      >
        {dayLabel}
      </Text>
    </View>
  );
}

export const OrbCarouselItem = React.memo(OrbCarouselItemComponent);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'visible',
  },
  orbArea: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  label: {
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  subLabel: {
    marginTop: 2,
    textAlign: 'center',
  },
});
