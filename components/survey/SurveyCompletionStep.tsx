import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZE, LAYOUT } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';

interface SurveyCompletionStepProps {
  onClose: () => void;
  titleOverride?: string;
  bodyOverride?: string;
}

export function SurveyCompletionStep({ onClose, titleOverride, bodyOverride }: SurveyCompletionStepProps) {
  const { colors } = useTheme();
  const { t } = useLocale();

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: colors.success }]}>
        <Ionicons name="checkmark" size={48} color={colors.contrastText} />
      </View>

      <Text style={[styles.title, { color: colors.text }]}>
        {titleOverride ?? t('surveyCompletion.title')}
      </Text>

      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {bodyOverride ?? t('surveyCompletion.body')}
      </Text>

      <TouchableOpacity
        testID="survey-close-button"
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={onClose}
        activeOpacity={0.7}
      >
        <Text style={[styles.buttonText, { color: colors.contrastText }]}>
          {t('common.close')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    marginBottom: SPACING.xxxl,
  },
  button: {
    height: LAYOUT.buttonHeight,
    borderRadius: LAYOUT.buttonHeight / 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxxl,
    width: '100%',
  },
  buttonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
  },
});
