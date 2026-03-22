export interface SurveyOption {
  labelKey: string;
  value: string;
}

export interface SurveyQuestion {
  id: string;
  questionKey: string;
  type: 'choice' | 'text_input';
  options?: SurveyOption[];
  required: boolean;
  otherTextId?: string;
}

export interface SurveyResponse {
  userId: string;
  responses: Record<string, string>;
  completedAt: string;
  appVersion: string;
  platform: 'ios' | 'android';
  promoCode?: string;
  promoSource?: string;
}
