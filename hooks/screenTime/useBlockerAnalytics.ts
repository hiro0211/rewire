import { useCallback } from 'react';

import type { BlockerEnableSource } from '@/constants/analyticsEvents';
import { hoursEnabled } from '@/lib/screenTime/blockerDuration';
import { trackEvent } from '@/lib/tracking/trackEvent';
import { useScreenTimeStore } from '@/stores/screenTimeStore';

interface UseBlockerAnalyticsResult {
  trackEnabled: (source: BlockerEnableSource) => void;
  trackDisableRequested: () => void;
  trackDisableConfirmed: () => void;
  trackDisableCancelled: () => void;
}

/**
 * コンテンツブロッカーの利用と離脱を計測する。
 *
 * 目的は「ポルノ禁をどれくらいで挫折しているか」を出すこと。ブロックを ON に
 * した人が、何時間持ちこたえて、解除に向かったのかを追う。
 *
 * 解除フローには3呼吸のゲートが挟まっているので、3点に分けて送る:
 *   - requested : 解除ボタンを押した（＝やめたくなった瞬間）
 *   - confirmed : ゲートを越えて実際に解除した（＝挫折）
 *   - cancelled : ゲートで思いとどまった（＝踏みとどまった）
 *
 * cancelled ÷ requested がゲートの引き止め率になる。confirmed だけを送ると、
 * 「押したが解除しなかった人」が丸ごと消えて、ゲートの効果が測れなくなる。
 */
export function useBlockerAnalytics(): UseBlockerAnalyticsResult {
  const lastShieldedAt = useScreenTimeStore((s) => s.lastShieldedAt);

  const durationParams = useCallback(() => {
    const hours = hoursEnabled(lastShieldedAt);
    return hours === null ? {} : { hours_enabled: hours };
  }, [lastShieldedAt]);

  return {
    trackEnabled: useCallback((source: BlockerEnableSource) => {
      trackEvent('blocker_enabled', { source });
    }, []),

    trackDisableRequested: useCallback(() => {
      trackEvent('blocker_disable_requested', durationParams());
    }, [durationParams]),

    trackDisableConfirmed: useCallback(() => {
      trackEvent('blocker_disable_confirmed', durationParams());
    }, [durationParams]),

    trackDisableCancelled: useCallback(() => {
      trackEvent('blocker_disable_cancelled', durationParams());
    }, [durationParams]),
  };
}
