import { parseRgba } from '../parseRgba';

describe('parseRgba', () => {
  it('rgba文字列をhexとalphaに変換する', () => {
    expect(parseRgba('rgba(201, 203, 224, 0.3)')).toEqual({
      hex: '#C9CBE0',
      alpha: 0.3,
    });
  });

  it('境界値0をhex #000000に変換する', () => {
    expect(parseRgba('rgba(0, 0, 0, 0.0)')).toEqual({
      hex: '#000000',
      alpha: 0,
    });
  });

  it('境界値255をhex #FFFFFFに変換する', () => {
    expect(parseRgba('rgba(255, 255, 255, 1.0)')).toEqual({
      hex: '#FFFFFF',
      alpha: 1,
    });
  });

  it('alpha省略のrgb文字列ではalpha 1を返す', () => {
    expect(parseRgba('rgb(74, 144, 226)')).toEqual({
      hex: '#4A90E2',
      alpha: 1,
    });
  });

  it('不正な入力ではnullを返す', () => {
    expect(parseRgba('invalid')).toBeNull();
    expect(parseRgba('')).toBeNull();
  });
});
