import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LessonTimeline } from '../LessonTimeline';
import { LESSONS } from '@/constants/lessons';

describe('LessonTimeline', () => {
  it('全7レッスンのカードが表示される', () => {
    const { getByTestId } = render(
      <LessonTimeline completedLessons={[]} onLessonPress={jest.fn()} />
    );
    LESSONS.forEach((lesson) => {
      expect(getByTestId(`lesson-card-${lesson.id}`)).toBeTruthy();
    });
  });

  it('最初のレッスンがactive状態で表示される', () => {
    const { getByText } = render(
      <LessonTimeline completedLessons={[]} onLessonPress={jest.fn()} />
    );
    expect(getByText('読み始める')).toBeTruthy();
  });

  it('完了済みレッスンがcompleted状態で表示される', () => {
    const { getAllByText } = render(
      <LessonTimeline completedLessons={['lesson-1']} onLessonPress={jest.fn()} />
    );
    expect(getAllByText('完了')).toHaveLength(1);
  });

  it('ロック済みレッスンにロックアイコンが表示される', () => {
    const { getAllByTestId } = render(
      <LessonTimeline completedLessons={[]} onLessonPress={jest.fn()} />
    );
    expect(getAllByTestId('lock-icon')).toHaveLength(6);
  });

  it('レッスンタップでonLessonPressが呼ばれる', () => {
    const onLessonPress = jest.fn();
    const { getByTestId } = render(
      <LessonTimeline completedLessons={[]} onLessonPress={onLessonPress} />
    );
    fireEvent.press(getByTestId('lesson-card-lesson-1'));
    expect(onLessonPress).toHaveBeenCalledWith(LESSONS[0]);
  });

  it('タイムラインのステータスアイコンが表示される', () => {
    const { getByTestId } = render(
      <LessonTimeline completedLessons={['lesson-1']} onLessonPress={jest.fn()} />
    );
    expect(getByTestId('timeline-icon-lesson-1')).toBeTruthy();
    expect(getByTestId('timeline-icon-lesson-2')).toBeTruthy();
  });
});
