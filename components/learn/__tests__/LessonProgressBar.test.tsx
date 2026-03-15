import React from 'react';
import { render } from '@testing-library/react-native';
import { LessonProgressBar } from '../LessonProgressBar';

describe('LessonProgressBar', () => {
  it('完了数と総数が表示される', () => {
    const { getByText } = render(
      <LessonProgressBar completed={2} total={7} />
    );
    expect(getByText('2/7')).toBeTruthy();
  });

  it('0/7のとき進捗テキストが表示される', () => {
    const { getByText } = render(
      <LessonProgressBar completed={0} total={7} />
    );
    expect(getByText('0/7')).toBeTruthy();
  });

  it('全完了時にスターアイコンが表示される', () => {
    const { getByTestId } = render(
      <LessonProgressBar completed={7} total={7} />
    );
    expect(getByTestId('star-icon')).toBeTruthy();
  });

  it('未完了時にスターアイコンが表示されない', () => {
    const { queryByTestId } = render(
      <LessonProgressBar completed={3} total={7} />
    );
    expect(queryByTestId('star-icon')).toBeNull();
  });

  it('プログレスバーが表示される', () => {
    const { getByTestId } = render(
      <LessonProgressBar completed={3} total={7} />
    );
    expect(getByTestId('progress-bar')).toBeTruthy();
  });
});
