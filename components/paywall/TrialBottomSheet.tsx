import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { formatPrice } from './paywallUtils';
import { PaywallFooter } from './PaywallFooter';
import { usePurchase } from '@/hooks/paywall/usePurchase';
import { extractOfferingPackages } from '@/hooks/paywall/useOfferingPackages';

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
  const { colors } = useTheme();

  const { annualPackage, annualPrice, currencyCode } = extractOfferingPackages(offering);

  const { purchasing, handlePurchase, handleRestore } = usePurchase({
    package: annualPackage,
    onPurchaseCompleted,
    onRestoreCompleted,
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <TouchableOpacity
        testID="bottom-sheet-overlay"
        style={[styles.overlay, { backgroundColor: colors.overlay }]}
        activeOpacity={1}
        onPress={onDismiss}
      >
        <TouchableOpacity activeOpacity={1} style={[styles.sheet, { backgroundColor: colors.surface }]}>
          {/* Handle bar */}
          <View style={[styles.handleBar, { backgroundColor: colors.textSecondary }]} />

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>3日間無料でお試し</Text>

          {/* Price info */}
          <Text style={[styles.priceText, { color: colors.textSecondary }]}>
            3日間無料、その後 {formatPrice(annualPrice, currencyCode)}/年
          </Text>

          {/* Highlight */}
          <Text style={[styles.highlight, { color: colors.text }]}>今すぐ支払いなし</Text>

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

          <PaywallFooter
            onRestore={handleRestore}
            purchasing={purchasing}
            trialText="無料トライアル終了後、サブスクリプション料金が自動で課金されます。"
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
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
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  priceText: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  highlight: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  ctaButton: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
  closeButton: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
});
