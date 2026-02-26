import React, { useState, useEffect, useCallback, Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';
import { useUserStore } from '@/stores/userStore';
import { isExpoGo } from '@/lib/nativeGuard';
import { subscriptionClient } from '@/lib/subscription/subscriptionClient';
import { analyticsClient } from '@/lib/tracking/analyticsClient';

class PaywallErrorBoundary extends Component<
  { children: React.ReactNode; onError: () => void },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error) {
    console.error('[PaywallErrorBoundary]', error);
    this.props.onError();
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

let RevenueCatUI: any = null;
let Purchases: any = null;
if (!isExpoGo) {
  try {
    RevenueCatUI = require('react-native-purchases-ui').default;
    Purchases = require('react-native-purchases').default;
  } catch {
    // Native module not available
  }
}

export default function PaywallScreen() {
  const router = useRouter();
  const { source } = useLocalSearchParams<{ source?: string }>();
  const { updateUser } = useUserStore();
  const isFromOnboarding = source === 'onboarding';

  const [paywallState, setPaywallState] = useState<'loading' | 'ready' | 'unavailable'>('loading');
  const [currentOffering, setCurrentOffering] = useState<any>(null);
  const [offeringType, setOfferingType] = useState<'default' | 'discount'>('default');
  const [paywallKey, setPaywallKey] = useState(0);

  useEffect(() => {
    analyticsClient.logEvent('paywall_viewed', { source: source || 'unknown', offering: offeringType });
  }, [offeringType]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!RevenueCatUI || !Purchases || !subscriptionClient.isReady()) {
          if (mounted) setPaywallState('unavailable');
          return;
        }
        const offerings = await Purchases.getOfferings();
        if (!mounted) return;
        if (!offerings) {
          setPaywallState('unavailable');
          return;
        }

        const targetOffering = offeringType === 'discount'
          ? (offerings.all?.['discount'] ?? offerings.current)
          : offerings.current;

        if (targetOffering) {
          setCurrentOffering(targetOffering);
          setPaywallState('ready');
        } else {
          setPaywallState('unavailable');
        }
      } catch {
        if (mounted) setPaywallState('unavailable');
      }
    })();
    return () => { mounted = false; };
  }, [offeringType, paywallKey]);

  const handleDismiss = useCallback(() => {
    if (isFromOnboarding) {
      if (offeringType === 'default') {
        // First dismiss → switch to discount offering with free trial
        setOfferingType('discount');
        setPaywallState('loading');
        setPaywallKey((k) => k + 1);
      }
      // Second+ dismiss on discount → do nothing (hard paywall)
    } else {
      router.dismiss();
    }
  }, [isFromOnboarding, offeringType, router]);

  const handlePurchaseCompleted = useCallback(async () => {
    analyticsClient.logEvent('pro_purchase_completed', { offering: offeringType });
    await updateUser({ isPro: true });
    router.replace('/(tabs)');
  }, [offeringType, updateUser, router]);

  const handleRestoreCompleted = useCallback(async () => {
    await updateUser({ isPro: true });
    router.replace('/(tabs)');
  }, [updateUser, router]);

  const handleRetry = useCallback(() => {
    setPaywallState('loading');
    setPaywallKey((k) => k + 1);
  }, []);

  const renderPaywall = () => {
    if (paywallState === 'loading') {
      return (
        <View style={styles.fallback}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.fallbackText}>読み込み中...</Text>
        </View>
      );
    }

    if (paywallState === 'unavailable' || !RevenueCatUI) {
      return (
        <View style={styles.fallback}>
          <Text style={styles.unavailableTitle}>現在ご利用いただけません</Text>
          <Text style={styles.fallbackText}>
            サブスクリプションサービスに接続できませんでした。{'\n'}
            しばらくしてからもう一度お試しください。
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>再試行</Text>
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
            <Text style={styles.backButtonText}>
              {isFromOnboarding ? 'あとで試す' : '戻る'}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <PaywallErrorBoundary onError={() => setPaywallState('unavailable')}>
        <RevenueCatUI.Paywall
          key={paywallKey}
          offering={currentOffering}
          onDismiss={handleDismiss}
          onPurchaseCompleted={handlePurchaseCompleted}
          onRestoreCompleted={handleRestoreCompleted}
        />
      </PaywallErrorBoundary>
    );
  };

  return (
    <View style={styles.container}>
      {renderPaywall()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  unavailableTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  fallbackText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
    marginBottom: SPACING.lg,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  retryButtonText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  backButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.md,
  },
  backButtonText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
  },
});
