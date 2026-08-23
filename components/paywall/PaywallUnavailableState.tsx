import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SPACING, FONT_SIZE, FONT_WEIGHT, LINE_HEIGHT } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';

interface PaywallUnavailableStateProps {
  onRetry: () => void;
  onBack: () => void;
  /** オンボーディング中はまだ戻る先の画面がないため、離脱文言を「あとで試す」に変える */
  isFromOnboarding: boolean;
}

/**
 * オファリングを取得できなかったときの案内。
 * 課金できない状態で行き止まりにしないため、再試行と離脱の両方を必ず出す。
 */
export function PaywallUnavailableState({
  onRetry,
  onBack,
  isFromOnboarding,
}: PaywallUnavailableStateProps) {
  const { colors } = useTheme();
  const { t } = useLocale();

  return (
    <View style={styles.fallback}>
      <Text style={[styles.unavailableTitle, { color: colors.text }]}>{t('paywall.unavailableTitle')}</Text>
      <Text style={[styles.fallbackText, { color: colors.textSecondary }]}>
        {t('paywall.unavailableMessage')}
      </Text>
      <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={onRetry}>
        <Text style={[styles.retryButtonText, { color: colors.text }]}>{t('common.retry')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={[styles.backButtonText, { color: colors.textSecondary }]}>
          {isFromOnboarding ? t('paywall.tryLater') : t('common.back')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  unavailableTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: SPACING.md,
  },
  fallbackText: {
    fontSize: FONT_SIZE.md,
    marginBottom: SPACING.lg,
    textAlign: 'center',
    lineHeight: LINE_HEIGHT.md,
  },
  retryButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
  },
  backButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.md,
  },
  backButtonText: {
    fontSize: FONT_SIZE.md,
  },
});
