export interface CheckinFormInput {
  watchedPorn: boolean | null;
  masturbated: boolean | null;
  urgeLevel: number;
  stressLevel: number;
  qualityOfLife: number;
  memo: string;
}

export interface ValidationResult {
  ok: boolean;
  error?: string;
}
