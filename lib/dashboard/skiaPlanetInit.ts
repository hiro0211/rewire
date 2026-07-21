import { PLANET_SHADER } from '@/constants/shaders/planetOrb';
import {
  createSkiaShaderModules,
  type SkiaShaderModules,
} from '@/lib/dashboard/createSkiaShaderModules';

export type SkiaPlanetModules = SkiaShaderModules;

/**
 * 惑星オーブ用の Skia ネイティブモジュールを安全にロードする。
 * ExpoGo / native bridge 不在の環境ではすべて null を返す。
 */
export function skiaPlanetInit(): SkiaPlanetModules {
  return createSkiaShaderModules(PLANET_SHADER);
}
