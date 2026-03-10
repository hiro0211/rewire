import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { Button } from '@/components/ui/Button';
import { formatPrice } from './paywallUtils';
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
        <Text style={[styles.offerSub, { color: colors.textSecondary }]}>あなたへの特別オファー</Text>

        {/* Big discount card */}
        <LinearGradient
          colors={['#6D28D9', '#1E40AF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.discountCard}
        >
          <Text style={[styles.discountNumber, { color: colors.contrastText }]}>69%</Text>
          <Text style={styles.discountOff}>OFF</Text>
        </LinearGradient>

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
        <Text style={[styles.trialTitle, { color: colors.text }]}>Rewireを3日間無料でお試し</Text>
        <Text style={[styles.trialSub, { color: colors.textSecondary }]}>
          3日間無料、その後 {formatPrice(annualPrice, currencyCode)}/年
        </Text>
        <Text style={[styles.trialHighlight, { color: colors.text }]}>今すぐ支払いなし</Text>

        {/* CTA */}
        <Button
          title="無料トライアルを始める"
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
          trialText="無料トライアル終了後、サブスクリプション料金が自動で課金されます。"
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
  discountCard: {
    width: 200,
    height: 200,
    borderRadius: RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: SPACING.lg,
  },
  discountNumber: {
    fontSize: 64,
    fontWeight: '900',
  },
  discountOff: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    letterSpacing: 4,
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
