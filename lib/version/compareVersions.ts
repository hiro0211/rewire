/**
 * セマンティックバージョン比較（"2.2.0" 形式）。
 *
 * current < required のとき true。パース不能な入力は false を返す
 * （フェイルオープン: 判定できない場合にアプリを誤ってブロックしない）。
 */
export function isVersionLessThan(current: string, required: string): boolean {
  const a = parse(current);
  const b = parse(required);
  if (!a || !b) return false;

  const length = Math.max(a.length, b.length);
  for (let i = 0; i < length; i++) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    if (x < y) return true;
    if (x > y) return false;
  }
  return false;
}

function parse(version: string): number[] | null {
  if (!version) return null;
  const parts = version.trim().split('.');
  const numbers = parts.map((p) => Number(p));
  if (numbers.some((n) => !Number.isInteger(n) || n < 0)) return null;
  return numbers;
}
