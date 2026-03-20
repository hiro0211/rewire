export interface AssessmentOption {
  labelKey: string;
  value: string;
  score: number;
}

export interface AssessmentQuestion {
  id: string;
  questionKey: string;
  type: 'choice' | 'yesno' | 'picker';
  options?: AssessmentOption[];
  yesScore?: number;
  pickerRange?: { min: number; max: number; suffixKey: string };
}

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'startAge',
    questionKey: 'assessment.q.startAge.question',
    type: 'choice',
    options: [
      { labelKey: 'assessment.q.startAge.under12', value: 'under12', score: 3 },
      { labelKey: 'assessment.q.startAge.age13to15', value: '13-15', score: 2 },
      { labelKey: 'assessment.q.startAge.age16to18', value: '16-18', score: 1 },
      { labelKey: 'assessment.q.startAge.age19plus', value: '19+', score: 0 },
    ],
  },
  {
    id: 'currentAge',
    questionKey: 'assessment.q.currentAge.question',
    type: 'picker',
    pickerRange: { min: 11, max: 60, suffixKey: 'assessment.q.currentAge.suffix' },
  },
  {
    id: 'frequency',
    questionKey: 'assessment.q.frequency.question',
    type: 'choice',
    options: [
      { labelKey: 'assessment.q.frequency.multipleDaily', value: 'multiple_daily', score: 4 },
      { labelKey: 'assessment.q.frequency.daily', value: 'daily', score: 3 },
      { labelKey: 'assessment.q.frequency.weekly', value: 'weekly', score: 2 },
      { labelKey: 'assessment.q.frequency.rarely', value: 'rarely', score: 0 },
    ],
  },
  {
    id: 'escalation',
    questionKey: 'assessment.q.escalation.question',
    type: 'yesno',
    yesScore: 4,
  },
  {
    id: 'increasing',
    questionKey: 'assessment.q.increasing.question',
    type: 'yesno',
    yesScore: 3,
  },
  {
    id: 'stressCoping',
    questionKey: 'assessment.q.stressCoping.question',
    type: 'yesno',
    yesScore: 3,
  },
  {
    id: 'boredomCoping',
    questionKey: 'assessment.q.boredomCoping.question',
    type: 'yesno',
    yesScore: 2,
  },
  {
    id: 'failedControl',
    questionKey: 'assessment.q.failedControl.question',
    type: 'yesno',
    yesScore: 5,
  },
  {
    id: 'dailyImpact',
    questionKey: 'assessment.q.dailyImpact.question',
    type: 'yesno',
    yesScore: 5,
  },
];

export interface ScoreThreshold {
  max: number;
  labelKey: string;
  color: string;
  messageKey: string;
}

export const SCORE_THRESHOLDS: ScoreThreshold[] = [
  { max: 7, labelKey: 'assessment.score.low.label', color: '#3DD68C', messageKey: 'assessment.score.low.message' },
  { max: 14, labelKey: 'assessment.score.moderate.label', color: '#F0A030', messageKey: 'assessment.score.moderate.message' },
  { max: 21, labelKey: 'assessment.score.high.label', color: '#EF8C30', messageKey: 'assessment.score.high.message' },
  { max: 29, labelKey: 'assessment.score.severe.label', color: '#EF4444', messageKey: 'assessment.score.severe.message' },
];

export const MAX_SCORE = 29;
