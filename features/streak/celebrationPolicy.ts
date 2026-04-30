interface ShouldCelebrateInput {
  currentStreak: number;
  lastCelebrated: number | null;
  hydrated: boolean;
}

export const shouldCelebrate = ({
  currentStreak,
  lastCelebrated,
  hydrated,
}: ShouldCelebrateInput): boolean => {
  if (!hydrated) return false;
  if (lastCelebrated === null) return false;
  if (currentStreak <= 0) return false;
  return currentStreak > lastCelebrated;
};

export const computeFromStreak = (
  currentStreak: number,
  _lastCelebrated: number | null,
): number => Math.max(0, currentStreak - 1);
