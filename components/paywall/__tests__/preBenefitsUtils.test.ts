import { calcTargetDate } from '../preBenefitsUtils';
import { BENEFIT_SECTIONS, BENEFIT_TAGS, FEATURE_ITEMS } from '@/constants/preBenefits';

describe('preBenefitsUtils', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-15T12:00:00Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('calcTargetDate', () => {
    it('goalDaysを加算した日付文字列を返す', () => {
      const today = new Date();
      const result = calcTargetDate(30);
      // 「YYYY年M月D日」形式であること
      expect(result).toMatch(/^\d{4}年\d{1,2}月\d{1,2}日$/);
    });

    it('30日後の正しい日付を返す', () => {
      // 2026-01-15 + 30日 = 2026-02-14
      expect(calcTargetDate(30)).toBe('2026年2月14日');
    });

    it('90日後の正しい日付を返す', () => {
      // 2026-01-15 + 90日 = 2026-04-15
      expect(calcTargetDate(90)).toBe('2026年4月15日');
    });

    it('0日の場合は今日の日付を返す', () => {
      expect(calcTargetDate(0)).toBe('2026年1月15日');
    });
  });
});

describe('preBenefits constants', () => {
  describe('BENEFIT_SECTIONS', () => {
    it('4つのセクションが定義されている', () => {
      expect(BENEFIT_SECTIONS).toHaveLength(4);
    });

    it('各セクションが必須フィールドを持つ', () => {
      BENEFIT_SECTIONS.forEach((section) => {
        expect(section).toHaveProperty('id');
        expect(section).toHaveProperty('titleKey');
        expect(section).toHaveProperty('benefits');
        expect(section).toHaveProperty('emoji');
        expect(section.titleKey).toBeTruthy();
        expect(section.benefits.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('各ベネフィットにはemoji, boldKey, textKeyがある', () => {
      BENEFIT_SECTIONS.forEach((section) => {
        section.benefits.forEach((benefit) => {
          expect(benefit).toHaveProperty('emoji');
          expect(benefit).toHaveProperty('boldKey');
          expect(benefit).toHaveProperty('textKey');
        });
      });
    });
  });

  describe('BENEFIT_TAGS', () => {
    it('6つ以上のタグが定義されている', () => {
      expect(BENEFIT_TAGS.length).toBeGreaterThanOrEqual(6);
    });

    it('各タグにlabelKeyとcolorがある', () => {
      BENEFIT_TAGS.forEach((tag) => {
        expect(tag).toHaveProperty('labelKey');
        expect(tag).toHaveProperty('color');
        expect(tag.labelKey).toBeTruthy();
      });
    });
  });

  describe('FEATURE_ITEMS', () => {
    it('3つ以上の機能がある', () => {
      expect(FEATURE_ITEMS.length).toBeGreaterThanOrEqual(3);
    });

    it('各機能にemoji, titleKey, descriptionKeyがある', () => {
      FEATURE_ITEMS.forEach((f) => {
        expect(f).toHaveProperty('emoji');
        expect(f).toHaveProperty('titleKey');
        expect(f).toHaveProperty('descriptionKey');
      });
    });

    it('ストリーク記録のキーが含まれている（実装済み機能）', () => {
      const titleKeys = FEATURE_ITEMS.map((f) => f.titleKey);
      expect(titleKeys).toContain('preBenefits.features.streakTracking.title');
    });
  });

  describe('BENEFIT_SECTIONS - キー構造', () => {
    it('セクション4のキーが正しく設定されている', () => {
      const section4 = BENEFIT_SECTIONS.find((s) => s.id === 'real_relationships');
      expect(section4).toBeDefined();
      const boldKeys = section4!.benefits.map((b) => b.boldKey);
      expect(boldKeys).toContain('preBenefits.sections.realRelationships.faceEmotions.bold');
      expect(boldKeys).toContain('preBenefits.sections.realRelationships.becomeTrustworthy.bold');
    });
  });
});
