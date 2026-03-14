import { renderHook, act } from '@testing-library/react-native';
import { useOnboardingForm } from '../useOnboardingForm';

describe('useOnboardingForm', () => {
  it('初期状態でニックネームが空文字', () => {
    const { result } = renderHook(() => useOnboardingForm());
    expect(result.current.nickname).toBe('');
  });

  it('setNickname でニックネームを変更できる', () => {
    const { result } = renderHook(() => useOnboardingForm());
    act(() => result.current.setNickname('テスト'));
    expect(result.current.nickname).toBe('テスト');
  });

  it('初期状態で privacyAgreed が false', () => {
    const { result } = renderHook(() => useOnboardingForm());
    expect(result.current.privacyAgreed).toBe(false);
  });

  it('togglePrivacyAgreed でトグルできる', () => {
    const { result } = renderHook(() => useOnboardingForm());
    act(() => result.current.togglePrivacyAgreed());
    expect(result.current.privacyAgreed).toBe(true);
    act(() => result.current.togglePrivacyAgreed());
    expect(result.current.privacyAgreed).toBe(false);
  });

  it('初期状態で dataAgreed が false', () => {
    const { result } = renderHook(() => useOnboardingForm());
    expect(result.current.dataAgreed).toBe(false);
  });

  it('toggleDataAgreed でトグルできる', () => {
    const { result } = renderHook(() => useOnboardingForm());
    act(() => result.current.toggleDataAgreed());
    expect(result.current.dataAgreed).toBe(true);
  });

  it('初期状態で answers が空オブジェクト', () => {
    const { result } = renderHook(() => useOnboardingForm());
    expect(result.current.answers).toEqual({});
  });

  it('setAnswer で回答を追加できる', () => {
    const { result } = renderHook(() => useOnboardingForm());
    act(() => result.current.setAnswer('q1', 'a1'));
    expect(result.current.answers).toEqual({ q1: 'a1' });
  });

  it('setAnswer で既存回答を上書きできる', () => {
    const { result } = renderHook(() => useOnboardingForm());
    act(() => result.current.setAnswer('q1', 'a1'));
    act(() => result.current.setAnswer('q1', 'a2'));
    expect(result.current.answers).toEqual({ q1: 'a2' });
  });

  it('初期状態で selectedSymptoms が空配列', () => {
    const { result } = renderHook(() => useOnboardingForm());
    expect(result.current.selectedSymptoms).toEqual([]);
  });

  it('toggleSymptom で症状を追加できる', () => {
    const { result } = renderHook(() => useOnboardingForm());
    act(() => result.current.toggleSymptom('mental_motivation'));
    expect(result.current.selectedSymptoms).toEqual(['mental_motivation']);
  });

  it('toggleSymptom で同じ症状を再度タップすると除去される', () => {
    const { result } = renderHook(() => useOnboardingForm());
    act(() => result.current.toggleSymptom('mental_motivation'));
    act(() => result.current.toggleSymptom('mental_motivation'));
    expect(result.current.selectedSymptoms).toEqual([]);
  });

  it('toggleSymptom で複数の症状を追加できる', () => {
    const { result } = renderHook(() => useOnboardingForm());
    act(() => result.current.toggleSymptom('mental_motivation'));
    act(() => result.current.toggleSymptom('physical_fatigue'));
    expect(result.current.selectedSymptoms).toEqual(['mental_motivation', 'physical_fatigue']);
  });

  it('lastViewedDate の年月日を個別に変更できる', () => {
    const { result } = renderHook(() => useOnboardingForm());
    act(() => result.current.setLastViewedYear(2024));
    expect(result.current.lastViewedYear).toBe(2024);
    act(() => result.current.setLastViewedMonth(6));
    expect(result.current.lastViewedMonth).toBe(6);
    act(() => result.current.setLastViewedDay(15));
    expect(result.current.lastViewedDay).toBe(15);
  });
});
