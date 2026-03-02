import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { RADIUS, SPACING } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

type GradientCardVariant = 'default' | 'hero' | 'accent';

interface GradientCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: GradientCardVariant;
  testID?: string;
}

export function GradientCard({
  children,
  style,
  variant = 'default',
  testID,
}: GradientCardProps) {
  const { gradients, glow } = useTheme();

  const variantConfig = {
    default: {
      colors: gradients.card,
      borderColor: glow.purple,
      shadowColor: glow.purple,
    },
    hero: {
      colors: gradients.hero,
      borderColor: glow.cyan,
      shadowColor: glow.cyan,
    },
    accent: {
      colors: gradients.accent,
      borderColor: glow.purple,
      shadowColor: glow.purple,
    },
  } as const;

  const config = variantConfig[variant];

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
