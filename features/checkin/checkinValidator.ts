import type { CheckinFormInput, ValidationResult } from '@/types/checkin';

export const checkinValidator = {
  validate(input: CheckinFormInput): ValidationResult {
    if (input.watchedPorn === null) {
      return { ok: false, error: 'ポルノ視聴の有無を選択してください' };
    }
    return { ok: true };
  },
};
