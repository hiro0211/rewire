import { EARTH_SHADER } from '../earthOrb';

describe('EARTH_SHADER', () => {
  it('シェーダー文字列がexportされている', () => {
    expect(typeof EARTH_SHADER).toBe('string');
    expect(EARTH_SHADER.length).toBeGreaterThan(100);
  });

  it('必須uniform宣言を含む — time, resolution, glowBoost', () => {
    expect(EARTH_SHADER).toContain('uniform float time');
    expect(EARTH_SHADER).toContain('uniform vec2 resolution');
    expect(EARTH_SHADER).toContain('uniform float glowBoost');
  });

  it('テクスチャ用のshader uniformを含む', () => {
    expect(EARTH_SHADER).toContain('uniform shader image');
  });

  it('main関数を含む', () => {
    expect(EARTH_SHADER).toMatch(/vec4\s+main\s*\(\s*vec2\s+fragCoord\s*\)/);
  });

  it('image.evalによるテクスチャサンプリングを含む', () => {
    expect(EARTH_SHADER).toContain('image.eval');
  });

  it('球面投影のためのasin/cos関数を含む', () => {
    expect(EARTH_SHADER).toContain('asin');
    expect(EARTH_SHADER).toContain('cos');
  });

  it('大気リングのエフェクトを含む', () => {
    expect(EARTH_SHADER).toContain('atmosphere');
  });

  it('FBM関数（雲レイヤー用）を含む', () => {
    expect(EARTH_SHADER).toContain('fbm');
  });
});
