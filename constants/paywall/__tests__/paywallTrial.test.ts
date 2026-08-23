import { TRIAL_DAYS } from '../paywallTrial';

describe('TRIAL_DAYS', () => {
  it('参照したとき3日になる', () => {
    expect(TRIAL_DAYS).toBe(3);
  });
});
