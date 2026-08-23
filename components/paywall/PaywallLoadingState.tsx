import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SPACING, FONT_SIZE, LINE_HEIGHT } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';

/**
 * オファリング取得中のプレースホルダー。
 * 課金画面本体を描く前の唯一の表示なので、背景は呼び出し側（app/paywall.tsx）が持つ。
 */
export function PaywallLoadingState() {
  const { colors } = useTheme();
  const { t } = useLocale();

  return (
    <View style={styles.fallback}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.fallbackText, { color: colors.textSecondary }]}>{t('common.loading')}</Text>
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
  fallbackText: {
    fontSize: FONT_SIZE.md,
    marginBottom: SPACING.lg,
    textAlign: 'center',
    lineHeight: LINE_HEIGHT.md,
  },
});
