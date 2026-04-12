import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const STAR_LENGTH = 50;
const TRAVEL_DISTANCE = SCREEN_WIDTH * 0.7;
const ANGLE_DEG = 35;
const ANGLE_RAD = (ANGLE_DEG * Math.PI) / 180;

interface ShootingStarsProps {
  count?: number;
}

interface ShootingStarProps {
  index: number;
}

function ShootingStar({ index }: ShootingStarProps) {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);

  // Stagger each star by 1200ms, with a cycle of travel + pause
  const staggerDelay = index * 1200;
  const travelDuration = 700 + index * 100; // 700–900ms
  const pauseDuration = 2000;

  useEffect(() => {
    // Opacity: fade in → hold → fade out, then pause at 0
    opacity.value = withDelay(
      staggerDelay,
      withRepeat(
        withSequence(
          withTiming(0.8, { duration: 100, easing: Easing.out(Easing.ease) }),
          withTiming(0.7, { duration: travelDuration - 200 }),
          withTiming(0, { duration: 100, easing: Easing.in(Easing.ease) }),
          withTiming(0, { duration: pauseDuration }),
        ),
        -1,
        false,
      ),
    );

    // Movement: travel then reset
    progress.value = withDelay(
      staggerDelay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: travelDuration, easing: Easing.in(Easing.quad) }),
          withTiming(0, { duration: 0 }),
          withTiming(0, { duration: pauseDuration }),
        ),
        -1,
        false,
      ),
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Deterministic start positions based on index
  const startX = SCREEN_WIDTH * 0.3 + (index * SCREEN_WIDTH * 0.2);
  const startY = 40 + index * 60;

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: progress.value * TRAVEL_DISTANCE * Math.cos(ANGLE_RAD) },
      { translateY: progress.value * TRAVEL_DISTANCE * Math.sin(ANGLE_RAD) },
    ],
  }));

  return (
    <Animated.View
      testID={`shooting-star-${index}`}
      style={[
        styles.starContainer,
        {
          left: startX,
          top: startY,
          transform: [{ rotate: `${ANGLE_DEG}deg` }],
        },
        animatedStyle,
      ]}
    >
      <LinearGradient
        colors={['transparent', 'rgba(255,255,255,0.8)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.tail}
      />
    </Animated.View>
  );
}

export function ShootingStars({ count = 3 }: ShootingStarsProps) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <ShootingStar key={i} index={i} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  starContainer: {
    position: 'absolute',
    width: STAR_LENGTH,
    height: 2,
  },
  tail: {
    width: '100%',
    height: '100%',
    borderRadius: 1,
  },
});
