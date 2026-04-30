import React, { useEffect } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { StreakNumber } from '@/components/streak/StreakNumber';
import { ParticleEffect } from '@/components/streak/ParticleEffect';
import { ConfettiEffect } from '@/components/streak/ConfettiEffect';
import { GlowOverlay } from '@/components/streak/GlowOverlay';
import { StreakSubText } from '@/components/streak/StreakSubText';
import { getStreakTier } from '@/hooks/streak/useStreakTier';
import { FONT_SIZE, FONT_WEIGHT, SPACING, RADIUS } from '@/constants/theme';

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
  const { colors } = useTheme();
  const { t } = useLocale();
  const tier = getStreakTier(toStreak, goalReached);

  useEffect(() => {
    if (!visible) return;
    Haptics.notificationAsync(HAPTIC_MAP[tier.hapticStyle]).catch(() => {});
  }, [visible, tier.hapticStyle]);

  if (!visible) return null;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View testID="streak-count-up-modal" style={styles.backdrop}>
        {tier.showParticles && <ParticleEffect />}
        {tier.showGlow && <GlowOverlay />}
        {tier.showConfetti && <ConfettiEffect />}

        <View style={[styles.card, { backgroundColor: colors.background ?? '#0A0A0F' }]}>
          <StreakNumber streak={toStreak} fromStreak={fromStreak} />
          <StreakSubText text={t(tier.subText, { days: toStreak })} />

          <Pressable
            testID="streak-count-up-modal-dismiss"
            style={[styles.button, { borderColor: colors.cyan ?? '#00ffff' }]}
            onPress={onDismiss}
          >
            <Text style={[styles.buttonText, { color: colors.cyan ?? '#00ffff' }]}>
              {t('streak.celebrationDismiss')}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: 320,
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.md,
  },
  button: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.xxxl,
    paddingVertical: SPACING.md,
    borderRadius: 50,
    borderWidth: 1.5,
  },
  buttonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
  },
});
