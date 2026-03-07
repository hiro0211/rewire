import { useRef, useCallback } from 'react';
import { Share } from 'react-native';
import { useStreak } from '@/hooks/dashboard/useStreak';
import { useStopwatch } from '@/hooks/dashboard/useStopwatch';
import { buildShareText } from '@/lib/share/shareService';
import { analyticsClient } from '@/lib/tracking/analyticsClient';

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
    } catch {
      // キャプチャ失敗時はテキストのみでシェアを続行
    }

    if (fileUri) {
      try {
        // 遅延読み込み: ネイティブモジュール未ビルド時のクラッシュを防止
        const { copyToClipboard } = require('@/lib/share/clipboardService');
        const { shareImageFile } = require('@/lib/share/shareImage');
        await copyToClipboard(text);
        await shareImageFile(fileUri);
      } catch {
        // ネイティブモジュール未対応 or ユーザーがシェアをキャンセルした場合
      }
      return;
    }

    await Share.share({ message: text });
  }, [stopwatch]);

  return { viewShotRef, share };
}
