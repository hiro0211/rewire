import * as fs from 'fs';
import * as path from 'path';
import { ja } from '@/locales/ja';

/** jaオブジェクトの全キーをフラット化 */
function getKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) =>
    typeof value === 'object' && value !== null
      ? getKeys(value as Record<string, unknown>, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );
}

/** 指定ディレクトリ配下の .ts/.tsx ファイルを再帰取得 */
function collectSourceFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // __tests__ ディレクトリは除外
      if (entry.name === '__tests__' || entry.name === 'node_modules') continue;
      results.push(...collectSourceFiles(fullPath));
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * ソースコードから t('...') / t("...") パターンで使用されている翻訳キーを抽出する。
 * テンプレートリテラル（t(`...`)）は動的キーの可能性があるため除外。
 */
function extractUsedKeys(): string[] {
  const rootDir = path.resolve(__dirname, '..', '..');
  const sourceDirs = ['app', 'components', 'hooks', 'lib', 'features', 'stores'];
  const allFiles = sourceDirs.flatMap((d) => collectSourceFiles(path.join(rootDir, d)));

  const keyPattern = /\bt\(\s*['"]([a-zA-Z0-9_.]+)['"]/g;
  const keys = new Set<string>();

  for (const filePath of allFiles) {
    const content = fs.readFileSync(filePath, 'utf-8');
    let match: RegExpExecArray | null;
    while ((match = keyPattern.exec(content)) !== null) {
      keys.add(match[1]);
    }
  }

  return [...keys];
}

describe('コード内キー参照の検証', () => {
  const allKeys = new Set(getKeys(ja));
  const usedKeys = extractUsedKeys();

  it('ソースコードから翻訳キーを抽出できること', () => {
    expect(usedKeys.length).toBeGreaterThan(0);
  });

  it('コード内で使用されている翻訳キーが全てja.tsに存在すること', () => {
    const missingKeys = usedKeys.filter((key) => !allKeys.has(key));
    expect(missingKeys).toEqual([]);
  });
});
