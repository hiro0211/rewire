/**
 * Hex color string を [r, g, b] の 0-1 正規化ベクトルに変換する。
 * Skia シェーダーの uniform に渡す用。
 */
export function hexToVec3(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}
