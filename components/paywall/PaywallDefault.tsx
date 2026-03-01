import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, RADIUS, GLOW, GRADIENTS } from '@/constants/theme';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { Button } from '@/components/ui/Button';
import { GlowDivider } from '@/components/ui/GlowDivider';
import { PlanSelector } from './PlanSelector';
import { FeatureCard } from './FeatureCard';
import { calcMonthlyPrice } from './paywallUtils';
import { SubscriptionTerms } from './SubscriptionTerms';
import { isExpoGo } from '@/lib/nativeGuard';

let Purchases: any = null;
if (!isExpoGo) {
  try {
    Purchases = require('react-native-purchases').default;
  } catch {}
}

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
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');
  const [purchasing, setPurchasing] = useState(false);

  const annualPackage = offering?.annual;
  const monthlyPackage = offering?.monthly;
  const selectedPackage = selectedPlan === 'annual' ? annualPackage : monthlyPackage;

  const annualPrice = annualPackage?.product?.price ?? 5400;
  const monthlyPrice = monthlyPackage?.product?.price ?? 680;
  const billingText =
    selectedPlan === 'annual'
      ? `Billed as ¥${annualPrice.toLocaleString()} per year`
      : `Billed as ¥${monthlyPrice.toLocaleString()} per month`;

  const handlePurchase = async () => {
    if (!Purchases || purchasing || !selectedPackage) return;
    setPurchasing(true);
    try {
      const { customerInfo } = await Purchases.purchasePackage(selectedPackage);
      if (customerInfo.entitlements.active['Rewire Pro']) {
        onPurchaseCompleted();
      }
    } catch (error: any) {
      if (error.userCancelled || error.code === '1' || error.code === 'PURCHASE_CANCELLED') return;
      Alert.alert('購入エラー', 'お支払い処理中にエラーが発生しました。');
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    if (!Purchases) return;
    setPurchasing(true);
    try {
      const customerInfo = await Purchases.restorePurchases();
      if (customerInfo.entitlements.active['Rewire Pro']) {
        onRestoreCompleted();
      } else {
        Alert.alert('復元結果', '有効なサブスクリプションが見つかりませんでした。');
      }
    } catch {
      Alert.alert('復元エラー', '購入の復元中にエラーが発生しました。');
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <SafeAreaWrapper>
      <View style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Close button */}
          <TouchableOpacity
            testID="close-button"
            style={styles.closeButton}
            onPress={onDismiss}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          {/* Logo + Tagline */}
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.tagline}>自分を、取り戻そう。</Text>

          {/* Plan Selector */}
          <View style={styles.planSelectorWrap}>
            <PlanSelector
              annualPackage={annualPackage}
              monthlyPackage={monthlyPackage}
              selectedPlan={selectedPlan}
              onSelectPlan={setSelectedPlan}
            />
          </View>

          <GlowDivider />

          {/* Headline */}
          <Text style={styles.headline}>
            意志力の問題じゃない。{'\n'}ポルノを自動ブロック。
          </Text>
          <Text style={styles.subHeadline}>
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
        <View style={styles.footer}>
          <Text style={styles.cancelNote}>いつでもキャンセル可能</Text>
          <Button
            title="今すぐ始める"
            onPress={handlePurchase}
            variant="gradient"
            size="lg"
            loading={purchasing}
            disabled={purchasing}
            style={styles.ctaButton}
          />
          <Text style={styles.billingNote}>{billingText}</Text>
          <SubscriptionTerms />
          <TouchableOpacity onPress={handleRestore} disabled={purchasing}>
            <Text style={styles.restoreText}>購入の復元</Text>
          </TouchableOpacity>
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
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: SPACING.lg,
  },
  tagline: {
    color: COLORS.cyan,
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  planSelectorWrap: {
    marginBottom: SPACING.lg,
  },
  headline: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: SPACING.lg,
    lineHeight: 28,
  },
  subHeadline: {
    color: COLORS.textSecondary,
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
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  cancelNote: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    marginBottom: SPACING.sm,
  },
  ctaButton: {
    width: '100%',
  },
  billingNote: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.sm,
  },
  restoreText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.sm,
    textDecorationLine: 'underline',
  },
});
