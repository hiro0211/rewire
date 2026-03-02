import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { RADIUS, SPACING } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'outlined' | 'elevated';
}

export function Card({ children, style, variant = 'default' }: CardProps) {
  const { colors, shadows } = useTheme();

  return (
    <View
      testID={variant === 'elevated' ? 'card-elevated' : undefined}
      style={[
        styles.container,
        { backgroundColor: colors.surface },
        variant === 'outlined' && [styles.outlined, { borderColor: colors.surfaceHighlight, backgroundColor: 'transparent' }],
        variant === 'elevated' && [{ backgroundColor: colors.surface, ...shadows.medium, borderWidth: 1, borderColor: 'rgba(0, 212, 255, 0.08)' }],
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
  },
  outlined: {
    borderWidth: 1,
  },
});
