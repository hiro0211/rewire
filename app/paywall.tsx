import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { PaywallDefault } from '@/components/paywall/PaywallDefault';
// --- Discount/Trial paywalls disabled for Guideline 5.6 ---
// import { PaywallDiscount } from '@/components/paywall/PaywallDiscount';
// import { PaywallTrial } from '@/components/paywall/PaywallTrial';
// import { TrialBottomSheet } from '@/components/paywall/TrialBottomSheet';
import { PaywallErrorBoundary } from '@/components/paywall/PaywallErrorBoundary';
import { usePaywallOrchestration } from '@/hooks/paywall/usePaywallOrchestration';

export default function PaywallScreen() {
  const router = useRouter();
  const { source } = useLocalSearchParams<{ source?: string }>();
  const { colors } = useTheme();
  const { t } = useLocale();

  const {
    paywallState,
    setPaywallState,
    currentOffering,
    offeringType,
    showTrialSheet,
    trialOffering,
    discountRemainingSeconds,
    isFromOnboarding,
    handleDismiss,
    handleTrialSheetDismiss,
    handlePurchaseCompleted,
    handleRestoreCompleted,
    handleRetry,
  } = usePaywallOrchestration({ source });

  const renderPaywall = () => {
    if (paywallState === 'loading') {
      return (
        <View style={styles.fallback}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.fallbackText, { color: colors.textSecondary }]}>{t('common.loading')}</Text>
        </View>
      );
    }

    if (paywallState === 'unavailable') {
      return (
        <View style={styles.fallback}>
          <Text style={[styles.unavailableTitle, { color: colors.text }]}>{t('paywall.unavailableTitle')}</Text>
          <Text style={[styles.fallbackText, { color: colors.textSecondary }]}>
            {t('paywall.unavailableMessage')}
          </Text>
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={handleRetry}>
            <Text style={[styles.retryButtonText, { color: colors.text }]}>{t('common.retry')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (isFromOnboarding) {
                router.replace('/(tabs)');
              } else {
                router.dismiss();
              }
            }}
          >
            <Text style={[styles.backButtonText, { color: colors.textSecondary }]}>
              {isFromOnboarding ? t('paywall.tryLater') : t('common.back')}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    // --- Discount/Trial paywalls disabled for Guideline 5.6 ---
    // if (offeringType === 'discount') {
    //   return (
    //     <PaywallErrorBoundary onError={() => setPaywallState('unavailable')}>
    //       <PaywallDiscount
    //         offering={currentOffering}
    //         initialSeconds={discountRemainingSeconds}
    //         onDismiss={handleDismiss}
    //         onPurchaseCompleted={handlePurchaseCompleted}
    //         onRestoreCompleted={handleRestoreCompleted}
    //       />
    //       <TrialBottomSheet
    //         visible={showTrialSheet}
    //         offering={trialOffering ?? currentOffering}
    //         onDismiss={handleTrialSheetDismiss}
    //         onPurchaseCompleted={handlePurchaseCompleted}
    //         onRestoreCompleted={handleRestoreCompleted}
    //       />
    //     </PaywallErrorBoundary>
    //   );
    // }
    // if (offeringType === 'trial') {
    //   return (
    //     <PaywallErrorBoundary onError={() => setPaywallState('unavailable')}>
    //       <PaywallTrial
    //         offering={currentOffering}
    //         onDismiss={handleDismiss}
    //         onPurchaseCompleted={handlePurchaseCompleted}
    //         onRestoreCompleted={handleRestoreCompleted}
    //       />
    //     </PaywallErrorBoundary>
    //   );
    // }
    return (
      <PaywallErrorBoundary onError={() => setPaywallState('unavailable')}>
        <PaywallDefault
          offering={currentOffering}
          onDismiss={handleDismiss}
          onPurchaseCompleted={handlePurchaseCompleted}
          onRestoreCompleted={handleRestoreCompleted}
        />
      </PaywallErrorBoundary>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderPaywall()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  unavailableTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  fallbackText: {
    fontSize: FONT_SIZE.md,
    marginBottom: SPACING.lg,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  backButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.md,
  },
  backButtonText: {
    fontSize: FONT_SIZE.md,
  },
});
