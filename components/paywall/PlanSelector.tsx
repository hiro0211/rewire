import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, RADIUS, GLOW } from '@/constants/theme';
import { calcMonthlyPrice } from './paywallUtils';

interface PlanSelectorProps {
  annualPackage: any;
  monthlyPackage: any;
  selectedPlan: 'annual' | 'monthly';
  onSelectPlan: (plan: 'annual' | 'monthly') => void;
}

export function PlanSelector({
  annualPackage,
  monthlyPackage,
  selectedPlan,
  onSelectPlan,
}: PlanSelectorProps) {
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
          selectedPlan === 'annual' ? styles.cardSelected : styles.cardUnselected,
        ]}
        onPress={() => onSelectPlan('annual')}
        activeOpacity={0.7}
      >
        <Text style={[styles.planLabel, { marginTop: SPACING.xxl }]}>Annual</Text>
        <Text style={styles.priceMain}>¥{annualMonthly}</Text>
        <Text style={styles.priceSub}>/月</Text>
      </TouchableOpacity>

      {/* Monthly Card */}
      <TouchableOpacity
        testID="plan-monthly"
        style={[
          styles.card,
          selectedPlan === 'monthly' ? styles.cardSelected : styles.cardUnselected,
        ]}
        onPress={() => onSelectPlan('monthly')}
        activeOpacity={0.7}
      >
        <Text style={[styles.planLabel, { marginTop: SPACING.xxl }]}>Monthly</Text>
        <Text style={styles.priceMain}>{monthlyPriceStr}</Text>
        <Text style={styles.priceSub}>/月</Text>
      </TouchableOpacity>
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
  cardSelected: {
    borderColor: GLOW.purple,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    shadowColor: GLOW.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  cardUnselected: {
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  planLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  priceMain: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
  },
  priceSub: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.xs,
  },
});
