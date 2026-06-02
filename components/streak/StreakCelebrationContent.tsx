import React from 'react';
import { View, StyleSheet } from 'react-native';

import { SPACING } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { StreakNumber } from '@/components/streak/StreakNumber';
import { StreakSubText } from '@/components/streak/StreakSubText';
import { WeeklyTracker } from '@/components/streak/WeeklyTracker';
import { ParticleEffect } from '@/components/streak/ParticleEffect';
import { GlowOverlay } from '@/components/streak/GlowOverlay';
import { ConfettiEffect } from '@/components/streak/ConfettiEffect';
import { getStreakTier } from '@/hooks/streak/useStreakTier';
import { getCountUpDuration } from '@/constants/streakCelebration';

interface StreakCelebrationContentProps {
  toStreak: number;
  fromStreak?: number;
  goalReached?: boolean;
  subText: string;
  continueTitle: string;
  onContinue: () => void;
  topPadding?: number;
  bottomPadding?: number;
  continueTestID?: string;
}

/**
 * ストリーク達成のフルスクリーン演出（表示専用）。
 * データ取得・ナビゲーションは持たず、モーダルと /streak 画面の双方から共有する。
 */
export function StreakCelebrationContent({
  toStreak,
  fromStreak = 0,
  goalReached = false,
  subText,
  continueTitle,
  onContinue,
  topPadding = SPACING.xxxl,
  bottomPadding = SPACING.xl,
  continueTestID,
}: StreakCelebrationContentProps) {
  const tier = getStreakTier(toStreak, goalReached);
  const countUpDuration = getCountUpDuration(toStreak);

  return (
    <>
      {tier.showParticles && <ParticleEffect />}
      {tier.showGlow && <GlowOverlay />}
      {tier.showConfetti && <ConfettiEffect key={`${toStreak}-${goalReached}`} />}

      <View style={[styles.content, { paddingTop: topPadding }]}>
        <View style={styles.numberSection}>
          <StreakNumber streak={toStreak} fromStreak={fromStreak} />
          <StreakSubText text={subText} delay={countUpDuration} />
        </View>

        <View style={styles.trackerSection}>
          <WeeklyTracker streak={toStreak} />
        </View>

        <View style={[styles.buttonSection, { paddingBottom: bottomPadding }]}>
          <Button
            testID={continueTestID}
            title={continueTitle}
            onPress={onContinue}
            variant="gradient"
            size="lg"
            style={styles.button}
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
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
