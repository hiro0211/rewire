import { useEffect } from 'react';

import { resolvePaywallVariant } from '@/lib/paywall/resolvePaywallVariant';
import { analyticsClient } from '@/lib/tracking/analyticsClient';

/**
 * ペイウォールA/Bの割当を GA4 のユーザープロパティに映す。
 *
 * イベント側の `paywall_variant` パラメータと同名にしてあるので、BigQuery で
 * 「表示・離脱・購入」をイベントで見るときも、購入後のリテンションや解約を
 * ユーザー単位で見るときも、同じ列名のまま書ける。
 *
 * ⚠️ A/B の分母は必ず `paywall_viewed` の param 側で取ること。
 *    setUserProperty は非同期のネイティブ呼び出しで、しかも GA4 のユーザー
 *    プロパティは「設定後に送られたイベント」にしか付かない。起動直後に
 *    ペイウォールが出る導線では、表示イベントに間に合う保証がない。
 */
export function usePaywallVariantUserProperty(userId: string | null): void {
  useEffect(() => {
    // 未ハイドレートの一瞬に fallback の 'default' を焼き付けると、実際は
    // cosmicJourney のユーザーが default 側の母数に混ざる。id が入るまで待つ。
    if (!userId) return;

    analyticsClient.setUserProperty('paywall_variant', resolvePaywallVariant(userId));
  }, [userId]);
}
