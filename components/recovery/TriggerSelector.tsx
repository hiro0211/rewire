import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';

const TRIGGER_KEYS = [
  'recovery.triggers.stress',
  'recovery.triggers.boredom',
  'recovery.triggers.loneliness',
  'recovery.triggers.fatigue',
  'recovery.triggers.sns',
  'recovery.triggers.anxiety',
  'recovery.triggers.other',
] as const;

interface TriggerSelectorProps {
  selected: string | null;
  onSelect: (trigger: string) => void;
}

export function TriggerSelector({ selected, onSelect }: TriggerSelectorProps) {
  const { colors } = useTheme();
  const { t } = useLocale();

  const triggers = TRIGGER_KEYS.map((key) => t(key));

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{t('recovery.triggerQuestion')}</Text>
      <View style={styles.grid}>
        {triggers.map((trigger) => (
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
