import {
  BADGE_DEFINITIONS,
  type NeuralBadgeDefinition,
} from '@/constants/badges/BADGE_DEFINITIONS';
import type { BadgeId } from '@/constants/badges/BadgeId';
import { getBadgeByDay } from '@/lib/badges/getBadgeByDay';

/**
 * getBadgeByDay に渡せる安全な日数へ丸める。
 *
 * なぜ必要か: getBadgeByDay は負数で RangeError を投げる。ペイウォールで throw すると
 * PaywallErrorBoundary が捕捉して画面を null にし、課金導線が丸ごと消える。
 * 表示崩れより収益断絶のほうが遥かに重いので、不正値は初日（0）に丸めて必ず値を返す。
 */
function clampToDayCount(days: number): number {
  if (!Number.isFinite(days) || days < 0) {
    return 0;
  }
  return Math.floor(days);
}

/** 継続日数に対応する現在のバッジを返す（不正な日数でも必ず値を返す） */
export function getJourneyBadge(days: number): NeuralBadgeDefinition {
  return getBadgeByDay(clampToDayCount(days));
}

/** ID 指定でバッジを引く。未知の ID は先頭バッジにフォールバックする */
export function getBadgeById(id: BadgeId): NeuralBadgeDefinition {
  return BADGE_DEFINITIONS.find((badge) => badge.id === id) ?? BADGE_DEFINITIONS[0];
}
