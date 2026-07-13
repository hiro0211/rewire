import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: {
      View,
      createAnimatedComponent: (c: any) => c,
    },
    useSharedValue: (v: any) => ({ value: v }),
    useAnimatedStyle: (fn: any) => fn(),
    withSpring: (v: any) => v,
    withTiming: (v: any) => v,
    runOnJS: (fn: any) => fn,
    Easing: { bezier: () => (v: number) => v, out: (f: any) => f, quad: (v: number) => v },
  };
});

let mockIsDark = true;
jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      text: '#E8E8ED',
      textSecondary: '#6B6B7B',
      primary: '#8B5CF6',
      contrastText: '#FFFFFF',
      surface: '#0F0F15',
      surfaceHighlight: '#1F1F2C',
      surfaceGlass: 'rgba(255,255,255,0.06)',
      danger: '#EF4444',
      overlay: 'rgba(0,0,0,0.7)',
      borderGlass: 'rgba(255,255,255,0.08)',
    },
    gradients: {
      background: ['#0A0A0F', '#1a1a3e', '#2d1b4e'],
      button: ['#8B5CF6', '#6D28D9'],
      sos: ['#EF4444', '#991B1B'],
      glass: ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)'],
    },
    glow: { purple: 'rgba(139,92,246,0.3)', danger: 'rgba(239,68,68,0.3)' },
    shadows: { small: {}, medium: {}, glowCard: {}, sheet: {} },
    isDark: mockIsDark,
  }),
}));

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({ t: (key: string) => key, locale: 'ja', isJapanese: true }),
}));

const mockOpen = jest.fn();
const mockClose = jest.fn();
const mockSelectWatchedPorn = jest.fn();
const mockSelectUrgeLevelAndSubmit = jest.fn().mockResolvedValue(undefined);
const mockConfessRelapseAndClose = jest.fn().mockResolvedValue(true);
const mockFinish = jest.fn();
const mockRouterPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockRouterPush, back: jest.fn(), replace: jest.fn() }),
}));

let mockState = {
  visible: false,
  step: 1 as 1 | 2 | 3,
  formState: { watchedPorn: null as boolean | null, urgeLevel: 0 },
  isSubmitting: false,
  submitError: null as string | null,
};

jest.mock('@/hooks/reflection/useReflectionSheet', () => ({
  useReflectionSheet: Object.assign(
    (selector: any) => selector({
      ...mockState,
      open: mockOpen,
      close: mockClose,
      selectWatchedPorn: mockSelectWatchedPorn,
      selectUrgeLevelAndSubmit: mockSelectUrgeLevelAndSubmit,
      confessRelapseAndClose: mockConfessRelapseAndClose,
      finish: mockFinish,
    }),
    {
      getState: () => ({
        ...mockState,
        open: mockOpen,
        close: mockClose,
        selectWatchedPorn: mockSelectWatchedPorn,
        selectUrgeLevelAndSubmit: mockSelectUrgeLevelAndSubmit,
        confessRelapseAndClose: mockConfessRelapseAndClose,
        finish: mockFinish,
      }),
    }
  ),
}));

import { ReflectionSheet } from '../ReflectionSheet';

describe('ReflectionSheet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsDark = true;
    mockState = {
      visible: true,
      step: 1,
      formState: { watchedPorn: null, urgeLevel: 0 },
      isSubmitting: false,
      submitError: null,
    };
  });

  it('visible=true のとき step1 のコンテンツを表示する', () => {
    mockState.step = 1;
    const { getByTestId } = render(<ReflectionSheet />);

    expect(getByTestId('reflection-step1-no')).toBeTruthy();
    expect(getByTestId('reflection-step1-yes')).toBeTruthy();
  });

  it('step=2 のとき urge 選択肢を表示する', () => {
    mockState.step = 2;
    const { getByTestId } = render(<ReflectionSheet />);

    expect(getByTestId('reflection-urge-0')).toBeTruthy();
    expect(getByTestId('reflection-urge-4')).toBeTruthy();
  });

  it('step=3 のとき Finish ボタンを表示する', () => {
    mockState.step = 3;
    const { getByTestId } = render(<ReflectionSheet />);

    expect(getByTestId('reflection-finish')).toBeTruthy();
  });

  it('step1 で「見ていない」をタップすると selectWatchedPorn(false) が呼ばれる', () => {
    mockState.step = 1;
    const { getByTestId } = render(<ReflectionSheet />);

    fireEvent.press(getByTestId('reflection-step1-no'));

    expect(mockSelectWatchedPorn).toHaveBeenCalledWith(false);
    expect(mockConfessRelapseAndClose).not.toHaveBeenCalled();
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it('step1 で「見てしまった」をタップすると confessRelapseAndClose と /recovery への push が呼ばれる', async () => {
    mockState.step = 1;
    mockConfessRelapseAndClose.mockResolvedValueOnce(true);
    const { getByTestId } = render(<ReflectionSheet />);

    fireEvent.press(getByTestId('reflection-step1-yes'));

    await Promise.resolve();
    await Promise.resolve();

    expect(mockConfessRelapseAndClose).toHaveBeenCalled();
    expect(mockSelectWatchedPorn).not.toHaveBeenCalled();
    expect(mockRouterPush).toHaveBeenCalledWith('/recovery');
  });

  it('step1 で「見てしまった」を押した後、confess が失敗した場合は router.push を呼ばない', async () => {
    mockState.step = 1;
    mockConfessRelapseAndClose.mockResolvedValueOnce(false);
    const { getByTestId } = render(<ReflectionSheet />);

    fireEvent.press(getByTestId('reflection-step1-yes'));

    await Promise.resolve();
    await Promise.resolve();

    expect(mockConfessRelapseAndClose).toHaveBeenCalled();
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it('step2 で level をタップすると selectUrgeLevelAndSubmit(level) が呼ばれる', () => {
    mockState.step = 2;
    const { getByTestId } = render(<ReflectionSheet />);

    fireEvent.press(getByTestId('reflection-urge-3'));

    expect(mockSelectUrgeLevelAndSubmit).toHaveBeenCalledWith(3);
  });

  it('step3 で Finish タップで finish が呼ばれる', () => {
    mockState.step = 3;
    const { getByTestId } = render(<ReflectionSheet />);

    fireEvent.press(getByTestId('reflection-finish'));

    expect(mockFinish).toHaveBeenCalled();
  });

  it('オーバーレイタップで close が呼ばれる', () => {
    mockState.step = 1;
    const { getByTestId } = render(<ReflectionSheet />);

    fireEvent.press(getByTestId('reflection-sheet-overlay'));

    expect(mockClose).toHaveBeenCalled();
  });

  describe('宇宙UI背景', () => {
    it('シートに星空背景が描画される', () => {
      const { getByTestId } = render(<ReflectionSheet />);
      expect(getByTestId('starry-background')).toBeTruthy();
    });

    it('星空グラデーションにテーマの gradients.background が使われる', () => {
      const { getByTestId } = render(<ReflectionSheet />);
      expect(getByTestId('starry-gradient').props.colors).toEqual([
        '#0A0A0F',
        '#1a1a3e',
        '#2d1b4e',
      ]);
    });

    it('ダークモードでは星が表示される', () => {
      mockIsDark = true;
      const { getByTestId } = render(<ReflectionSheet />);
      expect(getByTestId('star-dot-0')).toBeTruthy();
    });

    it('ライトモードでは星を表示しない', () => {
      mockIsDark = false;
      const { queryByTestId } = render(<ReflectionSheet />);
      expect(queryByTestId('star-dot-0')).toBeNull();
    });
  });
});
