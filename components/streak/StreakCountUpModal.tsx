import React, { useEffect } from 'react';
import { Modal, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { StreakCelebrationContent } from '@/components/streak/StreakCelebrationContent';
import { getStreakTier } from '@/hooks/streak/useStreakTier';
import { SPACING } from '@/constants/theme';

interface StreakCountUpModalProps {
  visible: boolean;
  fromStreak: number;
  toStreak: number;
  goalReached?: boolean;
  onDismiss: () => void;
}

const HAPTIC_MAP = {
  light: Haptics.NotificationFeedbackType.Success,
  medium: Haptics.NotificationFeedbackType.Success,
  heavy: Haptics.NotificationFeedbackType.Success,
} as const;

export function StreakCountUpModal({
  visible,
  fromStreak,
  toStreak,
  goalReached = false,
  onDismiss,
}: StreakCountUpModalProps) {
  const { gradients } = useTheme();
  const { t } = useLocale();
  const insets = useSafeAreaInsets();
  const tier = getStreakTier(toStreak, goalReached);

  useEffect(() => {
    if (!visible) return;
    Haptics.notificationAsync(HAPTIC_MAP[tier.hapticStyle]).catch(() => {});
  }, [visible, tier.hapticStyle]);

  if (!visible) return null;

  const subText = goalReached ? t('streak.goalReached') : t('streak.newStreak');

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onDismiss}>
      <LinearGradient
        testID="streak-count-up-modal"
        colors={gradients.hero as unknown as [string, string, ...string[]]}
        style={styles.container}
      >
        <StreakCelebrationContent
          toStreak={toStreak}
          fromStreak={fromStreak}
          goalReached={goalReached}
          subText={subText}
          continueTitle={t('common.continue')}
          onContinue={onDismiss}
          topPadding={insets.top + 60}
          bottomPadding={insets.bottom + SPACING.xl}
          continueTestID="streak-count-up-modal-dismiss"
        />
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
