import { hexToRgba } from '../hexToRgba';

describe('hexToRgba', () => {
  it('#FF0000 をデフォルトalpha=0.3でrgbaに変換する', () => {
    expect(hexToRgba('#FF0000')).toBe('rgba(255, 0, 0, 0.3)');
  });

  it('#00FF00 をデフォルトalpha=0.3でrgbaに変換する', () => {
    expect(hexToRgba('#00FF00')).toBe('rgba(0, 255, 0, 0.3)');
  });

  it('#0000FF をデフォルトalpha=0.3でrgbaに変換する', () => {
    expect(hexToRgba('#0000FF')).toBe('rgba(0, 0, 255, 0.3)');
  });

  it('alphaを指定できる', () => {
    expect(hexToRgba('#FF0000', 0.5)).toBe('rgba(255, 0, 0, 0.5)');
  });

  it('alpha=1で不透明になる', () => {
    expect(hexToRgba('#808080', 1)).toBe('rgba(128, 128, 128, 1)');
  });

  it('小文字hexでも動作する', () => {
    expect(hexToRgba('#ff8800')).toBe(hexToRgba('#FF8800'));
  });
});
