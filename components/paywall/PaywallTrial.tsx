import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZE, RADIUS, GRADIENTS } from '@/constants/theme';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { Button } from '@/components/ui/Button';
import { isExpoGo } from '@/lib/nativeGuard';

let Purchases: any = null;
if (!isExpoGo) {
  try {
    Purchases = require('react-native-purchases').default;
  } catch {}
}

interface PaywallTrialProps {
  offering: any;
  onPurchaseCompleted: () => void;
  onRestoreCompleted: () => void;
}

export function PaywallTrial({
  offering,
  onPurchaseCompleted,
  onRestoreCompleted,
}: PaywallTrialProps) {
  const [purchasing, setPurchasing] = useState(false);

  const annualPackage = offering?.annual;
  const annualPrice = annualPackage?.product?.price ?? 2500;

  const handlePurchase = async () => {
    if (!Purchases || purchasing || !annualPackage) return;
    setPurchasing(true);
    try {
      const { customerInfo } = await Purchases.purchasePackage(annualPackage);
      if (customerInfo.entitlements.active['pro']) {
        onPurchaseCompleted();
      }
    } catch (error: any) {
      if (error.userCancelled) return;
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
      if (customerInfo.entitlements.active['pro']) {
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
        {/* No close button - hard paywall */}

        {/* Logo */}
        <Text style={styles.logo}>Rewire</Text>

        {/* Headline */}
        <Text style={styles.offerTitle}>ONE TIME OFFER</Text>
        <Text style={styles.offerSub}>この特別価格は二度と表示されません</Text>

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

        {/* FREE TRIAL Ribbon */}
        <View style={styles.ribbonContainer}>
          <LinearGradient
            colors={[...GRADIENTS.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ribbon}
          >
            <Text style={styles.ribbonText}>FREE TRIAL</Text>
          </LinearGradient>
        </View>

        {/* Trial info */}
        <Text style={styles.trialTitle}>Rewireを3日間無料でお試し</Text>
        <Text style={styles.trialSub}>
          3日間無料、その後 ¥{annualPrice.toLocaleString()}/年
        </Text>
        <Text style={styles.trialHighlight}>今すぐ支払いなし</Text>

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

        {/* Restore */}
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
    paddingTop: SPACING.xxxl,
    paddingBottom: SPACING.xxxl,
    alignItems: 'center',
  },
  logo: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
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
    marginBottom: SPACING.lg,
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
    color: '#FFFFFF',
    fontSize: FONT_SIZE.lg,
    fontWeight: '900',
    letterSpacing: 3,
  },
  trialTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  trialSub: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  trialHighlight: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  ctaButton: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
  restoreText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    textDecorationLine: 'underline',
  },
});
