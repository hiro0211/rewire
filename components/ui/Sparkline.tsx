import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Polyline, Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface SparklineProps {
  data: number[];
  color: string;
  width: number;
  height: number;
}

function normalize(values: number[]): number[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  if (range === 0) return values.map(() => 0.5);
  return values.map((v) => (v - min) / range);
}

function buildPoints(data: number[], width: number, height: number): string {
  if (data.length === 0) return '';
  const normalized = normalize(data);
  const stepX = width / Math.max(data.length - 1, 1);
  const padY = 4;
  return normalized
    .map((v, i) => {
      const x = i * stepX;
      const y = padY + (1 - v) * (height - padY * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

const AnimatedPolyline = Animated.createAnimatedComponent(Polyline);

export function Sparkline({ data, color, width, height }: SparklineProps) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) });
  }, [data]);

  const animatedProps = useAnimatedProps(() => ({ opacity: opacity.value }));

  if (data.length < 2) return <View style={{ width, height }} />;

  const points = buildPoints(data, width, height);
  const normalized = normalize(data);
  const lastX = (data.length - 1) * (width / Math.max(data.length - 1, 1));
  const padY = 4;
  const lastY = padY + (1 - normalized[normalized.length - 1]) * (height - padY * 2);

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <AnimatedPolyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          animatedProps={animatedProps}
        />
        <Circle cx={lastX} cy={lastY} r={3} fill={color} opacity={0.9} />
      </Svg>
    </View>
  );
}
