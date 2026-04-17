import { hexToVec3 } from '../hexToVec3';

describe('hexToVec3', () => {
  it('#FF0000 を [1, 0, 0] に変換する', () => {
    expect(hexToVec3('#FF0000')).toEqual([1, 0, 0]);
  });

  it('#00FF00 を [0, 1, 0] に変換する', () => {
    expect(hexToVec3('#00FF00')).toEqual([0, 1, 0]);
  });

  it('#0000FF を [0, 0, 1] に変換する', () => {
    expect(hexToVec3('#0000FF')).toEqual([0, 0, 1]);
  });

  it('#000000 を [0, 0, 0] に変換する', () => {
    expect(hexToVec3('#000000')).toEqual([0, 0, 0]);
  });

  it('#FFFFFF を [1, 1, 1] に変換する', () => {
    expect(hexToVec3('#FFFFFF')).toEqual([1, 1, 1]);
  });

  it('中間値を正しく正規化する (#808080)', () => {
    const [r, g, b] = hexToVec3('#808080');
    expect(r).toBeCloseTo(0.502, 2);
    expect(g).toBeCloseTo(0.502, 2);
    expect(b).toBeCloseTo(0.502, 2);
  });

  it('小文字16進数でも動作する', () => {
    expect(hexToVec3('#ff8800')).toEqual(hexToVec3('#FF8800'));
  });
});
