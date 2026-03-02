import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface AnalyzingStepProps {
  onComplete: () => void;
}

const ANALYSIS_ITEMS = [
  { text: '回答データを集計', duration: 2000 },
  { text: '習慣パターンを分析', duration: 2000 },
  { text: '影響度を算出', duration: 1500 },
  { text: '結果を生成中', duration: 1500 },
];

const TOTAL_DURATION = ANALYSIS_ITEMS.reduce((sum, item) => sum + item.duration, 0);
const RING_SIZE = 160;
const RING_STROKE = 8;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function AnalyzingStep({ onComplete }: AnalyzingStepProps) {
  const [completedCount, setCompletedCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const itemFades = useRef(ANALYSIS_ITEMS.map(() => new Animated.Value(0))).current;
  const checkFades = useRef(ANALYSIS_ITEMS.map(() => new Animated.Value(0))).current;
  const { colors } = useTheme();

  const strokeDashoffset = RING_CIRCUMFERENCE * (1 - progress / 100);

  useEffect(() => {
    // Progress counter (0 → 100)
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + (100 / (TOTAL_DURATION / 70));
        if (next >= 100) {
          clearInterval(interval);
          return 100;
        }
        return next;
      });
    }, 70);

    // Show first item immediately
    Animated.timing(itemFades[0], {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Schedule sequential item completions
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    let elapsed = 0;

    ANALYSIS_ITEMS.forEach((item, index) => {
      if (index > 0) {
        const showTimeout = setTimeout(() => {
          Animated.timing(itemFades[index], {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }, elapsed);
        timeouts.push(showTimeout);
      }

      elapsed += item.duration;

      const completeTimeout = setTimeout(() => {
        setCompletedCount(index + 1);

        Animated.timing(checkFades[index], {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();

        if (index < 2) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else if (index === 2) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }, elapsed);
      timeouts.push(completeTimeout);
    });

    const advanceTimeout = setTimeout(() => {
      onComplete();
    }, TOTAL_DURATION + 500);
    timeouts.push(advanceTimeout);

    return () => {
      clearInterval(interval);
      timeouts.forEach(clearTimeout);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>分析中...</Text>

      {/* Circular Progress Ring */}
      <View testID="circular-progress-ring" style={styles.ringContainer}>
        <Svg width={RING_SIZE} height={RING_SIZE}>
          {/* Background ring */}
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            stroke={colors.surfaceHighlight}
            strokeWidth={RING_STROKE}
            fill="none"
          />
          {/* Progress ring */}
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

      {/* Checklist */}
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
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={colors.success}
                  />
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
