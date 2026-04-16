import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AchievementsLinkCard } from '../AchievementsLinkCard';

describe('AchievementsLinkCard', () => {
  it('"Achievements" ラベルを表示する', () => {
    const { getByText } = render(
      <AchievementsLinkCard unlocked={3} total={18} onPress={jest.fn()} />
    );
    expect(getByText('Achievements')).toBeTruthy();
  });

  it('アンロック数を "{unlocked}/{total} Unlocked" 形式で表示する', () => {
    const { getByText } = render(
      <AchievementsLinkCard unlocked={3} total={18} onPress={jest.fn()} />
    );
    expect(getByText('3/18 Unlocked')).toBeTruthy();
  });

  it('カードをタップしたときに onPress が呼ばれる', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <AchievementsLinkCard unlocked={3} total={18} onPress={onPress} />
    );
    fireEvent.press(getByTestId('achievements-link-card'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('chevron-forward アイコンをレンダリングする', () => {
    const { getByTestId } = render(
      <AchievementsLinkCard unlocked={3} total={18} onPress={jest.fn()} />
    );
    expect(getByTestId('achievements-link-chevron')).toBeTruthy();
  });
});
