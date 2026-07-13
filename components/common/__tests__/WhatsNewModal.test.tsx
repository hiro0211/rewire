import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
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

import { WhatsNewModal } from '../WhatsNewModal';

describe('WhatsNewModal', () => {
  it('visible=true でタイトルと本文が表示される', () => {
    const { getByText } = render(
      <WhatsNewModal visible onTryNow={jest.fn()} onDismiss={jest.fn()} />,
    );
    expect(getByText('appUpdate.whatsNew.title')).toBeTruthy();
    expect(getByText('appUpdate.whatsNew.body')).toBeTruthy();
    expect(getByText('appUpdate.whatsNew.hint')).toBeTruthy();
  });

  it('visible=false のとき何も表示しない', () => {
    const { queryByText } = render(
      <WhatsNewModal visible={false} onTryNow={jest.fn()} onDismiss={jest.fn()} />,
    );
    expect(queryByText('appUpdate.whatsNew.title')).toBeNull();
  });

  it('「さっそく試す」タップで onTryNow を呼ぶ', () => {
    const onTryNow = jest.fn();
    const { getByTestId } = render(
      <WhatsNewModal visible onTryNow={onTryNow} onDismiss={jest.fn()} />,
    );
    fireEvent.press(getByTestId('button-appUpdate.whatsNew.tryNow'));
    expect(onTryNow).toHaveBeenCalledTimes(1);
  });

  it('「あとで」タップで onDismiss を呼ぶ', () => {
    const onDismiss = jest.fn();
    const { getByTestId } = render(
      <WhatsNewModal visible onTryNow={jest.fn()} onDismiss={onDismiss} />,
    );
    fireEvent.press(getByTestId('button-appUpdate.whatsNew.later'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
