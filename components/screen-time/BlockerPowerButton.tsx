import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SPACING } from '@/constants/theme';

export const ACTIVE_COLOR = '#3DD68C';
export const INACTIVE_COLOR = '#FF3B3B';

interface BlockerPowerButtonProps {
  enabled: boolean;
  isBusy: boolean;
  onPress: () => void;
  testID?: string;
}

/**
 * ポルノブロックのオン/オフを切り替える円形パワーボタン（表示のみ）。
 * ON=緑・OFF=赤で状態を色分けし、処理中はスピナーを表示する。
 */
export function BlockerPowerButton({
  enabled,
  isBusy,
  onPress,
  testID = 'blocker-power-button',
}: BlockerPowerButtonProps) {
  const statusColor = enabled ? ACTIVE_COLOR : INACTIVE_COLOR;

  return (
    <TouchableOpacity
      testID={testID}
      style={[
        styles.powerButton,
        { backgroundColor: statusColor, shadowColor: statusColor },
      ]}
      onPress={onPress}
      disabled={isBusy}
      activeOpacity={0.8}
    >
      {isBusy ? (
        <ActivityIndicator color="#FFFFFF" size="large" />
      ) : (
        <Ionicons name="power" size={56} color="#FFFFFF" />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  powerButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.6,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    marginVertical: SPACING.lg,
    elevation: 8,
  },
});
