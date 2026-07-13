import { useCallback, useEffect, useRef } from 'react';
import { useShieldActivation } from '@/hooks/screenTime/useShieldActivation';
import { useScreenTimeStore } from '@/stores/screenTimeStore';
import { useToast } from '@/hooks/ui/useToast';
import { analyticsClient } from '@/lib/tracking/analyticsClient';
import { BLOCKER_ACTIVATION_ADVANCE_DELAY_MS } from '@/constants/postPurchaseOnboarding';

interface UseBlockerActivationStepResult {
  enabled: boolean;
  isBusy: boolean;
  toastVisible: boolean;
  handlePress: () => Promise<void>;
}

/**
 * 課金後オンボーディングのブロック開始ステップのロジック。
 * ユーザーがブロックボタンを押すと、シールドを適用（触覚フィードバック付き）し、
 * 完了トーストを表示したうえで一定時間後に自動で次のステップへ進む。
 */
export function useBlockerActivationStep(
  onComplete: () => void,
): UseBlockerActivationStepResult {
  const enabled = useScreenTimeStore((s) => s.enabled);
  const { isBusy, activate } = useShieldActivation();
  const toast = useToast(BLOCKER_ACTIVATION_ADVANCE_DELAY_MS);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    },
    [],
  );

  const handlePress = useCallback(async () => {
    // 成功後の自動遷移が予約済みなら、以降の押下は無視する
    if (advanceTimerRef.current) return;

    const ok = await activate();
    if (!ok) return;

    analyticsClient.logEvent('post_purchase_blocker_activated');
    toast.show();
    advanceTimerRef.current = setTimeout(
      onComplete,
      BLOCKER_ACTIVATION_ADVANCE_DELAY_MS,
    );
  }, [activate, toast, onComplete]);

  return { enabled, isBusy, toastVisible: toast.visible, handlePress };
}
