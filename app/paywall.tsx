import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { PaywallCosmicJourney } from '@/components/paywall/PaywallCosmicJourney';
import { PaywallDefault } from '@/components/paywall/PaywallDefault';
// --- Discount/Trial paywalls disabled for Guideline 5.6 ---
// import { PaywallDiscount } from '@/components/paywall/PaywallDiscount';
// import { PaywallTrial } from '@/components/paywall/PaywallTrial';
// import { TrialBottomSheet } from '@/components/paywall/TrialBottomSheet';
import { PaywallErrorBoundary } from '@/components/paywall/PaywallErrorBoundary';
import { PaywallLoadingState } from '@/components/paywall/PaywallLoadingState';
import { PaywallUnavailableState } from '@/components/paywall/PaywallUnavailableState';
import { usePaywallOrchestration } from '@/hooks/paywall/usePaywallOrchestration';

export default function PaywallScreen() {
  const router = useRouter();
  // debugVariant は設定画面のデバッグメニューからのみ渡る。
  // DEBUG_MENU_ENABLED=false のリリースビルドでは無視される（usePaywallOrchestration 側で二重ゲート）
  const { source, debugVariant } = useLocalSearchParams<{
    source?: string;
    debugVariant?: string;
  }>();
  const { colors } = useTheme();

  const {
    paywallState,
    setPaywallState,
    currentOffering,
    offeringType,
    variant,
    isVariantResolved,
    showTrialSheet,
    trialOffering,
    discountRemainingSeconds,
    isFromOnboarding,
    handleDismiss,
    handleTrialSheetDismiss,
    handlePurchaseCompleted,
    handleRestoreCompleted,
    handleRetry,
  } = usePaywallOrchestration({ source, debugVariant });

  // オンボーディング中は課金画面がスタックの起点なので、dismiss ではなくタブへ置き換える
  const handleUnavailableBack = () => {
    if (isFromOnboarding) {
      router.replace('/(tabs)');
    } else {
      router.dismiss();
    }
  };

  const renderPaywall = () => {
    // ⚠️ unavailable を最初に見る。offerings の失敗は A/B と無関係なので、
    //    バリアント確定を待つ分岐より後ろに置くと、未ハイドレートのユーザーに
    //    フォールバックUIではなく永久スピナーを見せることになる。
    if (paywallState === 'unavailable') {
      return (
        <PaywallUnavailableState
          onRetry={handleRetry}
          onBack={handleUnavailableBack}
          isFromOnboarding={isFromOnboarding}
        />
      );
    }

    // user.id が復元されるまでバリアントは確定しない。先に default を出して
    // あとで A案に差し替えると、実験群が一瞬だけ対照群の画面を見ることになる。
    // loadUser() は失敗時も hasHydrated を立てるので永久ロードにはならない。
    if (paywallState === 'loading' || !isVariantResolved) {
      return <PaywallLoadingState />;
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
        {variant === 'cosmicJourney' ? (
          <PaywallCosmicJourney
            offering={currentOffering}
            onDismiss={handleDismiss}
            onPurchaseCompleted={handlePurchaseCompleted}
            onRestoreCompleted={handleRestoreCompleted}
          />
        ) : (
          <PaywallDefault
            offering={currentOffering}
            onDismiss={handleDismiss}
            onPurchaseCompleted={handlePurchaseCompleted}
            onRestoreCompleted={handleRestoreCompleted}
          />
        )}
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
});
