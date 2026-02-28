import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GLOW, SPACING } from '@/constants/theme';

interface GlowDividerProps {
  color?: string;
}

export function GlowDivider({ color = GLOW.purple }: GlowDividerProps) {
  return (
    <View testID="glow-divider" style={styles.container}>
      <View style={[styles.line, { backgroundColor: color, shadowColor: color }]} />
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
