import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SPACING } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface GlowDividerProps {
  color?: string;
}

export function GlowDivider({ color }: GlowDividerProps) {
  const { glow } = useTheme();
  const resolvedColor = color ?? glow.purple;

  return (
    <View testID="glow-divider" style={styles.container}>
      <View style={[styles.line, { backgroundColor: resolvedColor, shadowColor: resolvedColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  line: {
    height: 1,
    width: '100%',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
});
