import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Linking } from 'react-native';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      background: '#0A0A0F',
      surface: '#1a1a1a',
      overlay: 'rgba(0,0,0,0.6)',
      text: '#fff',
      textSecondary: '#aaa',
      primary: '#8B5CF6',
    },
  }),
}));

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({ t: (k: string) => k }),
}));

jest.mock('@/components/ui/Button', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return {
    Button: ({ title, onPress }: { title: string; onPress: () => void }) => (
      <TouchableOpacity testID={`button-${title}`} onPress={onPress}>
        <Text>{title}</Text>
      </TouchableOpacity>
    ),
  };
});

import { ForceUpdateModal } from '../ForceUpdateModal';
import { APP_STORE_URL } from '@/constants/appUpdates';

describe('ForceUpdateModal', () => {
  it('visible=true でタイトルと本文が表示される', () => {
    const { getByText } = render(<ForceUpdateModal visible />);
    expect(getByText('appUpdate.forceUpdate.title')).toBeTruthy();
    expect(getByText('appUpdate.forceUpdate.body')).toBeTruthy();
  });

  it('visible=false のとき何も表示しない', () => {
    const { queryByText } = render(<ForceUpdateModal visible={false} />);
    expect(queryByText('appUpdate.forceUpdate.title')).toBeNull();
  });

  it('閉じるボタンが存在しない（App Store ボタンのみ）', () => {
    const { queryByTestId, getByTestId } = render(<ForceUpdateModal visible />);
    expect(getByTestId('button-appUpdate.forceUpdate.openAppStore')).toBeTruthy();
    expect(queryByTestId('button-common.close')).toBeNull();
    expect(queryByTestId('button-common.later')).toBeNull();
  });

  it('App Store ボタンタップで App Store の URL を開く', () => {
    const spy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true as never);
    const { getByTestId } = render(<ForceUpdateModal visible />);

    fireEvent.press(getByTestId('button-appUpdate.forceUpdate.openAppStore'));

    expect(spy).toHaveBeenCalledWith(APP_STORE_URL);
    spy.mockRestore();
  });
});
