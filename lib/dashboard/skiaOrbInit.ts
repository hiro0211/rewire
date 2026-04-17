import Constants from 'expo-constants';
import { ORB_SHADER } from '@/constants/shaders/orb';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SkiaComponent = React.ComponentType<any> | null;

export interface SkiaOrbModules {
  SkiaCanvas: SkiaComponent;
  SkiaFill: SkiaComponent;
  SkiaShader: SkiaComponent;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  runtimeEffect: any;
}

/**
 * Skia のネイティブモジュールを安全にロードする。
 * ExpoGo やネイティブブリッジが無い環境ではすべて null を返す。
 */
export function skiaOrbInit(): SkiaOrbModules {
  const isExpoGo = Constants.executionEnvironment === 'storeClient';

  if (isExpoGo) {
    return { SkiaCanvas: null, SkiaFill: null, SkiaShader: null, runtimeEffect: null };
  }

  try {
    const skia = require('@shopify/react-native-skia');
    return {
      SkiaCanvas: skia.Canvas,
      SkiaFill: skia.Fill,
      SkiaShader: skia.Shader,
      runtimeEffect: skia.Skia.RuntimeEffect.Make(ORB_SHADER),
    };
  } catch {
    return { SkiaCanvas: null, SkiaFill: null, SkiaShader: null, runtimeEffect: null };
  }
}
