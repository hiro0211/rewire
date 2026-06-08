import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { Button } from '@/components/ui/Button';
import { GlowDivider } from '@/components/ui/GlowDivider';
import { FONT_SIZE, FONT_WEIGHT, LINE_HEIGHT, SPACING } from '@/constants/theme';
import { extractOfferingPackages } from '@/hooks/paywall/useOfferingPackages';
import { usePurchase } from '@/hooks/paywall/usePurchase';
import { trackEvent } from '@/lib/tracking/trackEvent';
import { useLocale } from '@/hooks/useLocale';
import { useTheme } from '@/hooks/useTheme';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FeatureCard } from './FeatureCard';
import { PaywallCloseButton } from './PaywallCloseButton';
import { PaywallFooter } from './PaywallFooter';
import { PlanSelector } from './PlanSelector';
import { ReviewCarousel } from './ReviewCarousel';
import { formatPrice } from './paywallUtils';

interface PaywallDefaultProps {
  offering: any;
  onDismiss: () => void;
  onPurchaseCompleted: () => void;
  onRestoreCompleted: () => void;
}

const FEATURE_KEYS = [
  { emoji: '🛡️', titleKey: 'paywall.features.blocker.title', descriptionKey: 'paywall.features.blocker.description' },
  { emoji: '⏱️', titleKey: 'paywall.features.widget.title', descriptionKey: 'paywall.features.widget.description' },
  { emoji: '🌬️', titleKey: 'paywall.features.sos.title', descriptionKey: 'paywall.features.sos.description' },
  { emoji: '🌙', titleKey: 'paywall.features.reflection.title', descriptionKey: 'paywall.features.reflection.description' },
  { emoji: '⭐', titleKey: 'paywall.features.badges.title', descriptionKey: 'paywall.features.badges.description' },
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
    plan: selectedPlan,
    onPurchaseCompleted,
    onRestoreCompleted,
  });

  const handleSelectPlan = (plan: 'annual' | 'monthly') => {
    trackEvent('plan_selected', { plan });
    setSelectedPlan(plan);
  };

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
              onSelectPlan={handleSelectPlan}
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

          {/* Review Carousel */}
          <ReviewCarousel />
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
    fontWeight: FONT_WEIGHT.semibold,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  planSelectorWrap: {
    marginBottom: SPACING.lg,
  },
  headline: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.extrabold,
    textAlign: 'center',
    marginTop: SPACING.lg,
    lineHeight: LINE_HEIGHT.lg,
  },
  subHeadline: {
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
    lineHeight: LINE_HEIGHT.sm,
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
  ctaButton: {
    width: '100%',
  },
  billingNote: {
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.sm,
  },
});
