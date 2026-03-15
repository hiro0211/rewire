import { useRef, useCallback } from 'react';
import { Share } from 'react-native';
import { useStreak } from '@/hooks/dashboard/useStreak';
import { useStopwatch } from '@/hooks/dashboard/useStopwatch';
import { buildShareText } from '@/lib/share/shareService';
import { analyticsClient } from '@/lib/tracking/analyticsClient';
import { logger } from '@/lib/logger';

export function useShareWidget() {
  const viewShotRef = useRef<any>(null);
  const { streakStartDate } = useStreak();
  const stopwatch = useStopwatch(streakStartDate);

  const share = useCallback(async () => {
    analyticsClient.logEvent('share_tapped');

    const text = buildShareText(stopwatch);

    let fileUri: string | undefined;
    try {
      if (typeof viewShotRef.current?.capture === 'function') {
        fileUri = await viewShotRef.current.capture();
      }
    } catch (e) {
      logger.warn('Share', 'ViewShot capture failed', e);
    }

    if (fileUri) {
      try {
        // 遅延読み込み: ネイティブモジュール未ビルド時のクラッシュを防止
        const { copyToClipboard } = require('@/lib/share/clipboardService');
        const { shareImageFile } = require('@/lib/share/shareImage');
        await copyToClipboard(text);
        await shareImageFile(fileUri);
        return; // 画像シェア成功時のみ早期終了
      } catch (e: any) {
        // ユーザーがシェアをキャンセルした場合はフォールバック不要
        if (e?.message?.includes('ERR_ABORTED')) return;
        logger.warn('Share', 'Image share failed, falling back to text', e);
      }
    }

    await Share.share({ message: text });
  }, [stopwatch]);

  return { viewShotRef, share };
}
