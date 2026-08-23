import { FONT_SIZE, FONT_WEIGHT, LINE_HEIGHT, SPACING } from '@/constants/theme';
import { useLocale } from '@/hooks/useLocale';
import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

/**
 * ヒーロー直下の主張ブロック（2行見出し + 本文）。
 *
 * なぜ見出しを2行に割るか: 「意志力の問題じゃない」で否定し、
 * 「仕組みで、止める」で解を出す。1行に詰めると対比が消えて主張が弱まるため、
 * 色も行も分けて対に見せる。
 *
 * 見出しの上に前置きを置かないのは、本題に入る前にもう一段読ませることになるため。
 * 天体のすぐ下でいきなり主張を出す。
 */
export function CosmicHeadline() {
  const { colors } = useTheme();
  const { t } = useLocale();

  return (
    <View testID="cosmic-headline" style={styles.container}>
      <Text style={[styles.headline, { color: colors.text }]}>
        {t('paywall.cosmic.headlineTop')}
      </Text>
      <Text style={[styles.headline, { color: colors.cyan }]}>
        {t('paywall.cosmic.headlineBottom')}
      </Text>
      <Text style={[styles.body, { color: colors.textSecondary }]}>
        {t('paywall.cosmic.body')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  headline: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.extrabold,
    lineHeight: LINE_HEIGHT.xl,
    textAlign: 'center',
  },
  body: {
    marginTop: SPACING.lg,
    fontSize: FONT_SIZE.sm,
    lineHeight: LINE_HEIGHT.body,
    textAlign: 'center',
  },
});
