import React from 'react';
import { render } from '@testing-library/react-native';
import { StreakEditModal } from '../StreakEditModal';

jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => <View testID="date-picker" />,
  };
});

describe('StreakEditModal crash prevention', () => {
  const onClose = jest.fn();
  const onSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('空文字のinitialDate → クラッシュしない', () => {
    expect(() =>
      render(
        <StreakEditModal
          visible={true}
          initialDate=""
          onClose={onClose}
          onSave={onSave}
        />
      )
    ).not.toThrow();
  });

  it('不正な日付文字列 → クラッシュしない', () => {
    expect(() =>
      render(
        <StreakEditModal
          visible={true}
          initialDate="not-a-date"
          onClose={onClose}
          onSave={onSave}
        />
      )
    ).not.toThrow();
  });

  it('undefined的な値 → フォールバックで今日を選択（クラッシュしない）', () => {
    expect(() =>
      render(
        <StreakEditModal
          visible={true}
          initialDate={undefined as any}
          onClose={onClose}
          onSave={onSave}
        />
      )
    ).not.toThrow();
  });

  it('非常に古い日付 → クラッシュしない', () => {
    expect(() =>
      render(
        <StreakEditModal
          visible={true}
          initialDate="1900-01-01"
          onClose={onClose}
          onSave={onSave}
        />
      )
    ).not.toThrow();
  });

  it('タイムゾーン付きISO → クラッシュしない', () => {
    expect(() =>
      render(
        <StreakEditModal
          visible={true}
          initialDate="2026-02-17T09:00:00+09:00"
          onClose={onClose}
          onSave={onSave}
        />
      )
    ).not.toThrow();
  });

  it('visible切り替え → クラッシュしない', () => {
    const { rerender } = render(
      <StreakEditModal
        visible={false}
        initialDate="2026-02-17"
        onClose={onClose}
        onSave={onSave}
      />
    );
    expect(() =>
      rerender(
        <StreakEditModal
          visible={true}
          initialDate="2026-02-17"
          onClose={onClose}
          onSave={onSave}
        />
      )
    ).not.toThrow();
  });

  it('initialDate変更時の再レンダリング → クラッシュしない', () => {
    const { rerender } = render(
      <StreakEditModal
        visible={true}
        initialDate="2026-02-17"
        onClose={onClose}
        onSave={onSave}
      />
    );
    expect(() =>
      rerender(
        <StreakEditModal
          visible={true}
          initialDate="2026-01-01"
          onClose={onClose}
          onSave={onSave}
        />
      )
    ).not.toThrow();
  });
});
