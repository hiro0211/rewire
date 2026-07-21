import {
  COSMIC_FIELD_CONFIG,
  DEFAULT_COSMIC_FIELD_CONFIG,
  getCosmicFieldConfig,
  type CosmicFieldConfig,
} from '@/constants/cosmic/cosmicFieldConfig';
import { COSMIC_BADGE_IDS } from '@/constants/cosmic/cosmicTextureMap';

describe('cosmicFieldConfig', () => {
  it('全 cosmic バッジ 8 種にエントリがある', () => {
    for (const id of COSMIC_BADGE_IDS) {
      expect(COSMIC_FIELD_CONFIG[id]).toBeDefined();
    }
    expect(Object.keys(COSMIC_FIELD_CONFIG)).toHaveLength(8);
  });

  describe('各値が妥当なレンジ内', () => {
    const entries = Object.entries(COSMIC_FIELD_CONFIG) as [
      string,
      CosmicFieldConfig,
    ][];

    it.each(entries)('%s の各パラメータがレンジ内', (_id, cfg) => {
      expect(cfg.zoom).toBeGreaterThanOrEqual(1.0);
      expect(cfg.rotationSpeed).toBeGreaterThanOrEqual(0);
      expect(cfg.driftSpeed).toBeGreaterThanOrEqual(0);
      expect(cfg.coreBrightness).toBeGreaterThanOrEqual(0);
      expect(cfg.coreBrightness).toBeLessThanOrEqual(1);
      expect(cfg.edgeSoftness).toBeGreaterThan(0);
      expect(cfg.edgeSoftness).toBeLessThan(1);
      expect(cfg.tintStrength).toBeGreaterThanOrEqual(0);
      expect(cfg.tintStrength).toBeLessThanOrEqual(1);
    });
  });

  describe('getCosmicFieldConfig', () => {
    it.each(COSMIC_BADGE_IDS)('%s は専用の config を返す', (id) => {
      expect(getCosmicFieldConfig(id)).toBe(COSMIC_FIELD_CONFIG[id]);
    });

    it('未知の惑星バッジは DEFAULT を返す', () => {
      expect(getCosmicFieldConfig('earth')).toBe(DEFAULT_COSMIC_FIELD_CONFIG);
    });

    it('undefined は DEFAULT を返す', () => {
      expect(getCosmicFieldConfig(undefined)).toBe(DEFAULT_COSMIC_FIELD_CONFIG);
    });
  });

  it('中心が光る天体（protostar/whiteDwarf）の coreBrightness は cosmos より大きい', () => {
    expect(COSMIC_FIELD_CONFIG.protostar.coreBrightness).toBeGreaterThan(
      COSMIC_FIELD_CONFIG.cosmos.coreBrightness,
    );
    expect(COSMIC_FIELD_CONFIG.whiteDwarf.coreBrightness).toBeGreaterThan(
      COSMIC_FIELD_CONFIG.cosmos.coreBrightness,
    );
  });

  describe('motionMode（3D 立体モーション）', () => {
    const VALID_MODES = ['parallax', 'disk', 'sphere', 'flythrough'];

    it.each(COSMIC_BADGE_IDS)('%s は有効な motionMode を持つ', (id) => {
      expect(VALID_MODES).toContain(COSMIC_FIELD_CONFIG[id].motionMode);
    });

    it('天体ごとのモード割当が意図通り', () => {
      expect(COSMIC_FIELD_CONFIG.galaxy.motionMode).toBe('disk');
      expect(COSMIC_FIELD_CONFIG.stellarSystem.motionMode).toBe('disk');
      expect(COSMIC_FIELD_CONFIG.starCluster.motionMode).toBe('sphere');
      expect(COSMIC_FIELD_CONFIG.stardust.motionMode).toBe('sphere');
      expect(COSMIC_FIELD_CONFIG.whiteDwarf.motionMode).toBe('sphere');
      expect(COSMIC_FIELD_CONFIG.cosmos.motionMode).toBe('flythrough');
      expect(COSMIC_FIELD_CONFIG.nebula.motionMode).toBe('parallax');
      expect(COSMIC_FIELD_CONFIG.protostar.motionMode).toBe('parallax');
    });

    it.each(Object.entries(COSMIC_FIELD_CONFIG))(
      '%s のモーションパラメータがレンジ内',
      (_id, cfg) => {
        expect(cfg.tilt).toBeGreaterThanOrEqual(0);
        expect(cfg.tilt).toBeLessThan(Math.PI / 2);
        expect(cfg.zoomMax).toBeGreaterThanOrEqual(1);
        expect(cfg.zoomRate).toBeGreaterThanOrEqual(0);
        expect(cfg.parallaxStrength).toBeGreaterThanOrEqual(0);
        expect(cfg.parallaxStrength).toBeLessThanOrEqual(1);
        expect(cfg.swaySpeed).toBeGreaterThanOrEqual(0);
      },
    );

    it('DEFAULT_COSMIC_FIELD_CONFIG も motionMode を持つ', () => {
      expect(VALID_MODES).toContain(DEFAULT_COSMIC_FIELD_CONFIG.motionMode);
    });
  });
});
