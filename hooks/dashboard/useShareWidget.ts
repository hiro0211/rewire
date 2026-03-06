import { useRef, useCallback } from 'react';
import { Share } from 'react-native';
import { useStreak } from '@/hooks/dashboard/useStreak';
import { useStopwatch } from '@/hooks/dashboard/useStopwatch';
import { buildShareText } from '@/lib/share/shareService';
import { shareImageFile } from '@/lib/share/shareImage';
import { copyToClipboard } from '@/lib/share/clipboardService';
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
      await copyToClipboard(text);
      try {
        await shareImageFile(fileUri);
      } catch {
        // ユーザーがシェアをキャンセルした場合など
      }
      return;
    }

    await Share.share({ message: text });
  }, [stopwatch]);

  return { viewShotRef, share };
}
