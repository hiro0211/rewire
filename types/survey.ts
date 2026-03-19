export interface SurveyOption {
  label: string;
  value: string;
}

export interface SurveyQuestion {
  id: string;
  question: string;
  type: 'choice' | 'text_input';
  options?: SurveyOption[];
  required: boolean;
}

export interface SurveyResponse {
  userId: string;
  responses: Record<string, string>;
  completedAt: string;
  appVersion: string;
  platform: 'ios' | 'android';
}
