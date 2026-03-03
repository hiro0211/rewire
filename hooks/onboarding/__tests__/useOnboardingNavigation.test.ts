import { renderHook, act } from '@testing-library/react-native';
import { useOnboardingNavigation } from '../useOnboardingNavigation';
import { STEPS } from '@/constants/onboarding';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light' },
}));

describe('useOnboardingNavigation', () => {
  it('初期ステップが 0', () => {
    const { result } = renderHook(() => useOnboardingNavigation());
    expect(result.current.step).toBe(0);
  });

  it('currentStep が STEPS[0] と一致する', () => {
    const { result } = renderHook(() => useOnboardingNavigation());
    expect(result.current.currentStep).toEqual(STEPS[0]);
  });

  it('goToNextStep でステップが進む', () => {
    const { result } = renderHook(() => useOnboardingNavigation());
    act(() => result.current.goToNextStep());
    expect(result.current.step).toBe(1);
  });

  it('goToPreviousStep でステップが戻る', () => {
    const { result } = renderHook(() => useOnboardingNavigation());
    // Go forward first
    act(() => result.current.goToNextStep());
    act(() => result.current.goToNextStep());
    act(() => result.current.goToPreviousStep());
    expect(result.current.step).toBe(1);
  });

  it('goToStep で任意のステップに移動できる', () => {
    const { result } = renderHook(() => useOnboardingNavigation());
    act(() => result.current.goToStep(5));
    expect(result.current.step).toBe(5);
  });

  it('isLastStep が最後のステップで true', () => {
    const { result } = renderHook(() => useOnboardingNavigation());
    act(() => result.current.goToStep(STEPS.length - 1));
    expect(result.current.isLastStep).toBe(true);
  });

  it('isLastStep が最初のステップで false', () => {
    const { result } = renderHook(() => useOnboardingNavigation());
    expect(result.current.isLastStep).toBe(false);
  });

  it('progress が 0〜1 の範囲', () => {
    const { result } = renderHook(() => useOnboardingNavigation());
    expect(result.current.progress).toBe(0);
    act(() => result.current.goToStep(STEPS.length - 1));
    expect(result.current.progress).toBe(1);
  });
});
