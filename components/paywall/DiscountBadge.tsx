import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { FONT_SIZE, RADIUS } from '@/constants/theme';

interface DiscountBadgeProps {
  percentage: number;
}

export function DiscountBadge({ percentage }: DiscountBadgeProps) {
  const { colors } = useTheme();

  return (
    <LinearGradient
      colors={['#6D28D9', '#1E40AF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <Text style={[styles.number, { color: colors.contrastText }]}>{percentage}%</Text>
      <Text style={styles.off}>OFF</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 200,
    height: 200,
    borderRadius: RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  number: {
    fontSize: 64,
    fontWeight: '900',
  },
  off: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    letterSpacing: 4,
  },
});
