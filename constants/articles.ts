export interface Article {
  id: string;
  titleKey: string;
  categoryKey: string;
  readTime: number; // minutes
  contentKey: string;
}

export const ARTICLES: Article[] = [
  {
    id: '1',
    titleKey: 'articles.article1.title',
    categoryKey: 'articles.article1.category',
    readTime: 3,
    contentKey: 'articles.article1.title',
  },
  {
    id: '2',
    titleKey: 'articles.article2.title',
    categoryKey: 'articles.article2.category',
    readTime: 5,
    contentKey: 'articles.article2.title',
  },
  {
    id: '3',
    titleKey: 'articles.article3.title',
    categoryKey: 'articles.article3.category',
    readTime: 4,
    contentKey: 'articles.article3.title',
  },
  {
    id: '4',
    titleKey: 'articles.article4.title',
    categoryKey: 'articles.article4.category',
    readTime: 3,
    contentKey: 'articles.article4.title',
  },
];
