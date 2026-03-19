const MIN_ACCOUNT_AGE_DAYS = 7;
const MIN_CHECKIN_COUNT = 5;
const COOLDOWN_DAYS = 90;
const MAX_DISMISSALS = 3;

const MS_PER_DAY = 1000 * 60 * 60 * 24;

interface ReviewPromptInput {
  hasLeftPositiveReview: boolean;
  accountCreatedAt: string | null;
  checkinCount: number;
  lastPromptedAt: string | null;
  dismissCount: number;
  isIOS: boolean;
  now: Date;
}

export function shouldShowReviewPrompt(input: ReviewPromptInput): boolean {
  const { hasLeftPositiveReview, accountCreatedAt, checkinCount, lastPromptedAt, dismissCount, isIOS, now } = input;

  if (hasLeftPositiveReview) return false;

  if (!isIOS) return false;

  if (!accountCreatedAt) return false;

  const daysSinceCreation = (now.getTime() - new Date(accountCreatedAt).getTime()) / MS_PER_DAY;
  if (daysSinceCreation < MIN_ACCOUNT_AGE_DAYS) return false;

  if (checkinCount < MIN_CHECKIN_COUNT) return false;

  if (dismissCount >= MAX_DISMISSALS) return false;

  if (!lastPromptedAt) return true;

  const daysSinceLastPrompt = (now.getTime() - new Date(lastPromptedAt).getTime()) / MS_PER_DAY;
  return daysSinceLastPrompt >= COOLDOWN_DAYS;
}
