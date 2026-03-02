import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface AchievementSummaryCircleProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

export function AchievementSummaryCircle({
  percentage,
  size = 80,
  strokeWidth = 6,
}: AchievementSummaryCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage / 100);
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.cyan}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.labelContainer}>
        <Text style={[styles.percentage, { color: colors.cyan }]}>{percentage}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentage: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },
});
