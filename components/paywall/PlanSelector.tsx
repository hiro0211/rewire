import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SPACING, FONT_SIZE, RADIUS, FONT_WEIGHT, } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { calcMonthlyPrice, calcRelativeDiscount, formatPrice } from './paywallUtils';

interface PlanSelectorProps {
  annualPackage: any;
  monthlyPackage: any;
  selectedPlan: 'annual' | 'monthly';
  onSelectPlan: (plan: 'annual' | 'monthly') => void;
  currencyCode?: string;
  showMonthly?: boolean;
}

export function PlanSelector({
  annualPackage,
  monthlyPackage,
  selectedPlan,
  onSelectPlan,
  currencyCode = 'JPY',
  showMonthly = true,
}: PlanSelectorProps) {
  const { colors, glow, shadows } = useTheme();
  const { t } = useLocale();
  const annualPrice = annualPackage?.product?.price ?? 5400;
  const monthlyPrice = monthlyPackage?.product?.price ?? 680;
  const annualMonthly = calcMonthlyPrice(annualPrice);

  // 月額プランがある場合のみ、月額比の割引率を従属バッジとして表示する
  const discountPercent =
    showMonthly && monthlyPackage ? calcRelativeDiscount(monthlyPrice, annualPrice) : 0;

  const annualPriceStr = annualPackage?.product?.priceString ?? `¥${annualPrice}`;
  const monthlyPriceStr = monthlyPackage?.product?.priceString ?? `¥${monthlyPrice}`;

  return (
    <View style={styles.container}>
      {/* Annual Card */}
      <TouchableOpacity
        testID="plan-annual"
        style={[
          styles.card,
          selectedPlan === 'annual'
            ? { ...shadows.glowCard, borderColor: glow.purple, backgroundColor: 'rgba(139, 92, 246, 0.08)', shadowColor: glow.purple }
            : { borderColor: colors.border, backgroundColor: colors.surface },
        ]}
        onPress={() => onSelectPlan('annual')}
        activeOpacity={0.7}
      >
        <Text style={[styles.planLabel, { marginTop: SPACING.xxl, color: colors.textSecondary }]}>
          {t('paywall.planAnnual')}
        </Text>
        {discountPercent > 0 && (
          <Text style={[styles.savingsBadge, { color: colors.success }]}>
            {t('paywall.savePercent', { percent: discountPercent })}
          </Text>
        )}
        {/* 主役: 実際に請求される総額（Guideline 3.1.2(c)） */}
        <Text style={[styles.priceMain, { color: colors.text }]}>{annualPriceStr}</Text>
        <Text style={[styles.priceSub, { color: colors.textSecondary }]}>{t('paywall.perYear')}</Text>
        {/* 従属: 月換算は小さく muted に */}
        <Text style={[styles.priceEquivalent, { color: colors.textSecondary }]}>
          {t('paywall.monthlyEquivalent', { price: formatPrice(annualMonthly, currencyCode) })}
        </Text>
      </TouchableOpacity>

      {/* Monthly Card */}
      {showMonthly && (
        <TouchableOpacity
          testID="plan-monthly"
          style={[
            styles.card,
            selectedPlan === 'monthly'
              ? { ...shadows.glowCard, borderColor: glow.purple, backgroundColor: 'rgba(139, 92, 246, 0.08)', shadowColor: glow.purple }
              : { borderColor: colors.border, backgroundColor: colors.surface },
          ]}
          onPress={() => onSelectPlan('monthly')}
          activeOpacity={0.7}
        >
          <Text style={[styles.planLabel, { marginTop: SPACING.xxl, color: colors.textSecondary }]}>
            {t('paywall.planMonthly')}
          </Text>
          <Text style={[styles.priceMain, { color: colors.text }]}>{monthlyPriceStr}</Text>
          <Text style={[styles.priceSub, { color: colors.textSecondary }]}>{t('paywall.perMonth')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  card: {
    flex: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  planLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    marginBottom: SPACING.xs,
  },
  priceMain: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.extrabold,
  },
  priceSub: {
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.xs,
  },
  // 月換算（従属表示）: 主役の請求総額より明確に小さく muted
  priceEquivalent: {
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  // 割引バッジ（従属表示）
  savingsBadge: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    marginBottom: SPACING.xs,
  },
});
