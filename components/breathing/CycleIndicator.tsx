import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { SPACING } from '@/constants/theme';
import { BREATHING_CONFIG } from '@/constants/breathing';

interface CycleIndicatorProps {
  currentCycle: number; // 0 to MAX
}

export function CycleIndicator({ currentCycle }: CycleIndicatorProps) {
  const { colors } = useTheme();

  const dots = Array.from({ length: BREATHING_CONFIG.CYCLES_PER_SESSION });

  return (
    <View style={styles.container}>
      {dots.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index < currentCycle && { backgroundColor: colors.primary, borderColor: colors.primary, opacity: 0.5 },
            index === currentCycle && { backgroundColor: colors.primary, borderColor: colors.primary },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 6,
  },
});
