import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ToggleButton } from '@/components/ui/ToggleButton';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';

interface BinaryQuestionProps {
  label: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
}

export function BinaryQuestion({ label, value, onChange }: BinaryQuestionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.buttons}>
        <ToggleButton
          title="はい"
          active={value === true}
          onPress={() => onChange(true)}
        />
        <ToggleButton
          title="いいえ"
          active={value === false}
          onPress={() => onChange(false)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xl,
  },
  label: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    marginBottom: SPACING.md,
    fontWeight: '600',
  },
  buttons: {
    flexDirection: 'row',
  },
});
