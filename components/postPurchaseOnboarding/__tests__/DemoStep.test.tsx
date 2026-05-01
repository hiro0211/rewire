import React from 'react';
import { Linking } from 'react-native';
import { render, fireEvent, act } from '@testing-library/react-native';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      text: '#fff',
      textSecondary: '#aaa',
      primary: '#4A90D9',
      surface: '#111',
      surfaceHighlight: '#1F1F2C',
      surfaceGlass: 'rgba(255,255,255,0.06)',
      overlay: 'rgba(0,0,0,0.6)',
      contrastText: '#fff',
      danger: '#FF4D4D',
    },
    gradients: { button: ['#7B61FF', '#4A90D9'] },
    glow: { purple: '#7B61FF' },
    shadows: { glowCard: {}, sheet: {} },
  }),
}));

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({
    t: (key: string) => key,
    locale: 'ja',
  }),
}));

jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons');

jest.mock('../ExtensionConfirmModal', () => {
  const ReactActual = jest.requireActual('react');
  const RN = jest.requireActual('react-native');
  return {
    ExtensionConfirmModal: (props: {
      visible: boolean;
      onConfirm: () => void;
      onOpenSettings: () => void;
      onClose: () => void;
    }) =>
      props.visible
        ? ReactActual.createElement(
            RN.View,
            { testID: 'confirm-modal' },
            ReactActual.createElement(
              RN.Pressable,
              { testID: 'confirm-button', onPress: props.onConfirm },
              ReactActual.createElement(RN.Text, null, 'continue'),
            ),
            ReactActual.createElement(
              RN.Pressable,
              { testID: 'confirm-open-settings', onPress: props.onOpenSettings },
              ReactActual.createElement(RN.Text, null, 'settings'),
            ),
            ReactActual.createElement(
              RN.Pressable,
              { testID: 'confirm-close', onPress: props.onClose },
              ReactActual.createElement(RN.Text, null, 'close'),
            ),
          )
        : null,
  };
});

import { DemoStep } from '../DemoStep';
import { DEMO_TEST_URL } from '@/constants/postPurchaseOnboarding';

describe('DemoStep', () => {
  let openURLSpy: jest.SpyInstance;

  beforeEach(() => {
    openURLSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
  });

  afterEach(() => {
    openURLSpy.mockRestore();
  });

  it('DEMO_TEST_URL は DuckDuckGo でアダルトサイトを検索する URL を指す（Google アプリの Universal Links 横取り回避）', () => {
    expect(DEMO_TEST_URL).toBe('https://duckduckgo.com/?q=pornhub');
  });

  it('テストボタン押下で確認モーダルが表示される（即座には Linking.openURL されない）', () => {
    const onTestBlock = jest.fn();
    const { getByText, queryByTestId } = render(
      <DemoStep onTestBlock={onTestBlock} onSkip={jest.fn()} />
    );

    expect(queryByTestId('confirm-modal')).toBeNull();

    fireEvent.press(getByText('postPurchaseOnboarding.demo.testButton'));

    expect(queryByTestId('confirm-modal')).toBeTruthy();
    expect(Linking.openURL).not.toHaveBeenCalled();
    expect(onTestBlock).not.toHaveBeenCalled();
  });

  it('モーダルの「続ける」で onTestBlock + Linking.openURL(DEMO_TEST_URL) が走る', () => {
    const onTestBlock = jest.fn();
    const { getByText, getByTestId } = render(
      <DemoStep onTestBlock={onTestBlock} onSkip={jest.fn()} />
    );

    fireEvent.press(getByText('postPurchaseOnboarding.demo.testButton'));
    fireEvent.press(getByTestId('confirm-button'));

    expect(onTestBlock).toHaveBeenCalledTimes(1);
    expect(Linking.openURL).toHaveBeenCalledWith(DEMO_TEST_URL);
  });

  it('モーダルの「設定で確認」で Linking.openURL("app-settings:") が呼ばれ、onTestBlock は呼ばれない', () => {
    const onTestBlock = jest.fn();
    const { getByText, getByTestId } = render(
      <DemoStep onTestBlock={onTestBlock} onSkip={jest.fn()} />
    );

    fireEvent.press(getByText('postPurchaseOnboarding.demo.testButton'));
    fireEvent.press(getByTestId('confirm-open-settings'));

    expect(Linking.openURL).toHaveBeenCalledWith('app-settings:');
    expect(Linking.openURL).not.toHaveBeenCalledWith(DEMO_TEST_URL);
    expect(onTestBlock).not.toHaveBeenCalled();
  });

  it('モーダルを閉じてもう一度テストボタンを押すと再度モーダルが開く', () => {
    const { getByText, getByTestId, queryByTestId } = render(
      <DemoStep onTestBlock={jest.fn()} onSkip={jest.fn()} />
    );

    fireEvent.press(getByText('postPurchaseOnboarding.demo.testButton'));
    expect(queryByTestId('confirm-modal')).toBeTruthy();

    act(() => {
      fireEvent.press(getByTestId('confirm-close'));
    });
    expect(queryByTestId('confirm-modal')).toBeNull();

    fireEvent.press(getByText('postPurchaseOnboarding.demo.testButton'));
    expect(queryByTestId('confirm-modal')).toBeTruthy();
  });

  it('「あとで試す」タップで onSkip が呼ばれる', () => {
    const onSkip = jest.fn();
    const { getByText } = render(
      <DemoStep onTestBlock={jest.fn()} onSkip={onSkip} />
    );

    fireEvent.press(getByText('postPurchaseOnboarding.demo.skipButton'));

    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  it('showRetryHint=true なら retryHint が表示される', () => {
    const { getByText } = render(
      <DemoStep onTestBlock={jest.fn()} onSkip={jest.fn()} showRetryHint />
    );

    expect(getByText('postPurchaseOnboarding.demo.retryHint')).toBeTruthy();
  });
});
