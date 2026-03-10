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
        expect(section).toHaveProperty('title');
        expect(section).toHaveProperty('benefits');
        expect(section).toHaveProperty('emoji');
        expect(section.title).toBeTruthy();
        expect(section.benefits.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('各ベネフィットにはemoji, bold, textがある', () => {
      BENEFIT_SECTIONS.forEach((section) => {
        section.benefits.forEach((benefit) => {
          expect(benefit).toHaveProperty('emoji');
          expect(benefit).toHaveProperty('bold');
          expect(benefit).toHaveProperty('text');
        });
      });
    });
  });

  describe('BENEFIT_TAGS', () => {
    it('6つ以上のタグが定義されている', () => {
      expect(BENEFIT_TAGS.length).toBeGreaterThanOrEqual(6);
    });

    it('各タグにlabelとcolorがある', () => {
      BENEFIT_TAGS.forEach((tag) => {
        expect(tag).toHaveProperty('label');
        expect(tag).toHaveProperty('color');
        expect(tag.label).toBeTruthy();
      });
    });
  });

  describe('FEATURE_ITEMS', () => {
    it('3つ以上の機能がある', () => {
      expect(FEATURE_ITEMS.length).toBeGreaterThanOrEqual(3);
    });

    it('各機能にemoji, title, descriptionがある', () => {
      FEATURE_ITEMS.forEach((f) => {
        expect(f).toHaveProperty('emoji');
        expect(f).toHaveProperty('title');
        expect(f).toHaveProperty('description');
      });
    });

    it('SNSフリクション介入が含まれていない（未実装機能）', () => {
      const titles = FEATURE_ITEMS.map((f) => f.title);
      expect(titles).not.toContain('SNSフリクション介入');
    });

    it('ストリーク記録が含まれている（実装済み機能）', () => {
      const titles = FEATURE_ITEMS.map((f) => f.title);
      expect(titles).toContain('ストリーク記録');
    });
  });

  describe('BENEFIT_SECTIONS - 自然な日本語', () => {
    it('セクション4の表現が自然な日本語になっている', () => {
      const section4 = BENEFIT_SECTIONS.find((s) => s.id === 'real_relationships');
      expect(section4).toBeDefined();
      const boldTexts = section4!.benefits.map((b) => b.bold);
      expect(boldTexts).toContain('自分の感情');
      expect(boldTexts).toContain('大切な人');
      expect(boldTexts).not.toContain('感情的知性');
      expect(boldTexts).not.toContain('本物の親密さ');
    });
  });
});
