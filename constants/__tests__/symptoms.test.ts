import { SYMPTOM_CATEGORIES, ALL_SYMPTOM_IDS } from '../symptoms';

describe('symptoms constants', () => {
  it('3つのカテゴリが定義されている', () => {
    expect(SYMPTOM_CATEGORIES).toHaveLength(3);
  });

  it('各カテゴリにid, titleKey, itemsが存在する', () => {
    SYMPTOM_CATEGORIES.forEach((cat) => {
      expect(cat.id).toBeTruthy();
      expect(cat.titleKey).toBeTruthy();
      expect(cat.items.length).toBeGreaterThan(0);
    });
  });

  it('全症状IDがユニークである', () => {
    const uniqueIds = new Set(ALL_SYMPTOM_IDS);
    expect(uniqueIds.size).toBe(ALL_SYMPTOM_IDS.length);
  });

  it('全症状アイテムが14個である', () => {
    expect(ALL_SYMPTOM_IDS).toHaveLength(14);
  });

  it('各カテゴリのIDが正しい', () => {
    const categoryIds = SYMPTOM_CATEGORIES.map((cat) => cat.id);
    expect(categoryIds).toEqual(['mental', 'physical', 'emotional']);
  });

  it('各症状アイテムにidとlabelKeyが存在する', () => {
    SYMPTOM_CATEGORIES.forEach((cat) => {
      cat.items.forEach((item) => {
        expect(item.id).toBeTruthy();
        expect(item.labelKey).toBeTruthy();
      });
    });
  });
});
