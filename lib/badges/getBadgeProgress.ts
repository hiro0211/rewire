import { getNextBadge } from './getNextBadge';
import { getBadgeByDay } from './getBadgeByDay';

/** 現在バッジから次バッジへの進捗を0-1で返す。最終到達済みなら1 */
export function getBadgeProgress(days: number): number {
  const next = getNextBadge(days);

  if (next === null) {
    return 1;
  }

  const current = getBadgeByDay(days);
  const range = next.day - current.day;

  if (range === 0) {
    return 0;
  }

  return (days - current.day) / range;
}
