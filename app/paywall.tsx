import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';
import { useUserStore } from '@/stores/userStore';
import { isExpoGo } from '@/lib/nativeGuard';

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

  const handleDismiss = () => {
    if (isFromOnboarding) {
      router.replace('/(tabs)');
    } else {
      router.back();
    }
  };

  const handlePurchaseCompleted = async () => {
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

  return (
    <View style={styles.container}>
      <View style={styles.paywallContainer}>
        {RevenueCatUI ? (
          <RevenueCatUI.Paywall
            onDismiss={handleDismiss}
            onPurchaseCompleted={handlePurchaseCompleted}
            onRestoreCompleted={handleRestoreCompleted}
          />
        ) : (
          <View style={styles.fallback}>
            <Text style={styles.fallbackText}>Paywall (開発ビルドで表示されます)</Text>
            <TouchableOpacity style={styles.fallbackButton} onPress={handleDismiss}>
              <Text style={styles.fallbackButtonText}>閉じる</Text>
            </TouchableOpacity>
          </View>
        )}
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
  },
  fallbackText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
    marginBottom: SPACING.lg,
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
