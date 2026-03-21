import { SHARE_HASHTAG } from '@/constants/share';
import {
  formatStopwatchTime,
  type StopwatchTime,
} from '@/lib/stats/statsCalculator';

export function buildShareText(time: StopwatchTime, isJapanese: boolean = true): string {
  const formatted = formatStopwatchTime(time, isJapanese);
  if (isJapanese) {
    return `${SHARE_HASHTAG} ポルノ禁${formatted} 💪`;
  }
  return `${SHARE_HASHTAG} ${formatted} porn-free 💪`;
}
