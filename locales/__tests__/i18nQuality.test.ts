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
function extractVariables(text: string): string[] {
  const matches = text.match(/\{\{(\w+)\}\}/g) ?? [];
  return matches.map((m) => m.replace(/[{}]/g, '')).sort();
}

/** 日本語文字を含むか判定（ひらがな・カタカナ・漢字・全角記号） */
function containsJapanese(text: string): boolean {
  return /[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uFF00-\uFFEF]/.test(text);
}

describe('翻訳品質の静的解析', () => {
  const jaEntries = flattenEntries(ja);
  const enEntries = flattenEntries(en);
  const enMap = new Map(enEntries.map((e) => [e.key, e.value]));
  const jaMap = new Map(jaEntries.map((e) => [e.key, e.value]));

  describe('補間変数の一致', () => {
    it('jaとenで{{variable}}の変数名が完全一致すること', () => {
      const mismatches: { key: string; jaVars: string[]; enVars: string[] }[] = [];

      for (const { key, value: jaValue } of jaEntries) {
        const enValue = enMap.get(key);
        if (!enValue) continue;

        const jaVars = extractVariables(jaValue);
        const enVars = extractVariables(enValue);

        if (JSON.stringify(jaVars) !== JSON.stringify(enVars)) {
          mismatches.push({ key, jaVars, enVars });
        }
      }

      expect(mismatches).toEqual([]);
    });
  });

  describe('英語翻訳に日本語が混入していないこと', () => {
    // localePicker.ja は '日本語' が正しい値なので許可
    const allowedKeys = ['localePicker.ja'];

    it('en.tsの値にひらがな・カタカナ・漢字が含まれないこと', () => {
      const contaminated: { key: string; value: string }[] = [];

      for (const { key, value } of enEntries) {
        if (allowedKeys.includes(key)) continue;
        if (containsJapanese(value)) {
          contaminated.push({ key, value });
        }
      }

      expect(contaminated).toEqual([]);
    });
  });

  describe('翻訳値がキー名と同一でないこと（プレースホルダー検出）', () => {
    it('en.tsの値がドット記法のキー名そのままでないこと', () => {
      const placeholders: { key: string; value: string }[] = [];

      for (const { key, value } of enEntries) {
        if (value === key) {
          placeholders.push({ key, value });
        }
      }

      expect(placeholders).toEqual([]);
    });

    it('ja.tsの値がドット記法のキー名そのままでないこと', () => {
      const placeholders: { key: string; value: string }[] = [];

      for (const { key, value } of jaEntries) {
        if (value === key) {
          placeholders.push({ key, value });
        }
      }

      expect(placeholders).toEqual([]);
    });
  });

  describe('改行の一致', () => {
    // レッスンや法律文書などの長文コンテンツは除外（散文のため改行差は自然）
    const longFormKeyPatterns = [/^lessons\./, /^legal\./];

    it('jaとenで改行数の差が±2以内であること', () => {
      const largeDiffs: { key: string; jaNewlines: number; enNewlines: number }[] = [];

      for (const { key, value: jaValue } of jaEntries) {
        if (longFormKeyPatterns.some((p) => p.test(key))) continue;
        const enValue = enMap.get(key);
        if (!enValue) continue;

        const jaNewlines = (jaValue.match(/\n/g) ?? []).length;
        const enNewlines = (enValue.match(/\n/g) ?? []).length;

        if (Math.abs(jaNewlines - enNewlines) >= 2) {
          largeDiffs.push({ key, jaNewlines, enNewlines });
        }
      }

      expect(largeDiffs).toEqual([]);
    });
  });
});
