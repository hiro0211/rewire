import { stableHash } from './stableHash';

/** ハッシュ値を [0, 1) の実数に写すための除数（32bit空間の大きさ） */
const HASH_SPACE = 0x100000000;

/**
 * 不正な重みを 0 に丸める。
 *
 * 負値や NaN をそのまま累積すると累積和が巻き戻って、
 * 後続アームの当選区間が壊れる（＝重み指定ミスが静かに分布を歪める）。
 */
function normalizeWeight(weight: number): number {
  return Number.isFinite(weight) && weight > 0 ? weight : 0;
}

/**
 * 種文字列から決定論的にアームを1つ選ぶ。
 *
 * 同じ種なら常に同じアームを返すので、割当を永続化する必要がない。
 * 重みの合計が0以下（＝有効なアームが無い）のときは先頭アームに倒す。
 * 例外を投げないのは、実験設定のミスで画面が落ちるより
 * 既定の体験を出し続ける方が損失が小さいため。
 */
export function assignVariant<T extends string>(
  seed: string,
  variants: readonly [T, ...T[]],
  weights: Readonly<Record<T, number>>
): T {
  const totalWeight = variants.reduce(
    (sum, variant) => sum + normalizeWeight(weights[variant]),
    0
  );

  if (totalWeight <= 0) {
    return variants[0];
  }

  // ハッシュの「上位ビット」を使う（剰余ではなく除算）。
  // 剰余で書くと、stableHash から fmix32 が失われたときに下位ビットの
  // 線形パリティがそのまま割当に出る。除算なら重みが整数でなくても扱える
  const point = (stableHash(seed) / HASH_SPACE) * totalWeight;

  let cursor = 0;
  for (const variant of variants) {
    cursor += normalizeWeight(weights[variant]);
    if (point < cursor) {
      return variant;
    }
  }

  // 浮動小数の累積誤差で全区間を抜けた場合の保険。
  // 重み0のアームを返さないよう、末尾から最初の有効アームを拾う
  for (let i = variants.length - 1; i >= 0; i--) {
    if (normalizeWeight(weights[variants[i]]) > 0) {
      return variants[i];
    }
  }

  return variants[0];
}
