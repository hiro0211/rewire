import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SOSButton } from '../SOSButton';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockLogEvent = jest.fn();
jest.mock('@/lib/tracking/analyticsClient', () => ({
  analyticsClient: {
    logEvent: (...args: any[]) => mockLogEvent(...args),
  },
}));

describe('SOSButton (PanicButton)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('testID="panic-button" が存在する', () => {
    const { getByTestId } = render(<SOSButton />);
    expect(getByTestId('panic-button')).toBeTruthy();
  });

  it('"ポルノを見たくなったら" テキストが表示される', () => {
    const { getByText } = render(<SOSButton />);
    expect(getByText('ポルノを見たくなったら')).toBeTruthy();
  });

  it('サブテキスト "衝動が来たらタップ" が表示されない', () => {
    const { queryByText } = render(<SOSButton />);
    expect(queryByText('衝動が来たらタップ')).toBeNull();
  });

  it('ボタン押下で router.push("/breathing") が呼ばれる', () => {
    const { getByTestId } = render(<SOSButton />);
    fireEvent.press(getByTestId('panic-button'));
    expect(mockPush).toHaveBeenCalledWith('/breathing');
  });

  it('クラッシュしない', () => {
    expect(() => render(<SOSButton />)).not.toThrow();
  });

  it('ボタン押下で sos_tapped イベントが送信される', () => {
    const { getByTestId } = render(<SOSButton />);
    fireEvent.press(getByTestId('panic-button'));
    expect(mockLogEvent).toHaveBeenCalledWith('sos_tapped');
  });
});
