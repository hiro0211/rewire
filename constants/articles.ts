export interface Article {
  id: string;
  title: string;
  category: string;
  readTime: number; // minutes
  isLocked: boolean;
  content: string; // Markdown or simple text
}

export const ARTICLES: Article[] = [
  {
    id: '1',
    title: 'ドーパミンと報酬系：なぜやめられないのか？',
    category: '脳科学',
    readTime: 3,
    isLocked: false,
    content: `
ポルノ依存の背後には「ドーパミン」という脳内物質が深く関わっています。
... (本文プレビュー)
    `,
  },
  {
    id: '2',
    title: '「ハビットループ」を理解する',
    category: '習慣形成',
    readTime: 5,
    isLocked: false,
    content: `
習慣は「きっかけ」「行動」「報酬」の3つの要素で構成されています。
... (本文プレビュー)
    `,
  },
  {
    id: '3',
    title: '前頭前皮質の回復と自制心',
    category: '脳科学',
    readTime: 4,
    isLocked: true, // Pro only
    content: `
ポルノ視聴を続けると、理性を司る前頭前皮質の機能が低下することが研究で示唆されています。
... (本文プレビュー)
    `,
  },
  {
    id: '4',
    title: '衝動を乗り越える「サーフィン」テクニック',
    category: '実践テクニック',
    readTime: 3,
    isLocked: true,
    content: `
衝動は波のようなものです。抗うのではなく、波に乗るようにやり過ごすテクニックを紹介します。
... (本文プレビュー)
    `,
  },
];
