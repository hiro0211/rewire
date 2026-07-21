import Constants from 'expo-constants';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SkiaComponent = React.ComponentType<any> | null;

export interface SkiaShaderModules {
  SkiaCanvas: SkiaComponent;
  SkiaFill: SkiaComponent;
  SkiaShader: SkiaComponent;
  SkiaImageShader: SkiaComponent;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  runtimeEffect: any;
}

const NULL_MODULES: SkiaShaderModules = {
  SkiaCanvas: null,
  SkiaFill: null,
  SkiaShader: null,
  SkiaImageShader: null,
  runtimeEffect: null,
};

/**
 * SkSL ソースを受け取り、Skia ネイティブモジュール一式と
 * コンパイル済み RuntimeEffect を安全にロードする。
 * ExpoGo / native bridge 不在の環境ではすべて null を返す。
 *
 * 惑星 (skiaPlanetInit) と宇宙フィールド (skiaCosmicInit) の唯一の差分は
 * SkSL ソースのみなので、ブートストラップをここに集約する。
 */
export function createSkiaShaderModules(sksl: string): SkiaShaderModules {
  const isExpoGo = Constants.executionEnvironment === 'storeClient';

  if (isExpoGo) {
    return { ...NULL_MODULES };
  }

  try {
    const skia = require('@shopify/react-native-skia');
    return {
      SkiaCanvas: skia.Canvas,
      SkiaFill: skia.Fill,
      SkiaShader: skia.Shader,
      SkiaImageShader: skia.ImageShader,
      runtimeEffect: skia.Skia.RuntimeEffect.Make(sksl),
    };
  } catch {
    return { ...NULL_MODULES };
  }
}
