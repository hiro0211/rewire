import { ja } from '@/locales/ja';
import { en } from '@/locales/en';

/**
 * A案ペイウォール（cosmic）専用のコピー群。
 * 既存 paywall 直下のキーは A/B の対照群として残すため、ここには含めない。
 */
const EXPECTED_COSMIC_KEYS = [
  'headlineTop',
  'headlineBottom',
  'body',
  'billingNoteMonthly',
  'billingNoteAnnual',
].sort();

function sortedKeys(block: Record<string, string>): string[] {
  return Object.keys(block).sort();
}

/** i18n-js の補間記法 {{name}} を抽出する。出現順の差は問わないためソートして返す */
function extractPlaceholders(text: string): string[] {
  return (text.match(/\{\{\w+\}\}/g) ?? []).sort();
}

function emptyValueKeys(block: Record<string, string>): string[] {
  return Object.entries(block)
    .filter(([, value]) => value.trim() === '')
    .map(([key]) => key);
}

describe('paywall.cosmic のコピー', () => {
  const jaCosmic: Record<string, string> = ja.paywall.cosmic;
  const enCosmic: Record<string, string> = en.paywall.cosmic;

  it('ja に A案ペイウォール用のキーが揃っているとき、キー集合が期待値と一致する', () => {
    expect(sortedKeys(jaCosmic)).toEqual(EXPECTED_COSMIC_KEYS);
  });

  it('ja と en のキー集合が完全一致する', () => {
    expect(sortedKeys(enCosmic)).toEqual(sortedKeys(jaCosmic));
  });

  it('ja の全ての値が空文字でない', () => {
    expect(emptyValueKeys(jaCosmic)).toEqual([]);
  });

  it('en の全ての値が空文字でない', () => {
    expect(emptyValueKeys(enCosmic)).toEqual([]);
  });

  // 順序ではなく集合で比べる。語順は言語ごとに違ってよく（英語は
  // "¥680/month starting Aug 18."、日本語は「8月18日から ¥680／月。」）、
  // 順序一致を要求すると英語を日本語の語順に歪める＝翻訳調を強制することになる。
  it('補間プレースホルダを含むキーが ja と en で同じプレースホルダを持つ', () => {
    const mismatches = Object.keys(jaCosmic).filter(
      (key) =>
        extractPlaceholders(jaCosmic[key]).sort().join(',') !==
        extractPlaceholders(enCosmic[key] ?? '')
          .sort()
          .join(','),
    );
    expect(mismatches).toEqual([]);
  });

  it('請求日と価格を差し込むキーが {{date}} と {{price}} の両方を持つ', () => {
    const interpolatedKeys = [
              'billingNoteMonthly',
      'billingNoteAnnual',
    ];
    const incomplete = interpolatedKeys.filter(
      (key) =>
        extractPlaceholders(jaCosmic[key]).sort().join(',') !== '{{date}},{{price}}',
    );
    expect(incomplete).toEqual([]);
  });
});
