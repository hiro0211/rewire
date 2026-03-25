import { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const SPRING_CONFIG = { damping: 15, stiffness: 300 };

export function usePressAnimation() {
  const scale = useSharedValue(1);

  const onPressIn = () => {
    scale.value = withSpring(0.96, SPRING_CONFIG);
  };

  const onPressOut = () => {
    scale.value = withSpring(1.0, SPRING_CONFIG);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { onPressIn, onPressOut, animatedStyle };
}
