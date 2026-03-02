import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface SegmentedControlProps {
  segments: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
}

export function SegmentedControl({ segments, selectedIndex, onChange }: SegmentedControlProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceHighlight }]}>
      {segments.map((segment, index) => (
        <TouchableOpacity
          key={segment}
          style={[
            styles.segment,
            index === selectedIndex && [styles.segmentActive, { backgroundColor: colors.surface }],
          ]}
          onPress={() => onChange(index)}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.segmentText,
            { color: colors.textSecondary },
            index === selectedIndex && { color: colors.text, fontWeight: '600' },
          ]}>
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
    borderRadius: RADIUS.sm,
    padding: 2,
  },
  segment: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: RADIUS.sm - 1,
  },
  segmentActive: {},
  segmentText: {
    fontSize: FONT_SIZE.sm,
  },
});
