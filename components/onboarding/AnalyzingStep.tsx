import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';

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

export function AnalyzingStep({ onComplete }: AnalyzingStepProps) {
  const [completedCount, setCompletedCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const itemFades = useRef(ANALYSIS_ITEMS.map(() => new Animated.Value(0))).current;
  const checkFades = useRef(ANALYSIS_ITEMS.map(() => new Animated.Value(0))).current;

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
      // Show next item when current starts (except first)
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

      // Complete current item
      const completeTimeout = setTimeout(() => {
        setCompletedCount(index + 1);

        // Fade in checkmark
        Animated.timing(checkFades[index], {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();

        // Haptic feedback with crescendo pattern
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

    // Auto-advance after completion + brief pause
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
      <Text style={styles.title}>分析中...</Text>

      <Text style={styles.percentText}>{Math.round(progress)}%</Text>

      <View style={styles.progressBarWrapper}>
        <ProgressBar progress={progress / 100} height={8} />
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
                    color={COLORS.success}
                  />
                </Animated.View>
              ) : (
                <View style={styles.pendingDot}>
                  {isActive && <View style={styles.activeDotInner} />}
                </View>
              )}
              <Text
                style={[
                  styles.checkText,
                  isCompleted && styles.checkTextCompleted,
                  isActive && styles.checkTextActive,
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
    color: COLORS.text,
    marginBottom: SPACING.xxl,
  },
  percentText: {
    fontSize: FONT_SIZE.display,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.lg,
  },
  progressBarWrapper: {
    width: '100%',
    marginBottom: SPACING.xxxl,
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
    borderColor: COLORS.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  checkText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  checkTextCompleted: {
    color: COLORS.success,
  },
  checkTextActive: {
    color: COLORS.text,
  },
});
