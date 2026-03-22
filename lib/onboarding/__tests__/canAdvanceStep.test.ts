import { canAdvanceStep } from '../canAdvanceStep';
import type { OnboardingFormState } from '../canAdvanceStep';
import { STEPS } from '@/constants/onboarding';

const baseState = {
  step: 0,
  nickname: '',
  privacyAgreed: false,
  dataAgreed: false,
  answers: {} as Record<string, string>,
  lastViewedYear: 2026,
  lastViewedMonth: 1,
  lastViewedDay: 1,
};

describe('canAdvanceStep', () => {
  it('welcome ステップでは常に進める', () => {
    const idx = STEPS.findIndex((s) => s.type === 'welcome');
    expect(canAdvanceStep(idx, baseState)).toBe(true);
  });

  describe('assessment ステップ', () => {
    it('回答がない場合は進めない', () => {
      const idx = STEPS.findIndex((s) => s.type === 'assessment_choice');
      expect(canAdvanceStep(idx, baseState)).toBe(false);
    });

    it('回答がある場合は進める', () => {
      const idx = STEPS.findIndex((s) => s.type === 'assessment_choice');
      const step = STEPS[idx];
      if (step.type !== 'assessment_choice') throw new Error('unexpected');
      const state = { ...baseState, answers: { [step.questionId]: 'yes' } };
      expect(canAdvanceStep(idx, state)).toBe(true);
    });
  });

  describe('nickname ステップ', () => {
    it('空文字では進めない', () => {
      const idx = STEPS.findIndex((s) => s.type === 'nickname');
      expect(canAdvanceStep(idx, baseState)).toBe(false);
    });

    it('空白のみでは進めない', () => {
      const idx = STEPS.findIndex((s) => s.type === 'nickname');
      expect(canAdvanceStep(idx, { ...baseState, nickname: '   ' })).toBe(false);
    });

    it('名前入力済みなら進める', () => {
      const idx = STEPS.findIndex((s) => s.type === 'nickname');
      expect(canAdvanceStep(idx, { ...baseState, nickname: 'hiro' })).toBe(true);
    });
  });

  describe('consent ステップ', () => {
    it('両方未同意では進めない', () => {
      const idx = STEPS.findIndex((s) => s.type === 'consent');
      expect(canAdvanceStep(idx, baseState)).toBe(false);
    });

    it('片方のみ同意では進めない', () => {
      const idx = STEPS.findIndex((s) => s.type === 'consent');
      expect(canAdvanceStep(idx, { ...baseState, privacyAgreed: true })).toBe(false);
    });

    it('両方同意で進める', () => {
      const idx = STEPS.findIndex((s) => s.type === 'consent');
      expect(canAdvanceStep(idx, { ...baseState, privacyAgreed: true, dataAgreed: true })).toBe(true);
    });
  });

  describe('last_viewed_date ステップ', () => {
    it('未来の日付では進めない', () => {
      const idx = STEPS.findIndex((s) => s.type === 'last_viewed_date');
      expect(canAdvanceStep(idx, { ...baseState, lastViewedYear: 2099, lastViewedMonth: 12, lastViewedDay: 31 })).toBe(false);
    });

    it('過去の日付なら進める', () => {
      const idx = STEPS.findIndex((s) => s.type === 'last_viewed_date');
      expect(canAdvanceStep(idx, { ...baseState, lastViewedYear: 2025, lastViewedMonth: 6, lastViewedDay: 15 })).toBe(true);
    });
  });

  it('analyzing ステップでは常に進める', () => {
    const idx = STEPS.findIndex((s) => s.type === 'analyzing');
    expect(canAdvanceStep(idx, baseState)).toBe(true);
  });

  it('OnboardingFormState に step プロパティが含まれる', () => {
    const state: OnboardingFormState = { ...baseState, step: 3 };
    expect(state.step).toBe(3);
  });
});
