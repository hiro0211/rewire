import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface ReflectionStepContainerProps {
  stepKey: number;
  children: React.ReactNode;
}

export function ReflectionStepContainer({ stepKey, children }: ReflectionStepContainerProps) {
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    opacity.value = 0;
    translateY.value = 8;
    opacity.value = withTiming(1, {
      duration: 250,
      easing: Easing.out(Easing.quad),
    });
    translateY.value = withTiming(0, {
      duration: 250,
      easing: Easing.out(Easing.quad),
    });
  }, [stepKey, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.inner, animatedStyle]}>{children}</Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  inner: {
    flex: 1,
  },
});
