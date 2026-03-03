import { SHARE_HASHTAG } from '@/constants/share';
import {
  formatStopwatchTime,
  type StopwatchTime,
} from '@/lib/stats/statsCalculator';

export function buildShareText(time: StopwatchTime): string {
  return `${SHARE_HASHTAG} ポルノ禁${formatStopwatchTime(time)} 💪`;
}
