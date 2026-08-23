import { calcMonthlyPrice, calcRelativeDiscount, formatPrice } from '@/components/paywall/paywallUtils';
import { SPACING } from '@/constants/theme';
import { useLocale } from '@/hooks/useLocale';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { PlanOptionRow } from './PlanOptionRow';

type PlanId = 'annual' | 'monthly';

interface PlanOptionListProps {
  annualPrice: number;
  monthlyPrice: number;
  currencyCode: string;
  monthlyCurrencyCode: string;
  /** 月額プランが買えないときは行ごと出さない */
  showMonthly: boolean;
  selectedPlan: PlanId;
  onSelectPlan: (plan: PlanId) => void;
}

/**
 * 年額 / 月額の2択。CTA の直上に固定で置く。
 *
 * 年額行は「主 = 実際に請求される総額（¥5,400／年）」「従 = 月換算（¥450／月）」の順。
 * 逆にしてはいけない。Apple の Auto-renewable Subscriptions ページが
 * "the amount that will be billed must be the most prominent pricing element in
 * the layout" と定め、月換算のような計算値は
 * "displayed in a subordinate position and size to the annual price" と明記している。
 * 2025年11月には、この配置を理由にした 3.1.2 のリジェクト事例も出ている。
 *
 * 対照群が使う components/paywall/PlanSelector.tsx も同じ主従で描いている。
 */
export function PlanOptionList({
  annualPrice,
  monthlyPrice,
  currencyCode,
  monthlyCurrencyCode,
  showMonthly,
  selectedPlan,
  onSelectPlan,
}: PlanOptionListProps) {
  const { t } = useLocale();

  const annualMonthly = calcMonthlyPrice(annualPrice);
  // 月額プランが無いと比較対象が無いので割引率は出さない（架空の基準価格を作らない）
  const discountPercent = showMonthly ? calcRelativeDiscount(monthlyPrice, annualPrice) : 0;

  return (
    <View testID="plan-option-list" style={styles.container}>
      <PlanOptionRow
        testID="plan-annual"
        label={t('paywall.planAnnual')}
        priceMain={`${formatPrice(annualPrice, currencyCode)}${t('paywall.perYear')}`}
        priceSub={`${formatPrice(annualMonthly, currencyCode)}${t('paywall.perMonth')}`}
        badge={discountPercent > 0 ? t('paywall.savePercent', { percent: discountPercent }) : undefined}
        selected={selectedPlan === 'annual'}
        onPress={() => onSelectPlan('annual')}
      />

      {showMonthly && (
        <PlanOptionRow
          testID="plan-monthly"
          label={t('paywall.planMonthly')}
          priceMain={`${formatPrice(monthlyPrice, monthlyCurrencyCode)}${t('paywall.perMonth')}`}
          selected={selectedPlan === 'monthly'}
          onPress={() => onSelectPlan('monthly')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: SPACING.md,
  },
});
