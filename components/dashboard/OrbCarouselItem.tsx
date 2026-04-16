import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { AnimatedOrb } from './AnimatedOrb';
import type { NeuralBadgeDefinition } from '@/constants/badges/BADGE_DEFINITIONS';
import { SPACING } from '@/constants/theme';

const INACTIVE_SCALE = 0.55;
const INACTIVE_OPACITY = 0.4;
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
  onLongPress?: () => void;
}

function formatDayLabel(day: number, isJapanese: boolean): string {
  if (isJapanese) return `${day}日`;
  return day === 1 ? '1 day' : `${day} days`;
}

function OrbCarouselItemComponent({
  badge,
  itemWidth,
  activeOrbSize,
  isActive,
  onLongPress,
}: OrbCarouselItemProps) {
  const { colors } = useTheme();
  const { isJapanese } = useLocale();

  const name = isJapanese ? badge.nameJa : badge.nameEn;
  const dayLabel = formatDayLabel(badge.day, isJapanese);

  const a11yLabel = isJapanese
    ? `${badge.nameJa}、${badge.day}日で到達`
    : `${badge.nameEn}, reached at day ${badge.day}`;

  return (
    <View style={[styles.container, { width: itemWidth }]}>
      <View style={[styles.orbArea, { height: activeOrbSize * ORB_AREA_HEIGHT_RATIO }]}>
        {isActive ? (
          <TouchableOpacity
            testID="orb-carousel-item-active-touch"
            onLongPress={onLongPress}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel={a11yLabel}
            accessibilityState={{ selected: true }}
          >
            <AnimatedOrb chapterId={badge.chapter} size={activeOrbSize} />
          </TouchableOpacity>
        ) : (
          <View
            testID="static-orb-wrapper"
            accessibilityRole="image"
            accessibilityLabel={a11yLabel}
            style={{
              opacity: INACTIVE_OPACITY,
              transform: [{ scale: INACTIVE_SCALE }],
            }}
          >
            <View
              testID="static-orb"
              style={[
                styles.staticOrb,
                {
                  width: activeOrbSize,
                  height: activeOrbSize,
                  borderRadius: activeOrbSize / 2,
                },
              ]}
            >
              <LinearGradient
                colors={[badge.colors.glow, badge.colors.core, badge.colors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </View>
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
  staticOrb: {
    overflow: 'hidden',
  },
});
