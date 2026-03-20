import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { Button } from '@/components/ui/Button';
import { GlowDivider } from '@/components/ui/GlowDivider';
import { PlanSelector } from './PlanSelector';
import { FeatureCard } from './FeatureCard';
import { formatPrice } from './paywallUtils';
import { PaywallCloseButton } from './PaywallCloseButton';
import { PaywallFooter } from './PaywallFooter';
import { useLocale } from '@/hooks/useLocale';
import { usePurchase } from '@/hooks/paywall/usePurchase';
import { extractOfferingPackages } from '@/hooks/paywall/useOfferingPackages';

interface PaywallDefaultProps {
  offering: any;
  onDismiss: () => void;
  onPurchaseCompleted: () => void;
  onRestoreCompleted: () => void;
}

const FEATURE_KEYS = [
  { emoji: '🎯', titleKey: 'paywall.features.streakTracking.title', descriptionKey: 'paywall.features.streakTracking.description' },
  { emoji: '🔥', titleKey: 'paywall.features.sosBreathing.title', descriptionKey: 'paywall.features.sosBreathing.description' },
  { emoji: '📊', titleKey: 'paywall.features.dailyCheckin.title', descriptionKey: 'paywall.features.dailyCheckin.description' },
  { emoji: '🏆', titleKey: 'paywall.features.badges.title', descriptionKey: 'paywall.features.badges.description' },
  { emoji: '⏱️', titleKey: 'paywall.features.widget.title', descriptionKey: 'paywall.features.widget.description' },
];

export function PaywallDefault({
  offering,
  onDismiss,
  onPurchaseCompleted,
  onRestoreCompleted,
}: PaywallDefaultProps) {
  const { colors } = useTheme();
  const { t } = useLocale();
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');

  const { annualPackage, monthlyPackage, annualPrice, monthlyPrice, currencyCode } =
    extractOfferingPackages(offering);
  const hasMonthly = !!monthlyPackage;
  const selectedPackage = selectedPlan === 'annual' ? annualPackage : monthlyPackage;

  const { purchasing, handlePurchase, handleRestore } = usePurchase({
    package: selectedPackage,
    onPurchaseCompleted,
    onRestoreCompleted,
  });

  const annualCurrencyCode = currencyCode;
  const monthlyCurrencyCode = monthlyPackage?.product?.currencyCode ?? 'JPY';
  const billingText =
    selectedPlan === 'annual'
      ? t('paywall.billingAnnual', { price: formatPrice(annualPrice, annualCurrencyCode) })
      : t('paywall.billingMonthly', { price: formatPrice(monthlyPrice, monthlyCurrencyCode) });

  return (
    <SafeAreaWrapper edges={['top']}>
      <View style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <PaywallCloseButton onPress={onDismiss} />

          {/* Logo + Tagline */}
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.tagline, { color: colors.cyan }]}>{t('paywall.tagline')}</Text>

          {/* Plan Selector */}
          <View style={styles.planSelectorWrap}>
            <PlanSelector
              annualPackage={annualPackage}
              monthlyPackage={monthlyPackage}
              selectedPlan={selectedPlan}
              onSelectPlan={setSelectedPlan}
              currencyCode={annualCurrencyCode}
              showMonthly={hasMonthly}
            />
          </View>

          <GlowDivider />

          {/* Headline */}
          <Text style={[styles.headline, { color: colors.text }]}>
            {t('paywall.headline')}
          </Text>
          <Text style={[styles.subHeadline, { color: colors.textSecondary }]}>
            {t('paywall.subHeadline')}
          </Text>

          {/* Feature Cards */}
          <View style={styles.featuresWrap}>
            {FEATURE_KEYS.map((f) => (
              <FeatureCard key={f.titleKey} emoji={f.emoji} title={t(f.titleKey)} description={t(f.descriptionKey)} />
            ))}
          </View>
        </ScrollView>

        {/* Fixed Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background, paddingBottom: insets.bottom + SPACING.sm }]}>
          <Button
            title={t('paywall.startFree')}
            onPress={handlePurchase}
            variant="gradient"
            size="lg"
            loading={purchasing}
            disabled={purchasing}
            style={styles.ctaButton}
          />
          <Text style={[styles.billingNote, { color: colors.textSecondary }]}>{billingText}</Text>
          <Text style={[styles.cancelNote, { color: colors.textSecondary }]}>{t('paywall.cancelAnytime')}</Text>
          <PaywallFooter onRestore={handleRestore} purchasing={purchasing} />
        </View>
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: SPACING.lg,
  },
  tagline: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  planSelectorWrap: {
    marginBottom: SPACING.lg,
  },
  headline: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: SPACING.lg,
    lineHeight: 28,
  },
  subHeadline: {
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
  featuresWrap: {
    marginTop: SPACING.sm,
  },
  footer: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  cancelNote: {
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.xs,
  },
  ctaButton: {
    width: '100%',
  },
  billingNote: {
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.sm,
  },
});
