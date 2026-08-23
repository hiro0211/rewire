import { resolveDebugPaywallVariant } from '../debugPaywallVariant';

describe('resolveDebugPaywallVariant', () => {
  it('デバッグメニューが無効のとき語彙内の値でも null を返す', () => {
    expect(resolveDebugPaywallVariant('cosmicJourney', false)).toBeNull();
  });

  it('デバッグメニューが有効で cosmicJourney を渡したときそれを返す', () => {
    expect(resolveDebugPaywallVariant('cosmicJourney', true)).toBe('cosmicJourney');
  });

  it('デバッグメニューが有効で default を渡したときそれを返す', () => {
    expect(resolveDebugPaywallVariant('default', true)).toBe('default');
  });

  it('パラメータが無いとき null を返す', () => {
    expect(resolveDebugPaywallVariant(undefined, true)).toBeNull();
  });

  it('語彙にない値を渡したとき null を返す', () => {
    expect(resolveDebugPaywallVariant('somethingElse', true)).toBeNull();
  });

  it('空文字を渡したとき null を返す', () => {
    expect(resolveDebugPaywallVariant('', true)).toBeNull();
  });

  // useLocalSearchParams は同名パラメータが複数あると配列を返す（toPaywallSource と同じ事情）
  it('配列で渡されたとき先頭の値を使う', () => {
    expect(resolveDebugPaywallVariant(['cosmicJourney', 'default'], true)).toBe(
      'cosmicJourney',
    );
  });

  it('空配列を渡したとき null を返す', () => {
    expect(resolveDebugPaywallVariant([], true)).toBeNull();
  });
});
