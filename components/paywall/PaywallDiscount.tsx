import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZE, RADIUS, GLOW, GRADIENTS } from '@/constants/theme';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { Button } from '@/components/ui/Button';
import { GradientCard } from '@/components/ui/GradientCard';
import { CountdownTimer } from './CountdownTimer';
import { calcMonthlyPrice } from './paywallUtils';
import { SubscriptionTerms } from './SubscriptionTerms';
import { isExpoGo } from '@/lib/nativeGuard';
import { useDiscountExpiryTracker } from '@/hooks/paywall/useDiscountExpiryTracker';

let Purchases: any = null;
if (!isExpoGo) {
  try {
    Purchases = require('react-native-purchases').default;
  } catch {}
}

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
  useDiscountExpiryTracker();
  const [purchasing, setPurchasing] = useState(false);

  const annualPackage = offering?.annual;
  const annualPrice = annualPackage?.product?.price ?? 2500;
  const monthlyEquivalent = calcMonthlyPrice(annualPrice);

  const handlePurchase = async () => {
    if (!Purchases || purchasing || !annualPackage) return;
    setPurchasing(true);
    try {
      const { customerInfo } = await Purchases.purchasePackage(annualPackage);
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
      <ScrollView
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

        {/* Logo */}
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Headline */}
        <Text style={styles.offerTitle}>SPECIAL OFFER</Text>
        <Text style={styles.offerSub}>今だけの特別割引</Text>

        {/* Big discount card */}
        <LinearGradient
          colors={['#6D28D9', '#1E40AF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.discountCard}
        >
          <Text style={styles.discountNumber}>69%</Text>
          <Text style={styles.discountOff}>OFF</Text>
        </LinearGradient>

        {/* Timer */}
        <Text style={styles.timerLabel}>この特別価格の期限:</Text>
        <CountdownTimer
          initialSeconds={initialSeconds}
          style={styles.timerDisplay}
          onExpire={onDismiss}
        />

        {/* Price card */}
        <GradientCard style={styles.priceCard}>
          <View style={styles.priceBadgeWrap}>
            <LinearGradient
              colors={[...GRADIENTS.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.priceBadge}
            >
              <Text style={styles.priceBadgeText}>LOWEST PRICE EVER</Text>
            </LinearGradient>
          </View>
          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceLabel}>Yearly</Text>
              <Text style={styles.priceDetail}>12ヶ月 · ¥{annualPrice.toLocaleString()}</Text>
            </View>
            <Text style={styles.priceAmount}>¥{monthlyEquivalent}/月</Text>
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
        <Text style={styles.footerNote}>
          いつでもキャンセル · 集中力を取り戻す
        </Text>
        <SubscriptionTerms />
        <TouchableOpacity onPress={handleRestore} disabled={purchasing}>
          <Text style={styles.restoreText}>購入の復元</Text>
        </TouchableOpacity>
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
  closeButton: {
    position: 'absolute',
    top: SPACING.xl,
    right: SPACING.screenPadding,
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
    width: 64,
    height: 64,
    borderRadius: 16,
    marginTop: SPACING.xxxl,
    marginBottom: SPACING.xl,
  },
  offerTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xxxl,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 2,
  },
  offerSub: {
    color: COLORS.textSecondary,
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
    marginBottom: SPACING.xl,
  },
  discountNumber: {
    color: '#FFFFFF',
    fontSize: 64,
    fontWeight: '900',
  },
  discountOff: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    letterSpacing: 4,
  },
  timerLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.sm,
  },
  timerDisplay: {
    fontSize: FONT_SIZE.xxxl,
    color: COLORS.text,
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
    color: '#FFFFFF',
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
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
  },
  priceDetail: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    marginTop: 2,
  },
  priceAmount: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
  },
  ctaButton: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
  footerNote: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  restoreText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.sm,
    textDecorationLine: 'underline',
  },
});
