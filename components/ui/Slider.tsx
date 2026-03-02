import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import CommunitySlider from '@react-native-community/slider';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface SliderProps {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  label?: string;
}

export function Slider({
  value,
  onValueChange,
  minimumValue = 0,
  maximumValue = 100,
  step = 1,
  label,
}: SliderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.header}>
          <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
          <Text style={[styles.value, { color: colors.primary }]}>{value}</Text>
        </View>
      )}
      <CommunitySlider
        style={styles.slider}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        value={value}
        onValueChange={onValueChange}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.surfaceHighlight}
        thumbTintColor={colors.primary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: FONT_SIZE.md,
  },
  value: {
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
  },
  slider: {
    width: '100%',
    height: 40,
  },
});
