import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const CONFETTI_COUNT = 20;

const CONFETTI_COLORS = [
  '#8B5CF6', '#6D28D9', '#3DD68C', '#00D4FF',
  '#F0A030', '#EF4444', '#C8A84E', '#E8E8ED',
];

interface ConfettiPieceProps {
  index: number;
}

function ConfettiPiece({ index }: ConfettiPieceProps) {
  const translateY = useSharedValue(-20);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);

  const startX = Math.random() * width;
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const pieceWidth = 6 + Math.random() * 6;
  const pieceHeight = 4 + Math.random() * 8;
  const delay = index * 100 + Math.random() * 500;

  useEffect(() => {
    opacity.value = withDelay(delay, withSequence(
      withTiming(1, { duration: 200 }),
      withDelay(2500, withTiming(0, { duration: 800 })),
    ));
    translateY.value = withDelay(delay,
      withTiming(height + 50, { duration: 3500, easing: Easing.in(Easing.quad) }),
    );
    translateX.value = withDelay(delay, withRepeat(
      withTiming(Math.random() * 60 - 30, { duration: 500 }),
      -1,
      true,
    ));
    rotate.value = withDelay(delay, withRepeat(
      withTiming(360, { duration: 1000 + Math.random() * 1000 }),
      -1,
      false,
    ));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.confetti,
        {
          left: startX,
          width: pieceWidth,
          height: pieceHeight,
          backgroundColor: color,
          borderRadius: pieceWidth > 8 ? 2 : 1,
        },
        animatedStyle,
      ]}
    />
  );
}

export function ConfettiEffect() {
  return (
    <>
      {Array.from({ length: CONFETTI_COUNT }, (_, i) => (
        <ConfettiPiece key={i} index={i} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  confetti: {
    position: 'absolute',
  },
});
