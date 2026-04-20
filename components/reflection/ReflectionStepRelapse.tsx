import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { SPACING, FONT_SIZE, FONT_WEIGHT, LINE_HEIGHT, RADIUS } from '@/constants/theme';

interface ReflectionStepRelapseProps {
  onSelect: (watchedPorn: boolean) => void;
}

export function ReflectionStepRelapse({ onSelect }: ReflectionStepRelapseProps) {
  const { colors, glow } = useTheme();
  const { t } = useLocale();

  const handleSelect = (value: boolean) => {
    Haptics.impactAsync(
      value ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light
    );
    onSelect(value);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>👀</Text>
      <Text style={[styles.title, { color: colors.text }]}>{t('reflection.step1.title')}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {t('reflection.step1.subtitle')}
      </Text>

      <TouchableOpacity
        testID="reflection-step1-no"
        style={[
          styles.primaryButton,
          {
            borderColor: colors.primary,
            backgroundColor: 'transparent',
            shadowColor: glow.purple,
          },
        ]}
        activeOpacity={0.85}
        onPress={() => handleSelect(false)}
      >
        <Text style={[styles.primaryButtonText, { color: colors.text }]}>
          {t('reflection.step1.noButton')} 💪
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        testID="reflection-step1-yes"
        style={[
          styles.dangerButton,
          {
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            borderColor: 'rgba(239, 68, 68, 0.4)',
          },
        ]}
        activeOpacity={0.85}
        onPress={() => handleSelect(true)}
      >
        <Text style={[styles.dangerButtonText, { color: colors.danger }]}>
          ⚠ {t('reflection.step1.yesButton')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.lg,
    alignItems: 'stretch',
  },
  emoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    lineHeight: LINE_HEIGHT.xxl,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  primaryButton: {
    borderWidth: 1.5,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
  },
  dangerButton: {
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
  },
});
