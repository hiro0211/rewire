import React, { useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '@/components/ui/GlassCard';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';

interface BrainRewiringBarProps {
  progress: number; // 0-1
}

export function BrainRewiringBar({ progress }: BrainRewiringBarProps) {
  const { colors, gradients } = useTheme();
  const { t } = useLocale();

  const clamped = Math.min(Math.max(progress, 0), 1);
  const percent = Math.round(clamped * 100);

  const widthAnim = useSharedValue(0);

  useEffect(() => {
    widthAnim.value = withTiming(clamped, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [clamped]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${widthAnim.value * 100}%` as `${number}%`,
  }));

  return (
    <GlassCard testID="brain-rewiring-bar">
      <View style={styles.header}>
        <Text style={[styles.label, { color: colors.text }]}>
          {t('dashboard.goalAchievement')}
        </Text>
        <Text style={[styles.percent, { color: colors.textSecondary }]}>
          {percent}%
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.surfaceHighlight }]}>
        <Animated.View style={[styles.fill, barStyle]}>
          <LinearGradient
            colors={[...gradients.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  percent: {
    fontSize: FONT_SIZE.sm,
  },
  track: {
    height: 8,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
});
