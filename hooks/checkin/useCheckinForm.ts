import { useState } from 'react';
import type { CheckinFormInput } from '@/types/checkin';

const INITIAL_STATE: CheckinFormInput = {
  watchedPorn: null,
  masturbated: null,
  urgeLevel: 0,
  stressLevel: 0,
  qualityOfLife: 3,
  memo: '',
};

export const useCheckinForm = () => {
  const [formState, setFormState] = useState<CheckinFormInput>(INITIAL_STATE);

  const setField = <K extends keyof CheckinFormInput>(field: K, value: CheckinFormInput[K]) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  return { formState, setField };
};
