import { COSMIC_FIELD_SHADER } from '@/constants/shaders/cosmicField';
import {
  createSkiaShaderModules,
  type SkiaShaderModules,
} from '@/lib/dashboard/createSkiaShaderModules';

export type SkiaCosmicModules = SkiaShaderModules;

/**
 * 宇宙フィールドオーブ用の Skia ネイティブモジュールを安全にロードする。
 * ExpoGo / native bridge 不在の環境ではすべて null を返す。
 */
export function skiaCosmicInit(): SkiaCosmicModules {
  return createSkiaShaderModules(COSMIC_FIELD_SHADER);
}
