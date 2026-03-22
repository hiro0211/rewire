import { I18n } from 'i18n-js';
import { ja } from '@/locales/ja';
import { en } from '@/locales/en';

/** フラットなキー→値マップを作成 */
function flattenEntries(
  obj: Record<string, unknown>,
  prefix = '',
): { key: string; value: string }[] {
  return Object.entries(obj).flatMap(([k, v]) => {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    return typeof v === 'object' && v !== null
      ? flattenEntries(v as Record<string, unknown>, fullKey)
      : [{ key: fullKey, value: v as string }];
  });
}

/** {{variable}} パターンを抽出 */
function extractVariableNames(text: string): string[] {
  const matches = text.match(/\{\{(\w+)\}\}/g) ?? [];
  return matches.map((m) => m.replace(/[{}]/g, ''));
}

/** 日本語文字を含むか判定 */
function containsJapanese(text: string): boolean {
  return /[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uFF00-\uFFEF]/.test(text);
}

describe('英語ランタイム検証', () => {
  // テスト専用のi18nインスタンスを作成
  const i18n = new I18n({ ja, en });
  i18n.locale = 'en';
  i18n.defaultLocale = 'ja';
  i18n.enableFallback = true;

  const enEntries = flattenEntries(en);
  // localePicker.ja は '日本語' が正しい値なので許可
  const allowedJapaneseKeys = ['localePicker.ja'];

  describe('全キーでt()が英語を返すこと', () => {
    it('locale=en設定時に全キーの結果に日本語が含まれないこと', () => {
      const japaneseContaminated: { key: string; result: string }[] = [];

      for (const { key } of enEntries) {
        if (allowedJapaneseKeys.includes(key)) continue;
        const result = i18n.t(key);
        if (containsJapanese(result)) {
          japaneseContaminated.push({ key, result });
        }
      }

      expect(japaneseContaminated).toEqual([]);
    });
  });

  describe('補間付きキーで正しく補間されること', () => {
    it('{{variable}}を含むキーに変数を渡すと結果に{{が残らないこと', () => {
      const unreplaced: { key: string; result: string }[] = [];

      for (const { key, value } of enEntries) {
        const varNames = extractVariableNames(value);
        if (varNames.length === 0) continue;

        // ダミー値を生成
        const options: Record<string, string> = {};
        for (const name of varNames) {
          options[name] = `TEST_${name.toUpperCase()}`;
        }

        const result = i18n.t(key, options);
        if (result.includes('{{')) {
          unreplaced.push({ key, result });
        }
      }

      expect(unreplaced).toEqual([]);
    });

    it('補間結果にダミー値が含まれること', () => {
      const notInterpolated: { key: string; result: string }[] = [];

      for (const { key, value } of enEntries) {
        const varNames = extractVariableNames(value);
        if (varNames.length === 0) continue;

        const options: Record<string, string> = {};
        for (const name of varNames) {
          options[name] = `TEST_${name.toUpperCase()}`;
        }

        const result = i18n.t(key, options);
        for (const name of varNames) {
          if (!result.includes(`TEST_${name.toUpperCase()}`)) {
            notInterpolated.push({ key, result });
            break;
          }
        }
      }

      expect(notInterpolated).toEqual([]);
    });
  });

  describe('missingパターンが出ないこと', () => {
    it('全キーでt()呼び出し時に[missing "..." translation]が含まれないこと', () => {
      const missingTranslations: { key: string; result: string }[] = [];

      for (const { key, value } of enEntries) {
        // 補間変数がある場合はダミー値を渡す
        const varNames = extractVariableNames(value);
        const options: Record<string, string> = {};
        for (const name of varNames) {
          options[name] = `DUMMY_${name}`;
        }

        const result = i18n.t(key, options);
        if (result.includes('[missing') && result.includes('translation]')) {
          missingTranslations.push({ key, result });
        }
      }

      expect(missingTranslations).toEqual([]);
    });
  });
});
