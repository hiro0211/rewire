import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { Button } from '@/components/ui/Button';
import { formatPrice } from './paywallUtils';
import { DiscountBadge } from './DiscountBadge';
import { PaywallCloseButton } from './PaywallCloseButton';
import { PaywallFooter } from './PaywallFooter';
import { usePurchase } from '@/hooks/paywall/usePurchase';
import { extractOfferingPackages } from '@/hooks/paywall/useOfferingPackages';

interface PaywallTrialProps {
  offering: any;
  onDismiss: () => void;
  onPurchaseCompleted: () => void;
  onRestoreCompleted: () => void;
}

export function PaywallTrial({
  offering,
  onDismiss,
  onPurchaseCompleted,
  onRestoreCompleted,
}: PaywallTrialProps) {
  const { colors, gradients } = useTheme();
  const { t } = useLocale();

  const { annualPackage, annualPrice, currencyCode } = extractOfferingPackages(offering);

  const { purchasing, handlePurchase, handleRestore } = usePurchase({
    package: annualPackage,
    onPurchaseCompleted,
    onRestoreCompleted,
  });

  return (
    <SafeAreaWrapper>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <PaywallCloseButton onPress={onDismiss} />

        {/* Logo */}
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Headline */}
        <Text style={[styles.offerTitle, { color: colors.text }]}>SPECIAL OFFER</Text>
        <Text style={[styles.offerSub, { color: colors.textSecondary }]}>{t('paywall.personalOffer')}</Text>

        {/* Big discount card */}
        <View style={styles.discountWrap}>
          <DiscountBadge percentage={69} />
        </View>

        {/* FREE TRIAL Ribbon */}
        <View style={styles.ribbonContainer}>
          <LinearGradient
            colors={gradients.accent as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ribbon}
          >
            <Text style={[styles.ribbonText, { color: colors.contrastText }]}>FREE TRIAL</Text>
          </LinearGradient>
        </View>

        {/* Trial info */}
        <Text style={[styles.trialTitle, { color: colors.text }]}>{t('paywall.tryFree')}</Text>
        <Text style={[styles.trialSub, { color: colors.textSecondary }]}>
          {t('paywall.trialBilling', { price: formatPrice(annualPrice, currencyCode) })}
        </Text>
        <Text style={[styles.trialHighlight, { color: colors.text }]}>{t('paywall.noPaymentNow')}</Text>

        {/* CTA */}
        <Button
          title={t('paywall.startFreeTrial')}
          onPress={handlePurchase}
          variant="gradient"
          size="lg"
          loading={purchasing}
          disabled={purchasing}
          style={styles.ctaButton}
        />

        <PaywallFooter
          onRestore={handleRestore}
          purchasing={purchasing}
          trialText={t('paywall.trialAutoRenew')}
        />
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.xxxl,
    paddingBottom: SPACING.xxxl,
    alignItems: 'center',
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    marginBottom: SPACING.xl,
  },
  offerTitle: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 2,
  },
  offerSub: {
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  discountWrap: {
    marginBottom: SPACING.lg,
  },
  ribbonContainer: {
    marginBottom: SPACING.xl,
    transform: [{ rotate: '-5deg' }],
  },
  ribbon: {
    paddingHorizontal: SPACING.xxxl,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  ribbonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '900',
    letterSpacing: 3,
  },
  trialTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  trialSub: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  trialHighlight: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  ctaButton: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
});
