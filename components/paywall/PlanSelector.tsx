import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { calcMonthlyPrice, formatPrice } from './paywallUtils';

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
  const { colors, glow } = useTheme();
  const annualPrice = annualPackage?.product?.price ?? 5400;
  const monthlyPrice = monthlyPackage?.product?.price ?? 680;
  const annualMonthly = calcMonthlyPrice(annualPrice);

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
            ? { borderColor: glow.purple, backgroundColor: 'rgba(139, 92, 246, 0.08)', shadowColor: glow.purple, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 6 }
            : { borderColor: colors.border, backgroundColor: colors.surface },
        ]}
        onPress={() => onSelectPlan('annual')}
        activeOpacity={0.7}
      >
        <Text style={[styles.planLabel, { marginTop: SPACING.xxl, color: colors.textSecondary }]}>Annual</Text>
        <Text style={[styles.priceMain, { color: colors.text }]}>{formatPrice(annualMonthly, currencyCode)}</Text>
        <Text style={[styles.priceSub, { color: colors.textSecondary }]}>/月</Text>
      </TouchableOpacity>

      {/* Monthly Card */}
      {showMonthly && (
        <TouchableOpacity
          testID="plan-monthly"
          style={[
            styles.card,
            selectedPlan === 'monthly'
              ? { borderColor: glow.purple, backgroundColor: 'rgba(139, 92, 246, 0.08)', shadowColor: glow.purple, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 6 }
              : { borderColor: colors.border, backgroundColor: colors.surface },
          ]}
          onPress={() => onSelectPlan('monthly')}
          activeOpacity={0.7}
        >
          <Text style={[styles.planLabel, { marginTop: SPACING.xxl, color: colors.textSecondary }]}>Monthly</Text>
          <Text style={[styles.priceMain, { color: colors.text }]}>{monthlyPriceStr}</Text>
          <Text style={[styles.priceSub, { color: colors.textSecondary }]}>/月</Text>
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
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  priceMain: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
  },
  priceSub: {
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.xs,
  },
});
