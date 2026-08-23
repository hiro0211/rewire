import { stableHash } from '../stableHash';

/**
 * 決定論的な擬似UUID列。
 *
 * 実在の `Crypto.randomUUID()` を使うとテストが実行ごとに揺れて、
 * アバランチ検証が「たまたま通る/落ちる」になる。LCG で固定シードから
 * 生成し、失敗したときに必ず同じ入力で再現できるようにしている。
 */
function makeUuidLikeIds(count: number): string[] {
  let state = 0x2f6e2b1;
  const nextWord = (): string => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state.toString(16).padStart(8, '0');
  };

  return Array.from({ length: count }, () => {
    const a = nextWord();
    const b = nextWord();
    const c = nextWord();
    const d = nextWord();
    return `${a}-${b.slice(0, 4)}-${b.slice(4)}-${c.slice(0, 4)}-${c.slice(4)}${d}`;
  });
}

describe('stableHash', () => {
  it('同じ入力のとき常に同じ値を返す', () => {
    expect(stableHash('user-123')).toBe(stableHash('user-123'));
  });

  it('異なる入力のとき異なる値を返す', () => {
    expect(stableHash('user-123')).not.toBe(stableHash('user-124'));
  });

  it('空文字のとき32bit非負整数を返す', () => {
    const hash = stableHash('');

    expect(hash).toBe(hash >>> 0);
  });

  it('大きな入力でも32bit非負整数の範囲に収まる', () => {
    const hash = stableHash('x'.repeat(1000));

    expect(hash).toBeGreaterThanOrEqual(0);
    expect(hash).toBeLessThanOrEqual(0xffffffff);
  });

  /**
   * A/B 割当の本体。素の FNV-1a は最下位ビットが「全文字の lsb の XOR」という
   * 線形パリティ関数になるため、接頭辞（＝実験ID）でソルトしても `% 2` の結果が
   * 一律反転（0%一致）か一律同一（100%一致）にしかならない。
   * アバランチ・ファイナライザが入っていることをここで担保する。
   */
  it('接頭辞だけ違うseed集合を%2で割ったとき一致率が40〜60%になる', () => {
    const ids = makeUuidLikeIds(2000);

    const matches = ids.filter(
      (id) => stableHash(`a:${id}`) % 2 === stableHash(`b:${id}`) % 2
    ).length;
    const matchRate = matches / ids.length;

    expect(matchRate).toBeGreaterThan(0.4);
    expect(matchRate).toBeLessThan(0.6);
  });
});
