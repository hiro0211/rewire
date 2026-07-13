import { useCallback, useEffect, useRef, useState } from 'react';
import { asyncStorageClient } from '@/lib/storage/asyncStorageClient';
import { useUserStore } from '@/stores/userStore';
import { WHATS_NEW_VERSION } from '@/constants/appUpdates';

/**
 * 「新機能のお知らせ」モーダルの表示判定。
 *
 * アップデートで新方式に切り替わったことを既存ユーザーに一度だけ知らせる。
 * - 既存ユーザー（user あり）かつ未読 → 表示
 * - 新規ユーザー（user なし）→ 表示せず既読として記録
 *   （オンボーディングで新方式をそのまま体験するため告知は不要）
 */
export function useWhatsNewModal(): { visible: boolean; dismiss: () => void } {
  const hasHydrated = useUserStore((s) => s.hasHydrated);
  const user = useUserStore((s) => s.user);
  const [visible, setVisible] = useState(false);
  // Why: state にすると再レンダー→依存変化→cleanup が async 完了前に走り、
  // cancelled=true で表示判定が捨てられる。ref なら再実行もレースも起きない。
  const checkedRef = useRef(false);

  useEffect(() => {
    if (!hasHydrated || checkedRef.current) return;
    checkedRef.current = true;
    let cancelled = false;
    (async () => {
      try {
        const seen = await asyncStorageClient.get<string>(
          'whats_new_seen_version',
        );
        if (cancelled || seen === WHATS_NEW_VERSION) return;
        if (user) {
          setVisible(true);
        } else {
          await asyncStorageClient.set('whats_new_seen_version', WHATS_NEW_VERSION);
        }
      } catch {
        // 判定できないときは表示しない
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hasHydrated, user]);

  const dismiss = useCallback(() => {
    setVisible(false);
    void asyncStorageClient.set('whats_new_seen_version', WHATS_NEW_VERSION);
  }, []);

  return { visible, dismiss };
}
