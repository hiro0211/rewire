import {
  BADGE_DEFINITIONS,
  type NeuralBadgeDefinition,
} from '@/constants/badges/BADGE_DEFINITIONS';
import { getBadgeByDay } from './getBadgeByDay';

/** 次に到達するバッジを返す。最終バッジ達成済みならnull */
export function getNextBadge(days: number): NeuralBadgeDefinition | null {
  const current = getBadgeByDay(days);
  const currentIndex = BADGE_DEFINITIONS.indexOf(current);

  if (currentIndex >= BADGE_DEFINITIONS.length - 1) {
    return null;
  }

  return BADGE_DEFINITIONS[currentIndex + 1];
}
