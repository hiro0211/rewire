import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';

interface MemoInputProps {
  value: string;
  onChange: (text: string) => void;
}

export function MemoInput({ value, onChange }: MemoInputProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>一言メモ（任意）</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.surfaceHighlight, color: colors.text }]}
        value={value}
        onChangeText={onChange}
        placeholder="今日の気づきや感情..."
        placeholderTextColor={colors.textSecondary}
        multiline
        maxLength={140}
      />
      <Text style={[styles.count, { color: colors.textSecondary }]}>{value.length} / 140</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: FONT_SIZE.lg,
    marginBottom: SPACING.md,
    fontWeight: '600',
  },
  input: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    height: 100,
    textAlignVertical: 'top',
  },
  count: {
    fontSize: FONT_SIZE.xs,
    alignSelf: 'flex-end',
    marginTop: SPACING.xs,
  },
});
