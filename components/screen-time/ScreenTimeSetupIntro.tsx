import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SPACING, FONT_SIZE, FONT_WEIGHT, RADIUS } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';

interface Props {
  onEnable: () => void;
  onSkip: () => void;
  isLoading: boolean;
}

export function ScreenTimeSetupIntro({ onEnable, onSkip, isLoading }: Props) {
  const { colors } = useTheme();
  const { t } = useLocale();

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="shield-checkmark" size={64} color="#8B5CF6" />
      </View>

      <Text style={[styles.title, { color: colors.textPrimary }]}>
        {t('screenTime.title')}
      </Text>

      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {t('screenTime.intro')}
      </Text>

      <TouchableOpacity
        style={[styles.enableButton, isLoading && styles.disabledButton]}
        onPress={onEnable}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        <Ionicons name="hourglass-outline" size={20} color="#FFFFFF" />
        <Text style={styles.enableButtonText}>
          {t('screenTime.enableButton')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.skipButton}
        onPress={onSkip}
        activeOpacity={0.7}
      >
        <Text style={[styles.skipButtonText, { color: colors.textSecondary }]}>
          {t('screenTime.skip')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  iconContainer: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xxxl,
  },
  enableButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
    gap: SPACING.sm,
    width: '100%',
  },
  disabledButton: {
    opacity: 0.5,
  },
  enableButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
  },
  skipButton: {
    marginTop: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  skipButtonText: {
    fontSize: FONT_SIZE.sm,
  },
});
