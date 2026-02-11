import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Slider } from '@/components/ui/Slider';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';

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
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
      <Slider
        value={value}
        onValueChange={onChange}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={1}
      />
      <View style={styles.footer}>
        <Text style={styles.subLabel}>{minLabel}</Text>
        <Text style={styles.subLabel}>{maxLabel}</Text>
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
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
  },
  value: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  subLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
  },
});
