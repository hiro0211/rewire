import Constants from 'expo-constants';
import { EARTH_SHADER } from '@/constants/shaders/earthOrb';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SkiaComponent = React.ComponentType<any> | null;

export interface SkiaEarthModules {
  SkiaCanvas: SkiaComponent;
  SkiaFill: SkiaComponent;
  SkiaShader: SkiaComponent;
  SkiaImageShader: SkiaComponent;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  runtimeEffect: any;
}

/**
 * 地球オーブ用のSkiaネイティブモジュールを安全にロードする。
 * ExpoGo やネイティブブリッジが無い環境ではすべて null を返す。
 */
export function skiaEarthInit(): SkiaEarthModules {
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
      runtimeEffect: skia.Skia.RuntimeEffect.Make(EARTH_SHADER),
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
