import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import RevenueCatUI from 'react-native-purchases-ui';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';
import { useUserStore } from '@/stores/userStore';

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
        <RevenueCatUI.Paywall
          onDismiss={handleDismiss}
          onPurchaseCompleted={handlePurchaseCompleted}
          onRestoreCompleted={handleRestoreCompleted}
        />
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
});
