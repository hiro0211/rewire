import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';

const TRIGGERS = ['ストレス', '退屈', '孤独', '疲れ', 'SNS', '不安', 'その他'];

interface TriggerSelectorProps {
  selected: string | null;
  onSelect: (trigger: string) => void;
}

export function TriggerSelector({ selected, onSelect }: TriggerSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>何が引き金になったと思いますか？</Text>
      <View style={styles.grid}>
        {TRIGGERS.map((trigger) => (
          <TouchableOpacity
            key={trigger}
            style={[
              styles.chip,
              selected === trigger && styles.chipSelected,
            ]}
            onPress={() => onSelect(trigger)}
          >
            <Text
              style={[
                styles.chipText,
                selected === trigger && styles.chipTextSelected,
              ]}
            >
              {trigger}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xxl,
  },
  label: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  chip: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.surfaceHighlight,
    margin: SPACING.xs,
    backgroundColor: COLORS.surface,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
  },
  chipTextSelected: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
