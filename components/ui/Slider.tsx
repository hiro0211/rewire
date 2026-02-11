import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import CommunitySlider from '@react-native-community/slider';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';

// Note: Requires installation of @react-native-community/slider
// For now, implementing a basic wrapper.
// User might need to run: npx expo install @react-native-community/slider

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
  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.header}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{value}</Text>
        </View>
      )}
      <CommunitySlider
        style={styles.slider}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        value={value}
        onValueChange={onValueChange}
        minimumTrackTintColor={COLORS.primary}
        maximumTrackTintColor={COLORS.surfaceHighlight}
        thumbTintColor={COLORS.primary}
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
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
  },
  value: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
  },
  slider: {
    width: '100%',
    height: 40,
  },
});
