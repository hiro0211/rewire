import React from 'react';
import { render } from '@testing-library/react-native';

let capturedUniforms: Record<string, unknown> | null = null;
let capturedImageShaderProps: Record<string, unknown> | null = null;

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

const mockUseImage = jest.fn<unknown, [unknown]>(() => null);
jest.mock('@shopify/react-native-skia', () => ({
  useImage: (arg: unknown) => mockUseImage(arg),
}));

const skiaModulesRef = {
  SkiaCanvas: null as React.ComponentType<Record<string, unknown>> | null,
  SkiaFill: null as React.ComponentType<Record<string, unknown>> | null,
  SkiaShader: null as React.ComponentType<Record<string, unknown>> | null,
  SkiaImageShader: null as React.ComponentType<Record<string, unknown>> | null,
  runtimeEffect: null as object | null,
};

jest.mock('@/lib/dashboard/skiaPlanetInit', () => ({
  skiaPlanetInit: () => skiaModulesRef,
}));

function setSkiaAvailable() {
  const { View } = require('react-native');
  skiaModulesRef.SkiaCanvas = (props: Record<string, unknown>) => <View {...props} />;
  skiaModulesRef.SkiaFill = (props: Record<string, unknown>) => <View {...props} />;
  skiaModulesRef.SkiaShader = (props: Record<string, unknown>) => <View {...props} />;
  skiaModulesRef.SkiaImageShader = (props: Record<string, unknown>) => {
    capturedImageShaderProps = props;
    return <View {...props} />;
  };
  skiaModulesRef.runtimeEffect = { _isEffect: true };
}

function setSkiaUnavailable() {
  skiaModulesRef.SkiaCanvas = null;
  skiaModulesRef.SkiaFill = null;
  skiaModulesRef.SkiaShader = null;
  skiaModulesRef.SkiaImageShader = null;
  skiaModulesRef.runtimeEffect = null;
}

setSkiaAvailable();
const { PlanetOrbRenderer } = require('../PlanetOrbRenderer') as {
  PlanetOrbRenderer: typeof import('../PlanetOrbRenderer').PlanetOrbRenderer;
};

const ORB_COLORS = ['#4A90E2', '#6DB3F0', '#2B5F9E'] as const;

describe('PlanetOrbRenderer', () => {
  beforeEach(() => {
    capturedUniforms = null;
    capturedImageShaderProps = null;
    mockUseImage.mockReturnValue(null);
    setSkiaAvailable();
  });

  it('レンダリングされる', () => {
    const time = { value: 0 };
    const { toJSON } = render(
      <PlanetOrbRenderer
        badgeId="earth"
        size={200}
        time={time as never}
        orbColors={ORB_COLORS}
      />,
    );
    expect(toJSON()).not.toBeNull();
  });

  it('uniforms に time, resolution, glowBoost, cloudOpacity, atmosphereColor, emissive, rotationSpeed が含まれる', () => {
    const time = { value: 5.5 };
    render(
      <PlanetOrbRenderer
        badgeId="earth"
        size={200}
        time={time as never}
        orbColors={ORB_COLORS}
      />,
    );
    expect(capturedUniforms).not.toBeNull();
    expect(capturedUniforms!.time).toBe(5.5);
    expect(capturedUniforms!.resolution).toEqual([200, 200]);
    expect(capturedUniforms!.glowBoost).toBe(0);
    expect(typeof capturedUniforms!.cloudOpacity).toBe('number');
    expect(Array.isArray(capturedUniforms!.atmosphereColor)).toBe(true);
    expect(typeof capturedUniforms!.emissive).toBe('number');
    expect(typeof capturedUniforms!.rotationSpeed).toBe('number');
  });

  it('Earth: cloudOpacity=0.35 / emissive=0', () => {
    const time = { value: 0 };
    render(
      <PlanetOrbRenderer
        badgeId="earth"
        size={200}
        time={time as never}
        orbColors={ORB_COLORS}
      />,
    );
    expect(capturedUniforms!.cloudOpacity).toBeCloseTo(0.35);
    expect(capturedUniforms!.emissive).toBe(0);
  });

  it('Sun: emissive=1（自己発光）', () => {
    const time = { value: 0 };
    render(
      <PlanetOrbRenderer
        badgeId="sun"
        size={200}
        time={time as never}
        orbColors={ORB_COLORS}
      />,
    );
    expect(capturedUniforms!.emissive).toBe(1);
  });

  it('Mars: cloudOpacity=0（雲なし）', () => {
    const time = { value: 0 };
    render(
      <PlanetOrbRenderer
        badgeId="mars"
        size={200}
        time={time as never}
        orbColors={ORB_COLORS}
      />,
    );
    expect(capturedUniforms!.cloudOpacity).toBe(0);
  });

  it('glowBoost プロパティの値が uniforms に反映される', () => {
    const time = { value: 0 };
    const glowBoost = { value: 0.8 };
    render(
      <PlanetOrbRenderer
        badgeId="earth"
        size={200}
        time={time as never}
        glowBoost={glowBoost as never}
        orbColors={ORB_COLORS}
      />,
    );
    expect(capturedUniforms!.glowBoost).toBe(0.8);
  });

  it('テクスチャ未ロード時（useImage=null）は SVG フォールバックを描画する', () => {
    mockUseImage.mockReturnValue(null);
    const time = { value: 0 };
    const { getByTestId } = render(
      <PlanetOrbRenderer
        badgeId="earth"
        size={200}
        time={time as never}
        orbColors={ORB_COLORS}
      />,
    );
    expect(getByTestId('planet-orb-fallback')).toBeTruthy();
  });

  it('Skia モジュール不在時は SVG フォールバックを描画する', () => {
    setSkiaUnavailable();
    const time = { value: 0 };
    const { getByTestId } = render(
      <PlanetOrbRenderer
        badgeId="earth"
        size={200}
        time={time as never}
        orbColors={ORB_COLORS}
      />,
    );
    expect(getByTestId('planet-orb-fallback')).toBeTruthy();
  });

  it('テクスチャロード済み + Skia 利用可能時は Skia キャンバスを描画する', () => {
    mockUseImage.mockReturnValue({ width: 1024, height: 512 });
    const time = { value: 0 };
    const { getByTestId } = render(
      <PlanetOrbRenderer
        badgeId="earth"
        size={200}
        time={time as never}
        orbColors={ORB_COLORS}
        testID="earth-canvas"
      />,
    );
    expect(getByTestId('earth-canvas')).toBeTruthy();
  });

  it('SkiaImageShader にキャンバスサイズの rect が渡される', () => {
    mockUseImage.mockReturnValue({ width: 1024, height: 512 });
    const time = { value: 0 };
    render(
      <PlanetOrbRenderer
        badgeId="earth"
        size={200}
        time={time as never}
        orbColors={ORB_COLORS}
      />,
    );
    expect(capturedImageShaderProps!.rect).toEqual({
      x: 0,
      y: 0,
      width: 200,
      height: 200,
    });
  });

  describe('全惑星パラメタライズ', () => {
    const PLANETS = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'moon', 'sun'] as const;

    it.each(PLANETS)('%s — SVG fallback が描画される', (id) => {
      const time = { value: 0 };
      const { getByTestId } = render(
        <PlanetOrbRenderer
          badgeId={id}
          size={120}
          time={time as never}
          orbColors={ORB_COLORS}
        />,
      );
      expect(getByTestId('planet-orb-fallback')).toBeTruthy();
    });
  });
});

describe('全惑星テクスチャアセット', () => {
  const fs = require('fs');
  const path = require('path');
  const planetsDir = path.resolve(__dirname, '../../../assets/images/planets');

  it.each([
    'mercury',
    'venus',
    'earth',
    'mars',
    'jupiter',
    'saturn',
    'uranus',
    'neptune',
    'moon',
    'sun',
  ] as const)('%s-equirect.webp がバンドル対象として存在する', (name) => {
    expect(fs.existsSync(path.join(planetsDir, `${name}-equirect.webp`))).toBe(true);
  });

  it('旧 assets/images/earth-equirect.webp は削除済み', () => {
    expect(fs.existsSync(path.resolve(planetsDir, '../earth-equirect.webp'))).toBe(false);
  });
});
