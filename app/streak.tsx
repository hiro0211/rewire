import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/useTheme';
import { useStreak } from '@/hooks/dashboard/useStreak';
import { getStreakTier } from '@/hooks/streak/useStreakTier';
import { SPACING } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { StreakNumber } from '@/components/streak/StreakNumber';
import { StreakSubText } from '@/components/streak/StreakSubText';
import { WeeklyTracker } from '@/components/streak/WeeklyTracker';
import { ParticleEffect } from '@/components/streak/ParticleEffect';
import { GlowOverlay } from '@/components/streak/GlowOverlay';
import { ConfettiEffect } from '@/components/streak/ConfettiEffect';
import { getCountUpDuration } from '@/constants/streakCelebration';

export default function StreakScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { gradients } = useTheme();
  const { streak, goal } = useStreak();

  const goalReached = streak >= goal;
  const tier = getStreakTier(streak, goalReached);
  const countUpDuration = getCountUpDuration(streak);

  const handleContinue = useCallback(() => {
    const hapticMap = {
      light: Haptics.ImpactFeedbackStyle.Light,
      medium: Haptics.ImpactFeedbackStyle.Medium,
      heavy: Haptics.ImpactFeedbackStyle.Heavy,
    } as const;
    Haptics.impactAsync(hapticMap[tier.hapticStyle]);
    router.replace('/(tabs)' as any);
  }, [tier.hapticStyle]);

  return (
    <LinearGradient
      colors={gradients.hero as unknown as [string, string, ...string[]]}
      style={styles.container}
    >
      {tier.showParticles && <ParticleEffect />}
      {tier.showGlow && <GlowOverlay />}
      {tier.showConfetti && <ConfettiEffect key={`${streak}-${goalReached}`} />}

      <View style={[styles.content, { paddingTop: insets.top + 60 }]}>
        <View style={styles.numberSection}>
          <StreakNumber streak={streak} />
          <StreakSubText text={tier.subText} delay={countUpDuration} />
        </View>

        <View style={styles.trackerSection}>
          <WeeklyTracker streak={streak} />
        </View>

        <View style={[styles.buttonSection, { paddingBottom: insets.bottom + SPACING.xl }]}>
          <Button
            title="Continue"
            onPress={handleContinue}
            variant="gradient"
            size="lg"
            style={styles.button}
          />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.screenPadding,
  },
  numberSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackerSection: {
    marginBottom: SPACING.xxxl,
  },
  buttonSection: {
    paddingHorizontal: SPACING.lg,
  },
  button: {
    width: '100%',
  },
});
