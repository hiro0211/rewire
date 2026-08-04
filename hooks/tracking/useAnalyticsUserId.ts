import { useEffect } from 'react';

import { analyticsClient } from '@/lib/tracking/analyticsClient';

/**
 * アプリ内ユーザーIDを Analytics の User-ID として設定する。
 *
 * これが無いと BigQuery の `user_id` 列が全行 NULL になり、追跡できるのは
 * `user_pseudo_id`（端末単位・再インストールで別人になる）だけになる。
 * 「一人のユーザーが何日目に離脱したか」を出すにはこの列が要る。
 *
 * 送るのは `Crypto.randomUUID()` で作られたアプリ内の乱数UUID（36文字、
 * GA4 の User-ID 上限256文字内）のみで、個人を直接特定する情報は含まない。
 *
 * @param userId ログイン中ユーザーのID。未作成・リセット後は null。
 */
export function useAnalyticsUserId(userId: string | null): void {
  useEffect(() => {
    analyticsClient.setUserId(userId);
  }, [userId]);
}
