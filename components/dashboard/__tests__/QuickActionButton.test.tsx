import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { QuickActionButton } from '../QuickActionButton';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      text: '#E8E8ED',
      textSecondary: '#6B6B7B',
      surfaceGlass: 'rgba(255,255,255,0.06)',
      borderGlass: 'rgba(255,255,255,0.12)',
    },
    isDark: true,
  }),
}));

describe('QuickActionButton', () => {
  it('アイコンとラベルを表示する', () => {
    render(
      <QuickActionButton icon="heart-outline" label="呼吸" onPress={jest.fn()} />
    );
    expect(screen.getByText('呼吸')).toBeTruthy();
  });

  it('タップでonPressが呼ばれる', () => {
    const onPress = jest.fn();
    render(
      <QuickActionButton icon="heart-outline" label="呼吸" onPress={onPress} />
    );
    fireEvent.press(screen.getByText('呼吸'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('testIDを渡せる', () => {
    render(
      <QuickActionButton icon="pulse" label="チェックイン" onPress={jest.fn()} testID="qa-checkin" />
    );
    expect(screen.getByTestId('qa-checkin')).toBeTruthy();
  });
});
