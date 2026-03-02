import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Slider } from '@/components/ui/Slider';
import { useTheme } from '@/hooks/useTheme';
import { SPACING, FONT_SIZE } from '@/constants/theme';

interface LevelSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  minLabel?: string;
  maxLabel?: string;
  maximumValue?: number;
  minimumValue?: number;
}

export function LevelSlider({
  label,
  value,
  onChange,
  minLabel,
  maxLabel,
  maximumValue = 4,
  minimumValue = 0,
}: LevelSliderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.value, { color: colors.primary }]}>{value}</Text>
      </View>
      <Slider
        value={value}
        onValueChange={onChange}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={1}
      />
      <View style={styles.footer}>
        <Text style={[styles.subLabel, { color: colors.textSecondary }]}>{minLabel}</Text>
        <Text style={[styles.subLabel, { color: colors.textSecondary }]}>{maxLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
  },
  value: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  subLabel: {
    fontSize: FONT_SIZE.xs,
  },
});
