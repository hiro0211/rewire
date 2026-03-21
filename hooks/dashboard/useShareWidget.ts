import { useRef, useCallback } from 'react';
import { Share } from 'react-native';
import { useStreak } from '@/hooks/dashboard/useStreak';
import { useStopwatch } from '@/hooks/dashboard/useStopwatch';
import { buildShareText } from '@/lib/share/shareService';
import { analyticsClient } from '@/lib/tracking/analyticsClient';
import { logger } from '@/lib/logger';
import { useLocale } from '@/hooks/useLocale';

export function useShareWidget() {
  const viewShotRef = useRef<any>(null);
  const { streakStartDate } = useStreak();
  const stopwatch = useStopwatch(streakStartDate);
  const { isJapanese } = useLocale();

  const share = useCallback(async () => {
    analyticsClient.logEvent('share_tapped');

    const text = buildShareText(stopwatch, isJapanese);

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
        const { shareWithImage } = require('@/lib/share/shareImage');
        await shareWithImage(text, fileUri);
        // クリップボードにもコピー（利便性のため、失敗しても無視）
        try {
          const { copyToClipboard } = require('@/lib/share/clipboardService');
          await copyToClipboard(text);
        } catch {
          // best-effort
        }
        return;
      } catch (e: any) {
        if (e?.message?.includes('ERR_ABORTED')) return;
        logger.warn('Share', 'Image share failed, falling back to text', e);
      }
    }

    await Share.share({ message: text });
  }, [stopwatch, isJapanese]);

  return { viewShotRef, share };
}
