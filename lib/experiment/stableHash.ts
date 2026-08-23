/**
 * A/B 割当用の決定論的ハッシュ（FNV-1a 32bit + murmur3 fmix32）。
 *
 * 純関数・同期・外部依存ゼロ。永続化も非同期読み込みも要らないので、
 * 「バリアント確定前のチラつき」が原理的に起きない。
 *
 * ⚠️ fmix32 を外してはならない。素の FNV-1a の最下位ビットは
 *    `lsb(FNV1a(s)) = lsb(offsetBasis) XOR (全文字の lsb の XOR)`
 *    という線形パリティ関数になり、`hash % 2` で2アームに割ると
 *    実験IDでソルトしても2つ目の実験が1つ目と 100%一致か100%反転に
 *    しかならない（5000UUIDで実測: 0.0% / 100.0%）。
 *    fmix32 のアバランチで下位ビットに全ビットの影響を撹拌して初めて
 *    実験間が独立になる。lib/experiment/__tests__/stableHash.test.ts が
 *    この性質を守っている。
 */

const FNV_OFFSET_BASIS = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

/** murmur3 のアバランチ・ファイナライザ。全入力ビットを下位ビットまで撹拌する */
function fmix32(input: number): number {
  let hash = input;

  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x85ebca6b);
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 0xc2b2ae35);
  hash ^= hash >>> 16;

  return hash >>> 0;
}

/** 任意の文字列を 0..0xffffffff の非負整数へ写す */
export function stableHash(input: string): number {
  let hash = FNV_OFFSET_BASIS;

  // Math.imul を使うのは、Hermes でも 32bit 乗算のオーバーフローが
  // 仕様どおり切り捨てられ、端末やエンジン差で割当がずれないため
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, FNV_PRIME);
  }

  return fmix32(hash);
}
