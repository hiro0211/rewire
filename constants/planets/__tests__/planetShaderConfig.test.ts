import {
  DEFAULT_PLANET_SHADER_CONFIG,
  PLANET_SHADER_CONFIG,
  getPlanetShaderConfig,
} from '@/constants/planets/planetShaderConfig';

describe('PLANET_SHADER_CONFIG', () => {
  it('全 10 惑星に config が定義されている', () => {
    const planets = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'moon', 'sun'] as const;
    for (const id of planets) {
      expect(PLANET_SHADER_CONFIG[id]).toBeDefined();
    }
  });

  describe('cloudOpacity', () => {
    it('Earth は雲層あり (0.35)', () => {
      expect(PLANET_SHADER_CONFIG.earth.cloudOpacity).toBeCloseTo(0.35);
    });

    it('Venus は厚い雲層 (>= 0.5)', () => {
      expect(PLANET_SHADER_CONFIG.venus.cloudOpacity).toBeGreaterThanOrEqual(0.5);
    });

    it('Mercury / Moon / Mars / Sun は雲なし (0)', () => {
      expect(PLANET_SHADER_CONFIG.mercury.cloudOpacity).toBe(0);
      expect(PLANET_SHADER_CONFIG.moon.cloudOpacity).toBe(0);
      expect(PLANET_SHADER_CONFIG.mars.cloudOpacity).toBe(0);
      expect(PLANET_SHADER_CONFIG.sun.cloudOpacity).toBe(0);
    });
  });

  describe('emissive', () => {
    it('Sun のみ emissive=1（自己発光）', () => {
      expect(PLANET_SHADER_CONFIG.sun.emissive).toBe(1);
    });

    it('Sun 以外は emissive=0（陰影あり）', () => {
      for (const id of ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'moon'] as const) {
        expect(PLANET_SHADER_CONFIG[id].emissive).toBe(0);
      }
    });
  });

  describe('atmosphereColor', () => {
    it('Earth は青系 (B > R)', () => {
      const [r, , b] = PLANET_SHADER_CONFIG.earth.atmosphereColor;
      expect(b).toBeGreaterThan(r);
    });

    it('Mars は赤系 (R > B)', () => {
      const [r, , b] = PLANET_SHADER_CONFIG.mars.atmosphereColor;
      expect(r).toBeGreaterThan(b);
    });

    it('全惑星の atmosphereColor は 0-1 の範囲内', () => {
      for (const cfg of Object.values(PLANET_SHADER_CONFIG)) {
        for (const c of cfg.atmosphereColor) {
          expect(c).toBeGreaterThanOrEqual(0);
          expect(c).toBeLessThanOrEqual(1);
        }
      }
    });
  });

  describe('rotationSpeed', () => {
    it('全惑星 > 0（静止しない）', () => {
      for (const cfg of Object.values(PLANET_SHADER_CONFIG)) {
        expect(cfg.rotationSpeed).toBeGreaterThan(0);
      }
    });
  });

  describe('getPlanetShaderConfig', () => {
    it('既知の惑星 ID は対応する config を返す', () => {
      expect(getPlanetShaderConfig('mars')).toBe(PLANET_SHADER_CONFIG.mars);
    });

    it('未定義の ID は DEFAULT_PLANET_SHADER_CONFIG を返す', () => {
      expect(getPlanetShaderConfig('galaxy')).toBe(DEFAULT_PLANET_SHADER_CONFIG);
    });

    it('undefined も DEFAULT を返す', () => {
      expect(getPlanetShaderConfig(undefined)).toBe(DEFAULT_PLANET_SHADER_CONFIG);
    });
  });
});
