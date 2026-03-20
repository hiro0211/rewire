import { ja } from '@/locales/ja';
import { en } from '@/locales/en';

function getKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) =>
    typeof value === 'object' && value !== null
      ? getKeys(value as Record<string, unknown>, `${prefix}${key}.`)
      : [`${prefix}${key}`]
  );
}

describe('翻訳の完全性', () => {
  const jaKeys = getKeys(ja);
  const enKeys = getKeys(en);

  it('jaの全キーがenにも存在する', () => {
    const missing = jaKeys.filter((k) => !enKeys.includes(k));
    expect(missing).toEqual([]);
  });

  it('enの全キーがjaにも存在する', () => {
    const extra = enKeys.filter((k) => !jaKeys.includes(k));
    expect(extra).toEqual([]);
  });

  it('全キーの値が空文字でない（ja）', () => {
    const empty = jaKeys.filter((k) => {
      const parts = k.split('.');
      let val: unknown = ja;
      for (const p of parts) val = (val as Record<string, unknown>)[p];
      return val === '';
    });
    expect(empty).toEqual([]);
  });

  it('全キーの値が空文字でない（en）', () => {
    // These keys are intentionally empty in English (no suffix needed)
    const allowedEmpty = ['lastViewed.monthSuffix', 'lastViewed.daySuffix'];
    const empty = enKeys.filter((k) => {
      if (allowedEmpty.includes(k)) return false;
      const parts = k.split('.');
      let val: unknown = en;
      for (const p of parts) val = (val as Record<string, unknown>)[p];
      return val === '';
    });
    expect(empty).toEqual([]);
  });
});
