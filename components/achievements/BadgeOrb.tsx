import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Ellipse } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { BADGE_TIER_COLORS, type BadgeDefinition } from '@/constants/badges';

const SIZES = {
  small: 48,
  medium: 72,
  large: 96,
} as const;

const ICON_SIZES = {
  small: 20,
  medium: 30,
  large: 40,
} as const;

interface BadgeOrbProps {
  badge: BadgeDefinition;
  isUnlocked: boolean;
  size?: keyof typeof SIZES;
  onPress?: () => void;
}

export function BadgeOrb({ badge, isUnlocked, size = 'medium', onPress }: BadgeOrbProps) {
  const dim = SIZES[size];
  const iconSize = ICON_SIZES[size];
  const tierColor = BADGE_TIER_COLORS[badge.tier];

  const gradientColors = isUnlocked
    ? (badge.gradientColors as [string, string, ...string[]])
    : ['#2A2A35', '#1A1A22'] as [string, string];
  const iconName = isUnlocked ? badge.iconName : 'lock-closed';
  const iconColor = isUnlocked ? '#FFFFFF' : '#555555';

  const content = (
    <View
      style={[
        styles.container,
        {
          width: dim,
          height: dim,
          borderRadius: dim / 2,
          opacity: isUnlocked ? 1 : 0.6,
        },
        isUnlocked && {
          shadowColor: tierColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.6,
          shadowRadius: dim / 4,
          elevation: 8,
        },
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        style={[styles.gradient, { borderRadius: dim / 2 }]}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
      >
        <Svg
          width={dim}
          height={dim}
          style={StyleSheet.absoluteFill}
        >
          <Ellipse
            cx={dim * 0.5}
            cy={dim * 0.3}
            rx={dim * 0.35}
            ry={dim * 0.25}
            fill="rgba(255,255,255,0.15)"
          />
        </Svg>
        <Ionicons name={iconName as any} size={iconSize} color={iconColor} />
      </LinearGradient>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
