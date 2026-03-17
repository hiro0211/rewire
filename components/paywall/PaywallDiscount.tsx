import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { Button } from '@/components/ui/Button';
import { GradientCard } from '@/components/ui/GradientCard';
import { CountdownTimer } from './CountdownTimer';
import { calcMonthlyPrice, formatPrice } from './paywallUtils';
import { DiscountBadge } from './DiscountBadge';
import { PaywallCloseButton } from './PaywallCloseButton';
import { PaywallFooter } from './PaywallFooter';
import { usePurchase } from '@/hooks/paywall/usePurchase';
import { useDiscountExpiryTracker } from '@/hooks/paywall/useDiscountExpiryTracker';
import { extractOfferingPackages } from '@/hooks/paywall/useOfferingPackages';

interface PaywallDiscountProps {
  offering: any;
  initialSeconds?: number;
  onDismiss: () => void;
  onPurchaseCompleted: () => void;
  onRestoreCompleted: () => void;
}

export function PaywallDiscount({
  offering,
  initialSeconds = 300,
  onDismiss,
  onPurchaseCompleted,
  onRestoreCompleted,
}: PaywallDiscountProps) {
  const { colors, gradients } = useTheme();
  useDiscountExpiryTracker();

  const { annualPackage, annualPrice, currencyCode } = extractOfferingPackages(offering);
  const monthlyEquivalent = calcMonthlyPrice(annualPrice);

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
        <Text style={[styles.offerSub, { color: colors.textSecondary }]}>今だけの特別割引</Text>

        {/* Big discount card */}
        <View style={styles.discountWrap}>
          <DiscountBadge percentage={69} />
        </View>

        {/* Timer */}
        <Text style={[styles.timerLabel, { color: colors.textSecondary }]}>この特別価格の期限:</Text>
        <CountdownTimer
          initialSeconds={initialSeconds}
          style={{ ...styles.timerDisplay, color: colors.text }}
          onExpire={onDismiss}
        />

        {/* Price card */}
        <GradientCard style={styles.priceCard}>
          <View style={styles.priceBadgeWrap}>
            <LinearGradient
              colors={gradients.accent as [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.priceBadge}
            >
              <Text style={[styles.priceBadgeText, { color: colors.contrastText }]}>LOWEST PRICE EVER</Text>
            </LinearGradient>
          </View>
          <View style={styles.priceRow}>
            <View>
              <Text style={[styles.priceLabel, { color: colors.text }]}>Yearly</Text>
              <Text style={[styles.priceDetail, { color: colors.textSecondary }]}>12ヶ月 · {formatPrice(annualPrice, currencyCode)}</Text>
            </View>
            <Text style={[styles.priceAmount, { color: colors.text }]}>{formatPrice(monthlyEquivalent, currencyCode)}/月</Text>
          </View>
        </GradientCard>

        {/* CTA */}
        <Button
          title="今すぐオファーを受け取る"
          onPress={handlePurchase}
          variant="gradient"
          size="lg"
          loading={purchasing}
          disabled={purchasing}
          style={styles.ctaButton}
        />

        {/* Footer */}
        <Text style={[styles.footerNote, { color: colors.textSecondary }]}>
          いつでもキャンセル · 集中力を取り戻す
        </Text>
        <PaywallFooter onRestore={handleRestore} purchasing={purchasing} />
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxxl,
    alignItems: 'center',
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    marginTop: SPACING.xxxl,
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
    marginBottom: SPACING.xl,
  },
  timerLabel: {
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.sm,
  },
  timerDisplay: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: '800',
    marginBottom: SPACING.xl,
  },
  priceCard: {
    width: '100%',
    marginBottom: SPACING.xl,
  },
  priceBadgeWrap: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  priceBadge: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  priceBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    letterSpacing: 1,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
  },
  priceDetail: {
    fontSize: FONT_SIZE.sm,
    marginTop: 2,
  },
  priceAmount: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
  },
  ctaButton: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
  footerNote: {
    fontSize: FONT_SIZE.xs,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
});
