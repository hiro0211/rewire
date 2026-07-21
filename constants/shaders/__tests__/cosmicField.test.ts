import { COSMIC_FIELD_SHADER } from '@/constants/shaders/cosmicField';

describe('COSMIC_FIELD_SHADER', () => {
  it.each([
    'uniform float time;',
    'uniform vec2 resolution;',
    'uniform float glowBoost;',
    'uniform vec3 tintColor;',
    'uniform float tintStrength;',
    'uniform float driftSpeed;',
    'uniform float rotationSpeed;',
    'uniform float zoom;',
    'uniform float coreBrightness;',
    'uniform float edgeSoftness;',
    'uniform float motionMode;',
    'uniform float tilt;',
    'uniform float zoomRate;',
    'uniform float zoomMax;',
    'uniform float parallaxStrength;',
    'uniform float swaySpeed;',
  ])('uniform 宣言 "%s" を含む', (decl) => {
    expect(COSMIC_FIELD_SHADER).toContain(decl);
  });

  it.each([
    'mode: parallax',
    'mode: disk',
    'mode: sphere',
    'mode: flythrough',
  ])('4 モードの分岐マーカー "%s" を含む', (marker) => {
    expect(COSMIC_FIELD_SHADER).toContain(marker);
  });

  it('child shader image を宣言する', () => {
    expect(COSMIC_FIELD_SHADER).toContain('uniform shader image;');
  });

  it('main エントリポイントを持つ', () => {
    expect(COSMIC_FIELD_SHADER).toContain('vec4 main(vec2 fragCoord)');
  });

  it('image.eval でテクスチャをサンプルする', () => {
    expect(COSMIC_FIELD_SHADER).toContain('image.eval');
  });

  it('FBM/noise を含まない（惑星シェーダーからのコピペ混入防止）', () => {
    expect(COSMIC_FIELD_SHADER).not.toContain('fbm');
    expect(COSMIC_FIELD_SHADER).not.toContain('float noise(');
  });
});
