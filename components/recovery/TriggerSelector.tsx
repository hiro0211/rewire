import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';

const TRIGGERS = ['ストレス', '退屈', '孤独', '疲れ', 'SNS', '不安', 'その他'];

interface TriggerSelectorProps {
  selected: string | null;
  onSelect: (trigger: string) => void;
}

export function TriggerSelector({ selected, onSelect }: TriggerSelectorProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>何が引き金になったと思いますか？</Text>
      <View style={styles.grid}>
        {TRIGGERS.map((trigger) => (
          <TouchableOpacity
            key={trigger}
            style={[
              styles.chip,
              { borderColor: colors.surfaceHighlight, backgroundColor: colors.surface },
              selected === trigger && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
            onPress={() => onSelect(trigger)}
          >
            <Text
              style={[
                styles.chipText,
                { color: colors.textSecondary },
                selected === trigger && { color: colors.contrastText, fontWeight: 'bold' },
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
    margin: SPACING.xs,
  },
  chipText: {
    fontSize: FONT_SIZE.md,
  },
});
