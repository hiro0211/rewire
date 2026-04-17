import type { ChapterId } from '@/constants/badges/BadgeChapter';
import { getOrbConfig } from '@/constants/orbConfig';
import { useOrbBreathing } from '@/hooks/dashboard/useOrbBreathing';
import { useOrbTapAnimation } from '@/hooks/dashboard/useOrbTapAnimation';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useDerivedValue,
} from 'react-native-reanimated';
import { CoreOrbRenderer } from './CoreOrbRenderer';
import { OrbGlowLayers } from './OrbGlowLayers';
import { OrbParticles } from './OrbParticles';
import { OrbScatteredStars } from './OrbScatteredStars';
import { OrbSoftAura } from './OrbSoftAura';
import { OrbTapRipple } from './OrbTapRipple';

interface AnimatedOrbProps {
  chapterId: ChapterId;
  size?: number;
  onPress?: () => void;
  onLongPress?: () => void;
}

export function AnimatedOrb({ chapterId, size = 200, onPress, onLongPress }: AnimatedOrbProps) {
  const config = getOrbConfig(chapterId);

  const { time, breathingScale } = useOrbBreathing(config);
  const { tapScale, glowIntensity, rippleTrigger, handlePressIn, handlePressOut } =
    useOrbTapAnimation();

  // Compose breathing + tap scale
  const finalScale = useDerivedValue(() => breathingScale.value * tapScale.value);
  const pulseStyle = useDerivedValue(() => ({
    transform: [{ scale: finalScale.value }],
  }));

  const [c1] = config.colors;

  // Container expanded to accommodate glow + particles (size * 2.0)
  const containerSize = size * 2.0;
  const offset = (containerSize - size) / 2;

  return (
    <Pressable
      testID="orb-pressable"
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      delayPressIn={50}
    >
      <View
        testID="animated-orb"
        style={[styles.container, { width: containerSize, height: containerSize }]}
      >
        {/* Large soft halo behind the orb */}
        <View
          pointerEvents="none"
          style={[styles.overlay, { width: containerSize, height: containerSize }]}
        >
          <OrbSoftAura size={size} glowColor={config.glowColor} />
        </View>

        {/* Scattered star particles */}
        <View
          pointerEvents="none"
          style={[styles.overlay, { width: containerSize, height: containerSize }]}
        >
          <OrbScatteredStars size={size} />
        </View>

        {/* Multi-layer glow + pulse ring behind orb */}
        <View
          pointerEvents="none"
          style={[styles.overlay, { width: size, height: size, left: offset, top: offset }]}
        >
          <OrbGlowLayers
            size={size}
            glowColor={config.glowColor}
            pulseDuration={config.pulseDuration}
          />
        </View>

        {/* Orbiting particles */}
        <View
          pointerEvents="none"
          style={[styles.overlay, { width: size, height: size, left: offset, top: offset }]}
        >
          <OrbParticles size={size} count={config.particleCount} tintColor={c1} />
        </View>

        {/* Core orb with breathing + tap scale */}
        <Animated.View
          style={[
            { width: size, height: size, position: 'absolute', left: offset, top: offset },
            pulseStyle,
          ]}
        >
          <CoreOrbRenderer
            colors={config.colors}
            size={size}
            time={time}
            glowBoost={glowIntensity}
            testID="orb-canvas"
          />
        </Animated.View>

        {/* Tap ripple ring */}
        <View
          pointerEvents="none"
          style={[
            styles.overlay,
            styles.centered,
            { width: containerSize, height: containerSize },
          ]}
        >
          <OrbTapRipple size={size} color={c1} trigger={rippleTrigger} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    position: 'absolute',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
