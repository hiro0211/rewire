import type { SurveyQuestion } from '@/types/survey';

/**
 * Asked at the very start of onboarding — a brand-new user can answer all of
 * these without having used the app yet.
 */
export const ONBOARDING_SURVEY_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'age_range',
    questionKey: 'survey.ageRange.question',
    type: 'choice',
    options: [
      { labelKey: 'survey.ageRange.age18to24', value: '18-24' },
      { labelKey: 'survey.ageRange.age25to34', value: '25-34' },
      { labelKey: 'survey.ageRange.age35to44', value: '35-44' },
      { labelKey: 'survey.ageRange.age45plus', value: '45+' },
    ],
    required: true,
  },
  {
    id: 'discovery_channel',
    questionKey: 'survey.discoveryChannel.question',
    type: 'choice',
    options: [
      { labelKey: 'survey.discoveryChannel.appStore', value: 'app_store' },
      { labelKey: 'survey.discoveryChannel.tiktok', value: 'tiktok' },
      { labelKey: 'survey.discoveryChannel.instagram', value: 'instagram' },
      { labelKey: 'survey.discoveryChannel.youtube', value: 'youtube' },
      { labelKey: 'survey.discoveryChannel.x', value: 'x' },
      { labelKey: 'survey.discoveryChannel.referral', value: 'referral' },
      { labelKey: 'survey.discoveryChannel.webSearch', value: 'web_search' },
      { labelKey: 'survey.discoveryChannel.other', value: 'other' },
    ],
    required: true,
  },
  {
    id: 'motivation',
    questionKey: 'survey.motivation.question',
    type: 'choice',
    options: [
      { labelKey: 'survey.motivation.selfControl', value: 'self_control' },
      { labelKey: 'survey.motivation.productivity', value: 'productivity' },
      { labelKey: 'survey.motivation.relationship', value: 'relationship' },
      { labelKey: 'survey.motivation.selfEsteem', value: 'self_esteem' },
      { labelKey: 'survey.motivation.other', value: 'other' },
    ],
    required: true,
    otherTextId: 'motivation_other_text',
  },
];

/**
 * Asked from the 3-day-old survey prompt — these ask what changed since the
 * user started, so they only make sense after real usage.
 */
export const FEEDBACK_SURVEY_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'perceived_change',
    questionKey: 'survey.perceivedChange.question',
    type: 'choice',
    options: [
      { labelKey: 'survey.perceivedChange.significant', value: 'significant' },
      { labelKey: 'survey.perceivedChange.slight', value: 'slight' },
      { labelKey: 'survey.perceivedChange.unsure', value: 'unsure' },
      { labelKey: 'survey.perceivedChange.none', value: 'none' },
      { labelKey: 'survey.perceivedChange.other', value: 'other' },
    ],
    required: true,
    otherTextId: 'perceived_change_other_text',
  },
  {
    id: 'free_text',
    questionKey: 'survey.freeText.question',
    type: 'text_input',
    required: false,
  },
];

/** Backward compatibility: every survey question across both sets. */
export const SURVEY_QUESTIONS: SurveyQuestion[] = [
  ...ONBOARDING_SURVEY_QUESTIONS,
  ...FEEDBACK_SURVEY_QUESTIONS,
];

export const TOTAL_SURVEY_QUESTIONS = SURVEY_QUESTIONS.length;

export const REQUIRED_SURVEY_QUESTIONS = SURVEY_QUESTIONS.filter((q) => q.required);
