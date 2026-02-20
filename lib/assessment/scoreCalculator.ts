import {
  ASSESSMENT_QUESTIONS,
  SCORE_THRESHOLDS,
  type ScoreThreshold,
} from '@/constants/assessment';

export type Answers = Record<string, string>;

/** 回答からスコアを計算 */
export function calculateScore(answers: Answers): number {
  return ASSESSMENT_QUESTIONS.reduce((total, q) => {
    const answer = answers[q.id];
    if (!answer) return total;

    if (q.type === 'choice') {
      const option = q.options?.find((o) => o.value === answer);
      return total + (option?.score ?? 0);
    }

    if (q.type === 'yesno') {
      return total + (answer === 'yes' ? (q.yesScore ?? 0) : 0);
    }

    return total;
  }, 0);
}

/** スコアから該当する閾値レベルを返す */
export function getScoreLevel(score: number): ScoreThreshold {
  return (
    SCORE_THRESHOLDS.find((t) => score <= t.max) ??
    SCORE_THRESHOLDS[SCORE_THRESHOLDS.length - 1]
  );
}
