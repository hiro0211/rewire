import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { useTheme } from '@/hooks/useTheme';
import { FONT_SIZE, SPACING } from '@/constants/theme';

interface StatCardProps {
  label: string;
  value: string;
  valueColor?: string;
  testID?: string;
}

export function StatCard({ label, value, valueColor, testID }: StatCardProps) {
  const { colors } = useTheme();

  return (
    <GlassCard testID={testID} style={styles.card}>
      <View style={styles.inner}>
        <Text style={[styles.label, { color: colors.textSecondary }]} numberOfLines={1}>
          {label}
        </Text>
        <Text
          style={[styles.value, { color: valueColor ?? colors.text }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {value}
        </Text>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 0,
  },
  inner: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  label: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
  },
});
