import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { SPACING, FONT_SIZE, FONT_WEIGHT, LINE_HEIGHT, RADIUS } from '@/constants/theme';

interface ReflectionStepCompleteProps {
  onFinish: () => void;
}

export function ReflectionStepComplete({ onFinish }: ReflectionStepCompleteProps) {
  const { colors, gradients, glow, shadows } = useTheme();
  const { t } = useLocale();

  const handleFinish = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onFinish();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>👑</Text>
      <Text style={[styles.title, { color: colors.text }]}>{t('reflection.step3.title')}</Text>
      <Text style={[styles.subtitle, { color: colors.primary }]}>
        {t('reflection.step3.subtitle')}
      </Text>

      <TouchableOpacity
        testID="reflection-finish"
        activeOpacity={0.88}
        onPress={handleFinish}
        style={[shadows.glowCard, { shadowColor: glow.purple, borderRadius: RADIUS.xl }]}
      >
        <LinearGradient
          colors={[...gradients.button]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.finishButton}
        >
          <Text style={[styles.finishText, { color: colors.contrastText }]}>
            {t('reflection.step3.finishButton')}
          </Text>
        </LinearGradient>
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
    fontSize: 56,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.extrabold,
    lineHeight: LINE_HEIGHT.xxl,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
  },
  finishButton: {
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
  },
});
