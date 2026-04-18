import React from 'react';
import { render } from '@testing-library/react-native';

// Track uniforms passed to shader
let capturedUniforms: Record<string, unknown> | null = null;

jest.mock('react-native-reanimated', () => {
  return {
    __esModule: true,
    default: {
      View: require('react-native').View,
      createAnimatedComponent: (c: React.ComponentType) => c,
    },
    useSharedValue: (v: number) => ({ value: v }),
    useAnimatedStyle: (fn: () => unknown) => fn(),
    useDerivedValue: (fn: () => unknown) => {
      const result = fn();
      capturedUniforms = result as Record<string, unknown>;
      return { value: result };
    },
  };
});

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    isDark: true,
    colors: { text: '#FFFFFF' },
  }),
}));

jest.mock('react-native-svg', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: Record<string, unknown>) => <View {...props} />,
    Circle: (props: Record<string, unknown>) => <View {...props} />,
    Defs: (props: Record<string, unknown>) => <View {...props} />,
    RadialGradient: (props: Record<string, unknown>) => <View {...props} />,
    Stop: (props: Record<string, unknown>) => <View {...props} />,
  };
});

// Mock useImage
const mockUseImage = jest.fn(() => null);
jest.mock('@shopify/react-native-skia', () => ({
  useImage: (...args: unknown[]) => mockUseImage(...args),
}));

// Mock skiaEarthInit — modules ref that can be mutated per test
const skiaModulesRef = {
  SkiaCanvas: null as React.ComponentType<Record<string, unknown>> | null,
  SkiaFill: null as React.ComponentType<Record<string, unknown>> | null,
  SkiaShader: null as React.ComponentType<Record<string, unknown>> | null,
  SkiaImageShader: null as React.ComponentType<Record<string, unknown>> | null,
  runtimeEffect: null as object | null,
};

jest.mock('@/lib/dashboard/skiaEarthInit', () => ({
  skiaEarthInit: () => skiaModulesRef,
}));

import { EarthOrbRenderer } from '../EarthOrbRenderer';

function setSkiaAvailable() {
  const { View } = require('react-native');
  skiaModulesRef.SkiaCanvas = (props: Record<string, unknown>) => <View {...props} />;
  skiaModulesRef.SkiaFill = (props: Record<string, unknown>) => <View {...props} />;
  skiaModulesRef.SkiaShader = (props: Record<string, unknown>) => <View {...props} />;
  skiaModulesRef.SkiaImageShader = (props: Record<string, unknown>) => <View {...props} />;
  skiaModulesRef.runtimeEffect = { _isEffect: true };
}

function setSkiaUnavailable() {
  skiaModulesRef.SkiaCanvas = null;
  skiaModulesRef.SkiaFill = null;
  skiaModulesRef.SkiaShader = null;
  skiaModulesRef.SkiaImageShader = null;
  skiaModulesRef.runtimeEffect = null;
}

describe('EarthOrbRenderer', () => {
  beforeEach(() => {
    capturedUniforms = null;
    mockUseImage.mockReturnValue(null);
    setSkiaAvailable();
  });

  it('レンダリングされる', () => {
    const time = { value: 0 };
    const { toJSON } = render(
      <EarthOrbRenderer
        size={200}
        time={time as never}
        orbColors={['#4A90E2', '#6DB3F0', '#2B5F9E'] as const}
      />,
    );
    expect(toJSON()).not.toBeNull();
  });

  it('uniformsにtime, resolution, glowBoostが含まれる', () => {
    const time = { value: 5.5 };
    render(
      <EarthOrbRenderer
        size={200}
        time={time as never}
        orbColors={['#4A90E2', '#6DB3F0', '#2B5F9E'] as const}
      />,
    );
    expect(capturedUniforms).not.toBeNull();
    expect(capturedUniforms!.time).toBe(5.5);
    expect(capturedUniforms!.resolution).toEqual([200, 200]);
    expect(capturedUniforms!.glowBoost).toBe(0);
  });

  it('glowBoostプロパティの値がuniformsに反映される', () => {
    const time = { value: 0 };
    const glowBoost = { value: 0.8 };
    render(
      <EarthOrbRenderer
        size={200}
        time={time as never}
        glowBoost={glowBoost as never}
        orbColors={['#4A90E2', '#6DB3F0', '#2B5F9E'] as const}
      />,
    );
    expect(capturedUniforms!.glowBoost).toBe(0.8);
  });

  it('テクスチャ未ロード時（useImage=null）はSVGフォールバックを描画する', () => {
    mockUseImage.mockReturnValue(null);
    const time = { value: 0 };
    const { getByTestId } = render(
      <EarthOrbRenderer
        size={200}
        time={time as never}
        orbColors={['#4A90E2', '#6DB3F0', '#2B5F9E'] as const}
      />,
    );
    expect(getByTestId('earth-orb-fallback')).toBeTruthy();
  });

  it('Skiaモジュール不在時はSVGフォールバックを描画する', () => {
    setSkiaUnavailable();
    const time = { value: 0 };
    const { getByTestId } = render(
      <EarthOrbRenderer
        size={200}
        time={time as never}
        orbColors={['#4A90E2', '#6DB3F0', '#2B5F9E'] as const}
      />,
    );
    expect(getByTestId('earth-orb-fallback')).toBeTruthy();
  });

  it('テクスチャロード済み + Skia利用可能時はSkiaキャンバスを描画する', () => {
    mockUseImage.mockReturnValue({ width: 1024, height: 512 });
    const time = { value: 0 };
    const { getByTestId } = render(
      <EarthOrbRenderer
        size={200}
        time={time as never}
        orbColors={['#4A90E2', '#6DB3F0', '#2B5F9E'] as const}
        testID="earth-canvas"
      />,
    );
    expect(getByTestId('earth-canvas')).toBeTruthy();
  });
});
