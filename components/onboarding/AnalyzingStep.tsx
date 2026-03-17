import React from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAnalyzingProgress, ANALYSIS_ITEMS } from '@/hooks/onboarding/useAnalyzingProgress';

interface AnalyzingStepProps {
  onComplete: () => void;
}

const RING_SIZE = 160;
const RING_STROKE = 8;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function AnalyzingStep({ onComplete }: AnalyzingStepProps) {
  const { progress, completedCount, itemFades, checkFades } = useAnalyzingProgress(onComplete);
  const { colors } = useTheme();

  const strokeDashoffset = RING_CIRCUMFERENCE * (1 - progress / 100);

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>分析中...</Text>

      <View testID="circular-progress-ring" style={styles.ringContainer}>
        <Svg width={RING_SIZE} height={RING_SIZE}>
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            stroke={colors.surfaceHighlight}
            strokeWidth={RING_STROKE}
            fill="none"
          />
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            stroke={colors.cyan}
            strokeWidth={RING_STROKE}
            fill="none"
            strokeDasharray={`${RING_CIRCUMFERENCE}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
          />
        </Svg>
        <Text testID="progress-percentage" style={[styles.percentText, { color: colors.cyan }]}>
          {Math.round(progress)}%
        </Text>
      </View>

      <View style={styles.checklist}>
        {ANALYSIS_ITEMS.map((item, index) => {
          const isCompleted = index < completedCount;
          const isActive = index === completedCount && index < ANALYSIS_ITEMS.length;

          return (
            <Animated.View
              key={item.text}
              style={[styles.checkItem, { opacity: itemFades[index] }]}
            >
              {isCompleted ? (
                <Animated.View style={{ opacity: checkFades[index] }}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                </Animated.View>
              ) : (
                <View style={[styles.pendingDot, { borderColor: colors.textSecondary }]}>
                  {isActive && <View style={[styles.activeDotInner, { backgroundColor: colors.cyan }]} />}
                </View>
              )}
              <Text
                style={[
                  styles.checkText,
                  { color: colors.textSecondary },
                  isCompleted && { color: colors.success },
                  isActive && { color: colors.text },
                ]}
              >
                {item.text}
                {isActive && !isCompleted ? '...' : ''}
              </Text>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    marginBottom: SPACING.xxl,
  },
  ringContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xxxl,
  },
  percentText: {
    position: 'absolute',
    fontSize: FONT_SIZE.xxxl,
    fontWeight: 'bold',
  },
  checklist: {
    width: '100%',
    gap: SPACING.lg,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  pendingDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  checkText: {
    fontSize: FONT_SIZE.md,
  },
});
