import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';

interface SegmentedControlProps {
  segments: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
}

export function SegmentedControl({ segments, selectedIndex, onChange }: SegmentedControlProps) {
  return (
    <View style={styles.container}>
      {segments.map((segment, index) => (
        <TouchableOpacity
          key={segment}
          style={[styles.segment, index === selectedIndex && styles.segmentActive]}
          onPress={() => onChange(index)}
          activeOpacity={0.7}
        >
          <Text style={[styles.segmentText, index === selectedIndex && styles.segmentTextActive]}>
            {segment}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceHighlight,
    borderRadius: RADIUS.sm,
    padding: 2,
  },
  segment: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: RADIUS.sm - 1,
  },
  segmentActive: {
    backgroundColor: COLORS.surface,
  },
  segmentText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  segmentTextActive: {
    color: COLORS.text,
    fontWeight: '600',
  },
});
