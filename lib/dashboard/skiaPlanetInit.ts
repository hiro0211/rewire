import Constants from 'expo-constants';
import { PLANET_SHADER } from '@/constants/shaders/planetOrb';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SkiaComponent = React.ComponentType<any> | null;

export interface SkiaPlanetModules {
  SkiaCanvas: SkiaComponent;
  SkiaFill: SkiaComponent;
  SkiaShader: SkiaComponent;
  SkiaImageShader: SkiaComponent;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  runtimeEffect: any;
}

/**
 * 惑星オーブ用の Skia ネイティブモジュールを安全にロードする。
 * ExpoGo / native bridge 不在の環境ではすべて null を返す。
 */
export function skiaPlanetInit(): SkiaPlanetModules {
  const isExpoGo = Constants.executionEnvironment === 'storeClient';

  if (isExpoGo) {
    return {
      SkiaCanvas: null,
      SkiaFill: null,
      SkiaShader: null,
      SkiaImageShader: null,
      runtimeEffect: null,
    };
  }

  try {
    const skia = require('@shopify/react-native-skia');
    return {
      SkiaCanvas: skia.Canvas,
      SkiaFill: skia.Fill,
      SkiaShader: skia.Shader,
      SkiaImageShader: skia.ImageShader,
      runtimeEffect: skia.Skia.RuntimeEffect.Make(PLANET_SHADER),
    };
  } catch {
    return {
      SkiaCanvas: null,
      SkiaFill: null,
      SkiaShader: null,
      SkiaImageShader: null,
      runtimeEffect: null,
    };
  }
}
