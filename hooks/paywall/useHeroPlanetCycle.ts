import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import type { BadgeId } from '@/constants/badges/BadgeId';
import {
  HERO_PLANET_BADGE_IDS,
  HERO_PLANET_INTERVAL_MS,
} from '@/constants/paywall/heroPlanets';

/**
 * ヒーロー天体を一定間隔で次の惑星に送る。
 *
 * バックグラウンドで止めるのは、見えていない画面でタイマーを回しても無意味なうえ、
 * 復帰した瞬間に溜まった分が一気に進んでちらつくため（useOrbBreathing と同じ方針）。
 */
export function useHeroPlanetCycle(): BadgeId {
  const [index, setIndex] = useState(0);
  const isActive = useRef(true);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      isActive.current = state === 'active';
    });
    // `?.` を付けるのは、購読オブジェクトを返さない実装が存在するため。
    // 素の `sub.remove()` はアンマウント時に投げ、cleanup の例外は
    // ErrorBoundary でも拾えない（描画ではないので画面ごと壊れる）。
    return () => sub?.remove();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isActive.current) return;
      setIndex((i) => (i + 1) % HERO_PLANET_BADGE_IDS.length);
    }, HERO_PLANET_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  return HERO_PLANET_BADGE_IDS[index];
}
