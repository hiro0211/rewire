import React from 'react';
import { render } from '@testing-library/react-native';
import { hexToVec3 } from '@/lib/color/hexToVec3';

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

jest.mock('@/lib/dashboard/skiaCosmicInit', () => ({
  skiaCosmicInit: () => skiaModulesRef,
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
const { CosmicFieldRenderer } = require('../CosmicFieldRenderer') as {
  CosmicFieldRenderer: typeof import('../CosmicFieldRenderer').CosmicFieldRenderer;
};

const ORB_COLORS = ['#B8A9D4', '#D0C4E4', '#7B68AE'] as const;
const NEBULA_GLOW = '#E8E0F0';

describe('CosmicFieldRenderer', () => {
  beforeEach(() => {
    capturedUniforms = null;
    capturedImageShaderProps = null;
    mockUseImage.mockReturnValue(null);
    setSkiaAvailable();
  });

  it('レンダリングされる', () => {
    const time = { value: 0 };
    const { toJSON } = render(
      <CosmicFieldRenderer
        badgeId="nebula"
        size={200}
        time={time as never}
        glowColor={NEBULA_GLOW}
        orbColors={ORB_COLORS}
      />,
    );
    expect(toJSON()).not.toBeNull();
  });

  it('uniforms に全パラメータが含まれる', () => {
    const time = { value: 5.5 };
    render(
      <CosmicFieldRenderer
        badgeId="nebula"
        size={200}
        time={time as never}
        glowColor={NEBULA_GLOW}
        orbColors={ORB_COLORS}
      />,
    );
    expect(capturedUniforms).not.toBeNull();
    expect(capturedUniforms!.time).toBe(5.5);
    expect(capturedUniforms!.resolution).toEqual([200, 200]);
    expect(capturedUniforms!.glowBoost).toBe(0);
    expect(Array.isArray(capturedUniforms!.tintColor)).toBe(true);
    expect(typeof capturedUniforms!.tintStrength).toBe('number');
    expect(typeof capturedUniforms!.driftSpeed).toBe('number');
    expect(typeof capturedUniforms!.rotationSpeed).toBe('number');
    expect(typeof capturedUniforms!.zoom).toBe('number');
    expect(typeof capturedUniforms!.coreBrightness).toBe('number');
    expect(typeof capturedUniforms!.edgeSoftness).toBe('number');
    // 3D モーション用パラメータ
    expect(typeof capturedUniforms!.motionMode).toBe('number');
    expect(typeof capturedUniforms!.tilt).toBe('number');
    expect(typeof capturedUniforms!.zoomRate).toBe('number');
    expect(typeof capturedUniforms!.zoomMax).toBe('number');
    expect(typeof capturedUniforms!.parallaxStrength).toBe('number');
    expect(typeof capturedUniforms!.swaySpeed).toBe('number');
  });

  it('nebula（parallax）の motionMode は 0', () => {
    const time = { value: 0 };
    render(
      <CosmicFieldRenderer
        badgeId="nebula"
        size={200}
        time={time as never}
        glowColor={NEBULA_GLOW}
        orbColors={ORB_COLORS}
      />,
    );
    expect(capturedUniforms!.motionMode).toBe(0);
  });

  it('starCluster（sphere）の motionMode は 2', () => {
    const time = { value: 0 };
    render(
      <CosmicFieldRenderer
        badgeId="starCluster"
        size={200}
        time={time as never}
        glowColor={NEBULA_GLOW}
        orbColors={ORB_COLORS}
      />,
    );
    expect(capturedUniforms!.motionMode).toBe(2);
  });

  it('tintColor が glowColor の hexToVec3 と一致する', () => {
    const time = { value: 0 };
    render(
      <CosmicFieldRenderer
        badgeId="nebula"
        size={200}
        time={time as never}
        glowColor={NEBULA_GLOW}
        orbColors={ORB_COLORS}
      />,
    );
    const expected = hexToVec3(NEBULA_GLOW);
    const actual = capturedUniforms!.tintColor as number[];
    expect(actual[0]).toBeCloseTo(expected[0]);
    expect(actual[1]).toBeCloseTo(expected[1]);
    expect(actual[2]).toBeCloseTo(expected[2]);
  });

  it('glowBoost プロパティの値が uniforms に反映される', () => {
    const time = { value: 0 };
    const glowBoost = { value: 0.8 };
    render(
      <CosmicFieldRenderer
        badgeId="nebula"
        size={200}
        time={time as never}
        glowBoost={glowBoost as never}
        glowColor={NEBULA_GLOW}
        orbColors={ORB_COLORS}
      />,
    );
    expect(capturedUniforms!.glowBoost).toBe(0.8);
  });

  it('SkiaImageShader にキャンバスサイズの rect が渡される（座標空間バグの回帰テスト）', () => {
    mockUseImage.mockReturnValue({ width: 512, height: 512 });
    const time = { value: 0 };
    render(
      <CosmicFieldRenderer
        badgeId="nebula"
        size={200}
        time={time as never}
        glowColor={NEBULA_GLOW}
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

  it('非 sphere（nebula=parallax）の tx は clamp', () => {
    mockUseImage.mockReturnValue({ width: 512, height: 512 });
    const time = { value: 0 };
    render(
      <CosmicFieldRenderer
        badgeId="nebula"
        size={200}
        time={time as never}
        glowColor={NEBULA_GLOW}
        orbColors={ORB_COLORS}
      />,
    );
    expect(capturedImageShaderProps!.tx).toBe('clamp');
    expect(capturedImageShaderProps!.ty).toBe('clamp');
  });

  it('sphere モード（starCluster）の tx は repeat（連続回転の継ぎ目回避）', () => {
    mockUseImage.mockReturnValue({ width: 512, height: 512 });
    const time = { value: 0 };
    render(
      <CosmicFieldRenderer
        badgeId="starCluster"
        size={200}
        time={time as never}
        glowColor={NEBULA_GLOW}
        orbColors={ORB_COLORS}
      />,
    );
    expect(capturedImageShaderProps!.tx).toBe('repeat');
  });

  it('テクスチャ未ロード時（useImage=null）は SVG フォールバックを描画する', () => {
    mockUseImage.mockReturnValue(null);
    const time = { value: 0 };
    const { getByTestId } = render(
      <CosmicFieldRenderer
        badgeId="nebula"
        size={200}
        time={time as never}
        glowColor={NEBULA_GLOW}
        orbColors={ORB_COLORS}
      />,
    );
    expect(getByTestId('cosmic-field-fallback')).toBeTruthy();
  });

  it('Skia モジュール不在時は SVG フォールバックを描画する', () => {
    setSkiaUnavailable();
    const time = { value: 0 };
    const { getByTestId } = render(
      <CosmicFieldRenderer
        badgeId="nebula"
        size={200}
        time={time as never}
        glowColor={NEBULA_GLOW}
        orbColors={ORB_COLORS}
      />,
    );
    expect(getByTestId('cosmic-field-fallback')).toBeTruthy();
  });

  it('テクスチャロード済み + Skia 利用可能時は Skia キャンバスを描画する', () => {
    mockUseImage.mockReturnValue({ width: 512, height: 512 });
    const time = { value: 0 };
    const { getByTestId } = render(
      <CosmicFieldRenderer
        badgeId="nebula"
        size={200}
        time={time as never}
        glowColor={NEBULA_GLOW}
        orbColors={ORB_COLORS}
        testID="nebula-canvas"
      />,
    );
    expect(getByTestId('nebula-canvas')).toBeTruthy();
  });

  describe('全 cosmic バッジパラメタライズ', () => {
    const COSMIC = [
      'stardust',
      'nebula',
      'protostar',
      'whiteDwarf',
      'stellarSystem',
      'starCluster',
      'galaxy',
      'cosmos',
    ] as const;

    it.each(COSMIC)('%s — SVG fallback が描画される', (id) => {
      const time = { value: 0 };
      const { getByTestId } = render(
        <CosmicFieldRenderer
          badgeId={id}
          size={120}
          time={time as never}
          glowColor={NEBULA_GLOW}
          orbColors={ORB_COLORS}
        />,
      );
      expect(getByTestId('cosmic-field-fallback')).toBeTruthy();
    });
  });
});
