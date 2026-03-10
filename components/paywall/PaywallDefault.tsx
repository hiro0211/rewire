import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
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
import { usePurchase } from '@/hooks/paywall/usePurchase';
import { extractOfferingPackages } from '@/hooks/paywall/useOfferingPackages';

interface PaywallDefaultProps {
  offering: any;
  onDismiss: () => void;
  onPurchaseCompleted: () => void;
  onRestoreCompleted: () => void;
}

const FEATURES = [
  { emoji: '🎯', title: 'ストリーク記録', description: '毎日の進歩を可視化' },
  { emoji: '🔥', title: 'SOS呼吸法', description: '衝動を冷静にコントロール' },
  { emoji: '📊', title: 'デイリーチェックイン', description: '自分の変化を追跡' },
  { emoji: '🏆', title: '実績バッジ', description: '達成感でモチベーション維持' },
  { emoji: '⏱️', title: 'ウィジェット対応', description: 'アプリを開かずホーム画面で経過時間をチェック' },
];

export function PaywallDefault({
  offering,
  onDismiss,
  onPurchaseCompleted,
  onRestoreCompleted,
}: PaywallDefaultProps) {
  const { colors } = useTheme();
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
      ? `Billed as ${formatPrice(annualPrice, annualCurrencyCode)} per year`
      : `Billed as ${formatPrice(monthlyPrice, monthlyCurrencyCode)} per month`;

  return (
    <SafeAreaWrapper>
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
          <Text style={[styles.tagline, { color: colors.cyan }]}>自分を、取り戻そう。</Text>

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
            意志力の問題じゃない。{'\n'}ポルノを自動ブロック。
          </Text>
          <Text style={[styles.subHeadline, { color: colors.textSecondary }]}>
            Rewireが科学的に設計されたプログラムであなたの回復をサポートします
          </Text>

          {/* Feature Cards */}
          <View style={styles.featuresWrap}>
            {FEATURES.map((f) => (
              <FeatureCard key={f.title} emoji={f.emoji} title={f.title} description={f.description} />
            ))}
          </View>
        </ScrollView>

        {/* Fixed Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
          <Text style={[styles.cancelNote, { color: colors.textSecondary }]}>いつでもキャンセル可能</Text>
          <Button
            title="今すぐ始める"
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
    marginBottom: SPACING.sm,
  },
  ctaButton: {
    width: '100%',
  },
  billingNote: {
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.sm,
  },
});
