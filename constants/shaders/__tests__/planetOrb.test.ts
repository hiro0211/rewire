import { PLANET_SHADER } from '../planetOrb';

describe('PLANET_SHADER', () => {
  it('シェーダー文字列がexportされている', () => {
    expect(typeof PLANET_SHADER).toBe('string');
    expect(PLANET_SHADER.length).toBeGreaterThan(100);
  });

  it('必須 uniform 宣言を含む — time, resolution, glowBoost', () => {
    expect(PLANET_SHADER).toContain('uniform float time');
    expect(PLANET_SHADER).toContain('uniform vec2 resolution');
    expect(PLANET_SHADER).toContain('uniform float glowBoost');
  });

  it('Per-planet uniform 宣言を含む — cloudOpacity, atmosphereColor, emissive, rotationSpeed', () => {
    expect(PLANET_SHADER).toContain('uniform float cloudOpacity');
    expect(PLANET_SHADER).toContain('uniform vec3 atmosphereColor');
    expect(PLANET_SHADER).toContain('uniform float emissive');
    expect(PLANET_SHADER).toContain('uniform float rotationSpeed');
  });

  it('テクスチャ用 shader uniform を含む', () => {
    expect(PLANET_SHADER).toContain('uniform shader image');
  });

  it('main 関数を含む', () => {
    expect(PLANET_SHADER).toMatch(/vec4\s+main\s*\(\s*vec2\s+fragCoord\s*\)/);
  });

  it('image.eval によるテクスチャサンプリングを含む', () => {
    expect(PLANET_SHADER).toContain('image.eval');
  });

  it('rotation は uniform rotationSpeed で駆動される', () => {
    expect(PLANET_SHADER).toMatch(/time\s*\*\s*rotationSpeed/);
  });

  it('cloud 層は cloudOpacity で乗算される', () => {
    expect(PLANET_SHADER).toMatch(/cloud\s*=\s*[\s\S]*?cloudOpacity/);
  });

  it('emissive=1 のとき edge darkening が無効化される（mix で 1.0 にブレンド）', () => {
    expect(PLANET_SHADER).toMatch(/mix\([^,]+,\s*1\.0\s*,\s*emissive\)/);
  });

  it('emissive=1 のとき specular が無効化される（1.0 - emissive 乗算）', () => {
    expect(PLANET_SHADER).toMatch(/spec\s*\*\s*\(1\.0\s*-\s*emissive\)/);
  });
});
