import Ionicons from '@expo/vector-icons/Ionicons';
import { PAYWALL_FEATURES } from '@/constants/paywall/paywallFeatures';
import { FONT_SIZE, FONT_WEIGHT, LINE_HEIGHT, RADIUS, SPACING } from '@/constants/theme';
import { useLocale } from '@/hooks/useLocale';
import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const ICON_SIZE = 22;

/**
 * 機能の一覧。1行1機能で縦に積む。
 *
 * 横並びのカードにしないのは、5つを一度に見渡せる形が「これだけ付いてくる」の
 * 量を伝えるのに一番効くため。1行が短いのでスクロールしながら流し読みできる。
 */
export function FeatureRowList() {
  const { colors } = useTheme();
  const { t } = useLocale();

  return (
    <View testID="feature-row-list" style={styles.container}>
      {PAYWALL_FEATURES.map((feature) => (
        <View
          key={feature.titleKey}
          testID="feature-row"
          style={[
            styles.row,
            { backgroundColor: colors.surfaceGlass, borderColor: colors.borderGlass },
          ]}
        >
          <Ionicons name={feature.icon} size={ICON_SIZE} color={colors.cyan} />
          <Text style={[styles.label, { color: colors.text }]}>{t(feature.titleKey)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  label: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    lineHeight: LINE_HEIGHT.md,
  },
});
