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
  /**
   * 年額カードの主表示を月換算（¥450）にし、総額（¥5,400／年）を従属に落とす。
   *
   * 既定が false なのは、対照群の PaywallDefault の見た目を動かさないため。
   * A/B の途中で両群のプラン表示が変わると、差が「新デザインの効果」なのか
   * 「価格の見せ方の効果」なのか分離できなくなる。
   */
  emphasizeMonthly?: boolean;
}

export function PlanSelector({
  annualPackage,
  monthlyPackage,
  selectedPlan,
  onSelectPlan,
  currencyCode = 'JPY',
  showMonthly = true,
  emphasizeMonthly = false,
}: PlanSelectorProps) {
  const { colors, glow, shadows } = useTheme();
  const { t } = useLocale();
  const annualPrice = annualPackage?.product?.price ?? 5400;
  const monthlyPrice = monthlyPackage?.product?.price ?? 680;
  const annualMonthly = calcMonthlyPrice(annualPrice);

  // 月額プランがある場合のみ、月額比の割引率を従属バッジとして表示する
  const discountPercent =
    showMonthly && monthlyPackage ? calcRelativeDiscount(monthlyPrice, annualPrice) : 0;

  // フォールバックも formatPrice を通す。素の `¥${price}` だと桁区切りが付かず、
  // 同じ画面のフッター（formatPrice 経由）が「¥5,400」、ここが「¥5400」と割れる。
  const annualPriceStr = annualPackage?.product?.priceString ?? formatPrice(annualPrice, currencyCode);
  const monthlyPriceStr = monthlyPackage?.product?.priceString ?? formatPrice(monthlyPrice, currencyCode);

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
        {emphasizeMonthly ? (
          <>
            {/* 主役: 月換算。月額プランと同じ単位で並ぶので、割安さが直感的に伝わる */}
            <Text style={[styles.priceMain, { color: colors.text }]}>
              {formatPrice(annualMonthly, currencyCode)}
            </Text>
            <Text style={[styles.priceSub, { color: colors.textSecondary }]}>
              {t('paywall.perMonth')}
            </Text>
            {/* 従属: それでも実際に請求される総額は必ず残す。
                消すと「¥450 だと思ったら ¥5,400 請求された」になり、
                Guideline 3.1.2(c) にも信頼にも反する */}
            <Text style={[styles.priceEquivalent, { color: colors.textSecondary }]}>
              {annualPriceStr}
              {t('paywall.perYear')}
            </Text>
          </>
        ) : (
          <>
            {/* 主役: 実際に請求される総額（Guideline 3.1.2(c)） */}
            <Text style={[styles.priceMain, { color: colors.text }]}>{annualPriceStr}</Text>
            <Text style={[styles.priceSub, { color: colors.textSecondary }]}>{t('paywall.perYear')}</Text>
            {/* 従属: 月換算は小さく muted に */}
            <Text style={[styles.priceEquivalent, { color: colors.textSecondary }]}>
              {t('paywall.monthlyEquivalent', { price: formatPrice(annualMonthly, currencyCode) })}
            </Text>
          </>
        )}
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
