import type { BadgeId } from '@/constants/badges/BadgeId';

/**
 * ヒーロー天体が順に見せるバッジ。月（7日）から太陽（270日）まで、到達順に並べる。
 *
 * なぜ惑星だけで、星屑・星雲・原始星（0〜3日）を入れないか:
 * 冒頭の3つは deep-sky のぼんやりした雲で、小さく速く切り替わると
 * どれも同じ靄にしか見えない。惑星は模様と色がはっきり違うので、
 * 「別の天体に変わった」と一目で分かる。
 *
 * なぜ太陽で止めるか: 白色矮星以降は再び deep-sky に戻るうえ、
 * 1年以上先の話になる。手が届く範囲を見せたほうが動機づけになる。
 */
export const HERO_PLANET_BADGE_IDS: readonly BadgeId[] = [
  'moon',
  'mercury',
  'venus',
  'earth',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'sun',
];

/**
 * 1つの天体を見せている時間。
 *
 * 短すぎると視線が奪われて本文が読めなくなり、長すぎると「変わる」と気づかれない。
 * フェード（HERO_PLANET_FADE_MS）はこの中に含まれる。
 */
export const HERO_PLANET_INTERVAL_MS = 3000;

/** 切り替え時のフェード片道の時間。切り替わりの瞬間を隠すために使う */
export const HERO_PLANET_FADE_MS = 400;

/**
 * ヒーロー天体の直径。
 *
 * `components/profile/ProfileHeader.tsx` の `size={120}` に揃えている。
 * 画面幅から算出すると端末ごとに大きさが変わり、同じアプリの中で天体の
 * 大きさが場所によって違う状態になる。固定値で揃えるほうが一貫する。
 *
 * ⚠️ AnimatedOrb はグローとパーティクルのために `size * 2.0` の箱を確保するので、
 *    レイアウト上の占有は 240pt になる。ここを上げると本文が押し出される。
 */
export const HERO_ORB_SIZE = 120;
