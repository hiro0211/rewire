import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/useTheme';
import { useStreak } from '@/hooks/dashboard/useStreak';
import { getStreakTier } from '@/hooks/streak/useStreakTier';
import { SPACING } from '@/constants/theme';
import { StreakCelebrationContent } from '@/components/streak/StreakCelebrationContent';
import { ROUTES } from '@/lib/routing/routes';
import { t } from '@/locales/i18n';

export default function StreakScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { gradients } = useTheme();
  const { streak, goal } = useStreak();

  const goalReached = streak >= goal;
  const tier = getStreakTier(streak, goalReached);
  const subText = goalReached
    ? t('streak.goalReached')
    : t('streak.newStreak');

  const handleContinue = useCallback(() => {
    const hapticMap = {
      light: Haptics.ImpactFeedbackStyle.Light,
      medium: Haptics.ImpactFeedbackStyle.Medium,
      heavy: Haptics.ImpactFeedbackStyle.Heavy,
    } as const;
    Haptics.impactAsync(hapticMap[tier.hapticStyle]);
    router.replace(ROUTES.tabs);
  }, [tier.hapticStyle]);

  return (
    <LinearGradient
      colors={gradients.hero as unknown as [string, string, ...string[]]}
      style={styles.container}
    >
      <StreakCelebrationContent
        toStreak={streak}
        goalReached={goalReached}
        subText={subText}
        continueTitle={t('common.continue')}
        onContinue={handleContinue}
        topPadding={insets.top + 60}
        bottomPadding={insets.bottom + SPACING.xl}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
