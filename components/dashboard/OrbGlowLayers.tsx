import React, { useEffect, useId } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

interface OrbGlowLayersProps {
  size: number;
  glowColor: string;
  pulseDuration: number;
}

export function OrbGlowLayers({ size, glowColor, pulseDuration }: OrbGlowLayersProps) {
  const uniqueId = useId();
  const outerGradId = `outer-grad-${uniqueId}`;
  const innerGradId = `inner-grad-${uniqueId}`;
  const ringGradId = `ring-grad-${uniqueId}`;

  // Inner glow pulse
  const innerOpacity = useSharedValue(0.4);
  useEffect(() => {
    innerOpacity.value = withRepeat(
      withTiming(0.8, { duration: pulseDuration, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [pulseDuration]);

  // Outer halo pulse (slower)
  const outerOpacity = useSharedValue(0.15);
  useEffect(() => {
    outerOpacity.value = withRepeat(
      withTiming(0.35, {
        duration: pulseDuration * 1.3,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );
  }, [pulseDuration]);

  // Pulse ring: scale 1.0→1.8 + opacity 0.6→0.0
  const ringScale = useSharedValue(1.0);
  const ringOpacity = useSharedValue(0.6);
  useEffect(() => {
    const dur = pulseDuration * 1.5;
    ringScale.value = withRepeat(
      withDelay(300, withTiming(1.8, { duration: dur, easing: Easing.out(Easing.quad) })),
      -1,
      false,
    );
    ringOpacity.value = withRepeat(
      withDelay(300, withTiming(0.0, { duration: dur, easing: Easing.out(Easing.quad) })),
      -1,
      false,
    );
  }, [pulseDuration]);

  const innerSize = size * 1.2;
  const outerSize = size * 1.6;
  const ringSize = size * 1.1;

  const innerStyle = useAnimatedStyle(() => ({ opacity: innerOpacity.value }));
  const outerStyle = useAnimatedStyle(() => ({ opacity: outerOpacity.value }));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
    transform: [{ scale: ringScale.value }],
  }));

  return (
    <>
      {/* Outer halo */}
      <Animated.View
        testID="orb-glow-outer"
        pointerEvents="none"
        style={[
          styles.layer,
          {
            width: outerSize,
            height: outerSize,
            left: -(outerSize - size) / 2,
            top: -(outerSize - size) / 2,
          },
          outerStyle,
        ]}
      >
        <Svg width="100%" height="100%">
          <Defs>
            <RadialGradient id={outerGradId} cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0" stopColor={glowColor} stopOpacity="1" />
              <Stop offset="1" stopColor={glowColor} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx="50%" cy="50%" r="50%" fill={`url(#${outerGradId})`} />
        </Svg>
      </Animated.View>
      {/* Inner glow */}
      <Animated.View
        testID="orb-glow-inner"
        pointerEvents="none"
        style={[
          styles.layer,
          {
            width: innerSize,
            height: innerSize,
            left: -(innerSize - size) / 2,
            top: -(innerSize - size) / 2,
          },
          innerStyle,
        ]}
      >
        <Svg width="100%" height="100%">
          <Defs>
            <RadialGradient id={innerGradId} cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0" stopColor={glowColor} stopOpacity="1" />
              <Stop offset="1" stopColor={glowColor} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx="50%" cy="50%" r="50%" fill={`url(#${innerGradId})`} />
        </Svg>
      </Animated.View>
      {/* Pulse ring */}
      <Animated.View
        testID="orb-pulse-ring"
        pointerEvents="none"
        style={[
          styles.layer,
          {
            width: ringSize,
            height: ringSize,
            left: -(ringSize - size) / 2,
            top: -(ringSize - size) / 2,
          },
          ringStyle,
        ]}
      >
        <Svg width="100%" height="100%">
          <Defs>
            <RadialGradient id={ringGradId} cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0.75" stopColor={glowColor} stopOpacity="0" />
              <Stop offset="0.9" stopColor={glowColor} stopOpacity="1" />
              <Stop offset="1" stopColor={glowColor} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx="50%" cy="50%" r="50%" fill={`url(#${ringGradId})`} />
        </Svg>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
  },
});
