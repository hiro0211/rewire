import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';

interface MemoInputProps {
  value: string;
  onChange: (text: string) => void;
}

export function MemoInput({ value, onChange }: MemoInputProps) {
  const { colors } = useTheme();
  const { t } = useLocale();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{t('checkinForm.memo.label')}</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.surfaceHighlight, color: colors.text }]}
        value={value}
        onChangeText={onChange}
        placeholder={t('checkinForm.memo.placeholder')}
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
