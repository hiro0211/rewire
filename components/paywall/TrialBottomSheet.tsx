import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { formatPrice } from './paywallUtils';
import { SubscriptionTerms } from './SubscriptionTerms';
import { isExpoGo } from '@/lib/nativeGuard';

let Purchases: any = null;
if (!isExpoGo) {
  try {
    Purchases = require('react-native-purchases').default;
  } catch {}
}

interface TrialBottomSheetProps {
  visible: boolean;
  offering: any;
  onDismiss: () => void;
  onPurchaseCompleted: () => void;
  onRestoreCompleted: () => void;
}

export function TrialBottomSheet({
  visible,
  offering,
  onDismiss,
  onPurchaseCompleted,
  onRestoreCompleted,
}: TrialBottomSheetProps) {
  const [purchasing, setPurchasing] = useState(false);

  const annualPackage = offering?.annual ?? offering?.availablePackages?.[0];
  const annualPrice = annualPackage?.product?.price ?? 2500;
  const currencyCode = annualPackage?.product?.currencyCode ?? 'JPY';

  const handlePurchase = async () => {
    if (!Purchases || purchasing) return;
    if (!annualPackage) {
      Alert.alert('エラー', 'プランの取得に失敗しました。再度お試しください。');
      return;
    }
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
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <TouchableOpacity
        testID="bottom-sheet-overlay"
        style={styles.overlay}
        activeOpacity={1}
        onPress={onDismiss}
      >
        <TouchableOpacity activeOpacity={1} style={styles.sheet}>
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Title */}
          <Text style={styles.title}>3日間無料でお試し</Text>

          {/* Price info */}
          <Text style={styles.priceText}>
            3日間無料、その後 {formatPrice(annualPrice, currencyCode)}/年
          </Text>

          {/* Highlight */}
          <Text style={styles.highlight}>今すぐ支払いなし</Text>

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

          {/* Close */}
          <Button
            title="閉じる"
            onPress={onDismiss}
            variant="secondary"
            size="lg"
            style={styles.closeButton}
          />

          {/* Legal */}
          <SubscriptionTerms trialText="無料トライアル終了後、サブスクリプション料金が自動で課金されます。" />

          {/* Restore */}
          <TouchableOpacity onPress={handleRestore} disabled={purchasing}>
            <Text style={styles.restoreText}>購入の復元</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxxl,
    alignItems: 'center',
    minHeight: '55%',
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  priceText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  highlight: {
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
    marginTop: SPACING.sm,
    textDecorationLine: 'underline',
  },
  closeButton: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
});
