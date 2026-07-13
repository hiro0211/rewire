import { isVersionLessThan } from '../compareVersions';

describe('isVersionLessThan', () => {
  it('メジャーが小さいとき true', () => {
    expect(isVersionLessThan('1.9.9', '2.0.0')).toBe(true);
  });

  it('マイナーが小さいとき true', () => {
    expect(isVersionLessThan('2.1.0', '2.2.0')).toBe(true);
  });

  it('パッチが小さいとき true', () => {
    expect(isVersionLessThan('2.2.0', '2.2.1')).toBe(true);
  });

  it('同一バージョンのとき false', () => {
    expect(isVersionLessThan('2.2.0', '2.2.0')).toBe(false);
  });

  it('大きいバージョンのとき false', () => {
    expect(isVersionLessThan('2.3.0', '2.2.0')).toBe(false);
  });

  it('桁数が違っても数値比較する（2.10.0 > 2.9.0）', () => {
    expect(isVersionLessThan('2.9.0', '2.10.0')).toBe(true);
    expect(isVersionLessThan('2.10.0', '2.9.0')).toBe(false);
  });

  it('セグメント数が違う場合は不足分を0として比較（2.2 == 2.2.0）', () => {
    expect(isVersionLessThan('2.2', '2.2.0')).toBe(false);
    expect(isVersionLessThan('2.2', '2.2.1')).toBe(true);
  });

  it('不正な文字列は false（フェイルオープン）', () => {
    expect(isVersionLessThan('abc', '2.2.0')).toBe(false);
    expect(isVersionLessThan('2.2.0', 'abc')).toBe(false);
    expect(isVersionLessThan('', '2.2.0')).toBe(false);
  });
});
