import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { InteractionManager } from 'react-native';

// Mock dependencies
jest.mock('@/lib/nativeGuard', () => ({ isExpoGo: true }));
const mockReplace = jest.fn();
let mockParams: Record<string, string> = {};
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useLocalSearchParams: () => mockParams,
}));

const mockLogEvent = jest.fn();
jest.mock('@/lib/tracking/analyticsClient', () => ({
  analyticsClient: { logEvent: (...args: any[]) => mockLogEvent(...args) },
}));

const mockTrackEvent = jest.fn();
jest.mock('@/lib/tracking/trackEvent', () => ({
  trackEvent: (...args: any[]) => mockTrackEvent(...args),
}));

let mockUser: { nickname: string; goalDays: number } | null = null;
jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({ user: mockUser }),
}));

import BenefitsScreen from '../onboarding/benefits';
import { calcTargetDate } from '@/components/paywall/preBenefitsUtils';

const DEFAULT_PARAMS = {
  nickname: 'テストユーザー',
  goalDays: '30',
  source: 'onboarding',
};

describe('BenefitsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParams = { ...DEFAULT_PARAMS };
    // 既定ではストアと params が一致している状態（正常な初回遷移）
    mockUser = { nickname: 'テストユーザー', goalDays: 30 };
  });

  it('クラッシュせずにレンダリングされる', () => {
    expect(() => render(<BenefitsScreen />)).not.toThrow();
  });

  it('ニックネームが表示される', () => {
    const { getByText } = render(<BenefitsScreen />);
    expect(getByText(/テストユーザー/)).toBeTruthy();
  });

  it('CTAボタンを押すとペイウォールに遷移する', () => {
    const runAfterSpy = jest.spyOn(InteractionManager, 'runAfterInteractions');

    const { getByText } = render(<BenefitsScreen />);
    fireEvent.press(getByText('Rewire を始める'));

    expect(runAfterSpy).toHaveBeenCalledTimes(1);
    // コールバックを実行
    const callback = runAfterSpy.mock.calls[0][0] as () => void;
    callback();

    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/paywall',
      params: { source: 'onboarding' },
    });

    runAfterSpy.mockRestore();
  });

  it('benefits_screen_viewed を導線つきで送信する', () => {
    render(<BenefitsScreen />);
    expect(mockTrackEvent).toHaveBeenCalledWith('benefits_screen_viewed', {
      source: 'onboarding',
    });
  });

  it('source が無いとき benefits_screen_viewed の source は unknown に丸められる', () => {
    mockParams = { nickname: 'テストユーザー', goalDays: '30' };
    render(<BenefitsScreen />);
    expect(mockTrackEvent).toHaveBeenCalledWith('benefits_screen_viewed', {
      source: 'unknown',
    });
  });

  it('パラメータが欠落していても保存済みのニックネームを表示する', () => {
    // ペイウォールを閉じて戻ると params が失われ、以前は 'User' に化けていた
    mockParams = {};
    mockUser = { nickname: '保存された名前', goalDays: 90 };
    const { getByText } = render(<BenefitsScreen />);
    expect(getByText(/保存された名前/)).toBeTruthy();
  });

  it('パラメータが欠落していても保存済みの目標日数で目標日を計算する', () => {
    // 以前は 30 日固定に化けていた
    mockParams = {};
    mockUser = { nickname: '保存された名前', goalDays: 90 };
    const { getAllByText } = render(<BenefitsScreen />);
    expect(getAllByText(calcTargetDate(90, true)).length).toBeGreaterThan(0);
  });

  it('ユーザー未作成かつパラメータも無いときは既定値で描画する', () => {
    mockUser = null;
    mockParams = {};
    expect(() => render(<BenefitsScreen />)).not.toThrow();
  });
});
