import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GRADIENTS, GLOW, RADIUS, SPACING } from '@/constants/theme';

type GradientCardVariant = 'default' | 'hero' | 'accent';

interface GradientCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: GradientCardVariant;
  testID?: string;
}

const VARIANT_CONFIG = {
  default: {
    colors: GRADIENTS.card,
    borderColor: GLOW.purple,
    shadowColor: GLOW.purple,
  },
  hero: {
    colors: GRADIENTS.hero,
    borderColor: GLOW.cyan,
    shadowColor: GLOW.cyan,
  },
  accent: {
    colors: GRADIENTS.accent,
    borderColor: GLOW.purple,
    shadowColor: GLOW.purple,
  },
} as const;

export function GradientCard({
  children,
  style,
  variant = 'default',
  testID,
}: GradientCardProps) {
  const config = VARIANT_CONFIG[variant];

  return (
    <View
      testID={testID}
      style={[
        styles.outer,
        {
          borderColor: config.borderColor,
          shadowColor: config.shadowColor,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={[...config.colors]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        {children}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  gradient: {
    padding: SPACING.lg,
    borderRadius: RADIUS.lg - 1,
  },
});
