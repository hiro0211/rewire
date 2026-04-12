import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'panic.thinkingOfWatching': '⚠️ 見そうになっている',
        'panic.watchedPorn': '👎 ポルノを見てしまった',
      };
      return map[key] ?? key;
    },
  }),
}));

jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return { LinearGradient: View };
});

import { PanicActionButtons } from '../PanicActionButtons';

describe('PanicActionButtons', () => {
  const createProps = () => ({
    onThinkingOfWatching: jest.fn(),
    onWatchedPorn: jest.fn(),
  });

  it('2つのアクションボタンを表示する', () => {
    const { getByText } = render(<PanicActionButtons {...createProps()} />);
    expect(getByText('⚠️ 見そうになっている')).toBeTruthy();
    expect(getByText('👎 ポルノを見てしまった')).toBeTruthy();
  });

  it('「見そうになっている」押下で onThinkingOfWatching が呼ばれる', () => {
    const props = createProps();
    const { getByTestId } = render(<PanicActionButtons {...props} />);
    fireEvent.press(getByTestId('panic-action-thinking'));
    expect(props.onThinkingOfWatching).toHaveBeenCalled();
  });

  it('「ポルノを見てしまった」押下で onWatchedPorn が呼ばれる', () => {
    const props = createProps();
    const { getByTestId } = render(<PanicActionButtons {...props} />);
    fireEvent.press(getByTestId('panic-action-watched'));
    expect(props.onWatchedPorn).toHaveBeenCalled();
  });
});
