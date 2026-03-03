import { useRef, useCallback } from 'react';
import { Share, Platform } from 'react-native';
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

    let fileUri: string | undefined;
    try {
      if (typeof viewShotRef.current?.capture === 'function') {
        fileUri = await viewShotRef.current.capture();
      }
    } catch {
      // キャプチャ失敗時はテキストのみでシェアを続行
    }

    const text = buildShareText(stopwatch);
    const shareOptions: { message: string; url?: string } = { message: text };
    if (fileUri && Platform.OS === 'ios') {
      shareOptions.url = `file://${fileUri}`;
    }
    await Share.share(shareOptions);
  }, [stopwatch]);

  return { viewShotRef, share };
}
