import { AURORA_SHADER } from '@/constants/shaders/aurora';
import { Canvas, Fill, Shader, Skia } from '@shopify/react-native-skia';
import React, { useEffect } from 'react';
import { AppState, Dimensions, StyleSheet, View } from 'react-native';
import {
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Compile shader once at module load — keeps renders cheap
const runtimeEffect = Skia.RuntimeEffect.Make(AURORA_SHADER);

interface AuroraBackgroundProps {
  children?: React.ReactNode;
}

/**
 * Full-screen animated aurora gradient using Skia RuntimeShader.
 * Shader runs entirely on GPU; JS thread only drives the time uniform.
 * Animation pauses automatically when the app is backgrounded.
 */
export function AuroraBackground({ children }: AuroraBackgroundProps) {
  const time = useSharedValue(0);
  const active = useSharedValue(true);

  useFrameCallback((info) => {
    if (active.value) {
      time.value = (info.timeSinceFirstFrame ?? 0) / 1000;
    }
  });

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      active.value = state === 'active';
    });
    return () => sub.remove();
  }, [active]);

  const uniforms = useDerivedValue(() => ({
    time: time.value,
    resolution: [SCREEN_WIDTH, SCREEN_HEIGHT],
  }));

  // Fallback: static dark navy if shader compilation failed
  if (!runtimeEffect) {
    return (
      <View style={styles.fallback} testID="aurora-fallback">
        {children}
      </View>
    );
  }

  return (
    <View style={styles.container} testID="aurora-container">
      <Canvas style={StyleSheet.absoluteFill} testID="aurora-canvas">
        <Fill>
          <Shader source={runtimeEffect} uniforms={uniforms} />
        </Fill>
      </Canvas>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fallback: {
    flex: 1,
    backgroundColor: '#0D1117',
  },
});
