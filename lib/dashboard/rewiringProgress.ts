/** Calculate brain rewiring progress as a ratio (0-1) */
export function calculateRewiringProgress(currentDays: number, goalDays: number): number {
  if (goalDays <= 0) return 0;
  return Math.min(Math.max(currentDays / goalDays, 0), 1);
}
