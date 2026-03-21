import type { CheckinFormInput, ValidationResult } from '@/types/checkin';
import { t } from '@/locales/i18n';

export const checkinValidator = {
  validate(input: CheckinFormInput): ValidationResult {
    if (input.watchedPorn === null) {
      return { ok: false, error: t('checkinForm.validationError') };
    }
    return { ok: true };
  },
};
