export interface AppStoreReview {
  id: string;
  stars: number;
  body: string;
  author: string;
}

export const APP_STORE_REVIEWS: readonly AppStoreReview[] = [
  {
    id: 'suzumoto',
    stars: 5,
    body: '自分を高めるための泥臭い努力に、彩りを加えてくれます。',
    author: 'すずもと@禁欲',
  },
  {
    id: 'lagoonman',
    stars: 5,
    body: 'ホーム画面に時間が出せるのが良い。',
    author: 'ラグーンマン',
  },
];
