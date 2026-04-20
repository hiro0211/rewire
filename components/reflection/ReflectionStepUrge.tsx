import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { SPACING, FONT_SIZE, FONT_WEIGHT, LINE_HEIGHT, RADIUS } from '@/constants/theme';

interface ReflectionStepUrgeProps {
  onSelect: (level: number) => void;
  isSubmitting: boolean;
}

type UrgeOption = {
  value: number;
  emoji: string;
  labelKey: string;
  tint: readonly [string, string];
};

const OPTIONS: readonly UrgeOption[] = [
  { value: 0, emoji: '😌', labelKey: 'reflection.step2.levels.none', tint: ['rgba(34, 197, 94, 0.20)', 'rgba(34, 197, 94, 0.05)'] },
  { value: 1, emoji: '🙂', labelKey: 'reflection.step2.levels.low', tint: ['rgba(132, 204, 22, 0.20)', 'rgba(132, 204, 22, 0.05)'] },
  { value: 2, emoji: '😐', labelKey: 'reflection.step2.levels.moderate', tint: ['rgba(234, 179, 8, 0.20)', 'rgba(234, 179, 8, 0.05)'] },
  { value: 3, emoji: '😣', labelKey: 'reflection.step2.levels.high', tint: ['rgba(249, 115, 22, 0.20)', 'rgba(249, 115, 22, 0.05)'] },
  { value: 4, emoji: '🔥', labelKey: 'reflection.step2.levels.max', tint: ['rgba(239, 68, 68, 0.22)', 'rgba(239, 68, 68, 0.06)'] },
] as const;

export function ReflectionStepUrge({ onSelect, isSubmitting }: ReflectionStepUrgeProps) {
  const { colors } = useTheme();
  const { t } = useLocale();

  const handleSelect = (level: number) => {
    if (isSubmitting) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(level);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>💭</Text>
      <Text style={[styles.title, { color: colors.text }]}>{t('reflection.step2.title')}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {t('reflection.step2.subtitle')}
      </Text>

      <View style={styles.options}>
        {OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            testID={`reflection-urge-${opt.value}`}
            activeOpacity={0.85}
            disabled={isSubmitting}
            onPress={() => handleSelect(opt.value)}
            style={styles.optionWrapper}
          >
            <LinearGradient
              colors={opt.tint}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.option, { borderColor: 'rgba(255,255,255,0.06)' }]}
            >
              <Text style={styles.optionEmoji}>{opt.emoji}</Text>
              <Text style={[styles.optionLabel, { color: colors.text }]}>
                {t(opt.labelKey)}
              </Text>
              <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.lg,
  },
  emoji: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    lineHeight: LINE_HEIGHT.xl,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  options: {
    gap: SPACING.sm,
  },
  optionWrapper: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
  },
  optionEmoji: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  optionLabel: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
  },
  chevron: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.regular,
  },
});
