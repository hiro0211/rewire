const MIN_DAYS_BEFORE_SURVEY = 3;
const RE_PROMPT_INTERVAL_DAYS = 30;
const DISMISS_COOLDOWN_DAYS = 7;
const MAX_DISMISSALS = 3;

const MS_PER_DAY = 1000 * 60 * 60 * 24;

interface SurveyPromptInput {
  isCompleted: boolean;
  accountCreatedAt: string | null;
  lastPromptedAt: string | null;
  dismissCount: number;
  now: Date;
}

export function shouldShowSurveyPrompt(input: SurveyPromptInput): boolean {
  const { isCompleted, accountCreatedAt, lastPromptedAt, dismissCount, now } = input;

  if (isCompleted) return false;

  if (!accountCreatedAt) return false;

  const daysSinceCreation = (now.getTime() - new Date(accountCreatedAt).getTime()) / MS_PER_DAY;
  if (daysSinceCreation < MIN_DAYS_BEFORE_SURVEY) return false;

  if (dismissCount >= MAX_DISMISSALS) return false;

  if (!lastPromptedAt) return true;

  const daysSinceLastPrompt = (now.getTime() - new Date(lastPromptedAt).getTime()) / MS_PER_DAY;

  if (dismissCount > 0) {
    return daysSinceLastPrompt >= DISMISS_COOLDOWN_DAYS;
  }

  return daysSinceLastPrompt >= RE_PROMPT_INTERVAL_DAYS;
}
