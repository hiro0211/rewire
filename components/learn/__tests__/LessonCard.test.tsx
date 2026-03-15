import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LessonCard } from '../LessonCard';
import { LESSONS } from '@/constants/lessons';

describe('LessonCard', () => {
  const lesson = LESSONS[0];

  describe('active状態', () => {
    it('レッスンタイトルが表示される', () => {
      const { getByText } = render(
        <LessonCard lesson={lesson} status="active" onPress={jest.fn()} />
      );
      expect(getByText('ポルノは報酬系の仕組みを変えてしまう')).toBeTruthy();
    });

    it('レッスン番号が表示される', () => {
      const { getByText } = render(
        <LessonCard lesson={lesson} status="active" onPress={jest.fn()} />
      );
      expect(getByText('Lesson 1')).toBeTruthy();
    });

    it('読了時間が表示される', () => {
      const { getByText } = render(
        <LessonCard lesson={lesson} status="active" onPress={jest.fn()} />
      );
      expect(getByText('2分')).toBeTruthy();
    });

    it('「読み始める」ボタンが表示される', () => {
      const { getByText } = render(
        <LessonCard lesson={lesson} status="active" onPress={jest.fn()} />
      );
      expect(getByText('読み始める')).toBeTruthy();
    });

    it('タップでonPressが呼ばれる', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <LessonCard lesson={lesson} status="active" onPress={onPress} />
      );
      fireEvent.press(getByTestId('lesson-card-lesson-1'));
      expect(onPress).toHaveBeenCalled();
    });
  });

  describe('locked状態', () => {
    it('レッスンタイトルが表示される', () => {
      const { getByText } = render(
        <LessonCard lesson={LESSONS[1]} status="locked" onPress={jest.fn()} />
      );
      expect(getByText('脱感作')).toBeTruthy();
    });

    it('ロックアイコンが表示される', () => {
      const { getByTestId } = render(
        <LessonCard lesson={LESSONS[1]} status="locked" onPress={jest.fn()} />
      );
      expect(getByTestId('lock-icon')).toBeTruthy();
    });

    it('タップしてもonPressが呼ばれない', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <LessonCard lesson={LESSONS[1]} status="locked" onPress={onPress} />
      );
      fireEvent.press(getByTestId('lesson-card-lesson-2'));
      expect(onPress).not.toHaveBeenCalled();
    });
  });

  describe('completed状態', () => {
    it('「完了」テキストが表示される', () => {
      const { getByText } = render(
        <LessonCard lesson={lesson} status="completed" onPress={jest.fn()} />
      );
      expect(getByText('完了')).toBeTruthy();
    });

    it('タップでonPressが呼ばれる（再読可能）', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <LessonCard lesson={lesson} status="completed" onPress={onPress} />
      );
      fireEvent.press(getByTestId('lesson-card-lesson-1'));
      expect(onPress).toHaveBeenCalled();
    });
  });
});
