import {
  BADGE_DEFINITIONS,
  type NeuralBadgeDefinition,
} from '@/constants/badges/BADGE_DEFINITIONS';

/** 負の日数を拒否するバリデーション付きキャスト */
export function asDayCount(days: number): number {
  if (days < 0) {
    throw new RangeError(`Day count must be non-negative, got ${days}`);
  }
  return days;
}

/** 指定日数に対応する現在のバッジを返す */
export function getBadgeByDay(days: number): NeuralBadgeDefinition {
  asDayCount(days);

  for (let i = BADGE_DEFINITIONS.length - 1; i >= 0; i--) {
    if (days >= BADGE_DEFINITIONS[i].day) {
      return BADGE_DEFINITIONS[i];
    }
  }

  return BADGE_DEFINITIONS[0];
}
