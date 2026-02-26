import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';
import { useUserStore } from '@/stores/userStore';
import { isExpoGo } from '@/lib/nativeGuard';
import { subscriptionClient } from '@/lib/subscription/subscriptionClient';
import { analyticsClient } from '@/lib/tracking/analyticsClient';

let RevenueCatUI: any = null;
if (!isExpoGo) {
  try {
    RevenueCatUI = require('react-native-purchases-ui').default;
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

  useEffect(() => {
    analyticsClient.logEvent('paywall_viewed', { source: source || 'unknown' });
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!RevenueCatUI || !subscriptionClient.isReady()) {
          if (mounted) setPaywallState('unavailable');
          return;
        }
        const offerings = await subscriptionClient.getOfferings();
        if (mounted) {
          setPaywallState(offerings.length > 0 ? 'ready' : 'unavailable');
        }
      } catch {
        if (mounted) setPaywallState('unavailable');
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleDismiss = () => {
    if (isFromOnboarding) {
      router.replace('/(tabs)');
    } else {
      router.back();
    }
  };

  const handlePurchaseCompleted = async () => {
    analyticsClient.logEvent('pro_purchase_completed');
    await updateUser({ isPro: true });
    router.replace('/(tabs)');
  };

  const handleRestoreCompleted = async () => {
    await updateUser({ isPro: true });
    router.replace('/(tabs)');
  };

  const handleContinueFree = () => {
    router.replace('/(tabs)');
  };

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
          <TouchableOpacity style={styles.fallbackButton} onPress={handleDismiss}>
            <Text style={styles.fallbackButtonText}>戻る</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <RevenueCatUI.Paywall
        onDismiss={handleDismiss}
        onPurchaseCompleted={handlePurchaseCompleted}
        onRestoreCompleted={handleRestoreCompleted}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.paywallContainer}>
        {renderPaywall()}
      </View>

      {isFromOnboarding && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.freeButton}
            onPress={handleContinueFree}
            activeOpacity={0.7}
          >
            <Text style={styles.freeText}>無料で続ける</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  paywallContainer: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING.xxxl,
    backgroundColor: COLORS.background,
  },
  freeButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  freeText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
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
  fallbackButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  fallbackButtonText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
});
