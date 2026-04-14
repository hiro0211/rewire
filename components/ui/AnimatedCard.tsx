import React from 'react';
import Animated from 'react-native-reanimated';
import { GlassCard } from './GlassCard';
import { useEntranceAnimation } from '@/hooks/ui/useEntranceAnimation';
import type { ViewStyle } from 'react-native';

interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
  style?: ViewStyle;
  testID?: string;
}

export function AnimatedCard({
  children,
  delay = 0,
  style,
  testID,
}: AnimatedCardProps) {
  const { animatedStyle } = useEntranceAnimation({ delay });

  return (
    <Animated.View style={animatedStyle} testID={testID}>
      <GlassCard style={style}>{children}</GlassCard>
    </Animated.View>
  );
}
