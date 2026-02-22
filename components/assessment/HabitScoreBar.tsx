import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '@/components/Themed';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';

interface HabitScoreBarProps {
  score: number;
  maxScore: number;
  animated?: boolean;
}

export function HabitScoreBar({ score, maxScore, animated = false }: HabitScoreBarProps) {
  const percentage = Math.min((score / maxScore) * 100, 100);
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: percentage,
        duration: 800,
        useNativeDriver: false,
      }).start();
    } else {
      animatedValue.setValue(percentage);
    }
  }, [percentage, animated, animatedValue]);

  const markerLeft = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.barContainer}>
        <LinearGradient
          colors={['#3DD68C', '#F0A030', '#EF8C30', '#EF4444']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
        <Animated.View style={[styles.markerContainer, { left: markerLeft }]}>
          <View style={styles.marker} />
        </Animated.View>
      </View>

      <View style={styles.labels}>
        <Text style={styles.label}>影響 小</Text>
        <Text style={styles.label}>影響 中</Text>
        <Text style={styles.label}>影響 大</Text>
        <Text style={styles.label}>深刻</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  barContainer: {
    position: 'relative',
    marginBottom: SPACING.sm,
  },
  gradient: {
    height: 12,
    borderRadius: RADIUS.full,
  },
  markerContainer: {
    position: 'absolute',
    top: 14,
    marginLeft: -6,
  },
  marker: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: COLORS.text,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  label: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
});
