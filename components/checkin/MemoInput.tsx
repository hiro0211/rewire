import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';

interface MemoInputProps {
  value: string;
  onChange: (text: string) => void;
}

export function MemoInput({ value, onChange }: MemoInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>一言メモ（任意）</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder="今日の気づきや感情..."
        placeholderTextColor={COLORS.textSecondary}
        multiline
        maxLength={140}
      />
      <Text style={styles.count}>{value.length} / 140</Text>
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
  input: {
    backgroundColor: COLORS.surfaceHighlight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    color: COLORS.text,
    height: 100,
    textAlignVertical: 'top',
  },
  count: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    alignSelf: 'flex-end',
    marginTop: SPACING.xs,
  },
});
