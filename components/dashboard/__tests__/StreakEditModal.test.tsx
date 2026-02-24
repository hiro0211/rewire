import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { StreakEditModal } from '../StreakEditModal';

jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => (
      <View
        testID="date-picker"
        {...props}
        onChange={(e: any) =>
          props.onChange?.(e, props.value || new Date('2026-02-17'))
        }
      />
    ),
  };
});

describe('StreakEditModal', () => {
  const defaultProps = {
    visible: true,
    initialDate: '2026-02-17',
    onClose: jest.fn(),
    onSave: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('visible=true で「開始日を編集」タイトルが表示される', () => {
    const { getByText } = render(<StreakEditModal {...defaultProps} />);
    expect(getByText('開始日を編集')).toBeTruthy();
  });

  it('説明文が表示される', () => {
    const { getByText } = render(<StreakEditModal {...defaultProps} />);
    expect(getByText(/アプリ導入前から継続している場合/)).toBeTruthy();
  });

  it('「保存」ボタンが表示される', () => {
    const { getByText } = render(<StreakEditModal {...defaultProps} />);
    expect(getByText('保存')).toBeTruthy();
  });

  it('「キャンセル」ボタンが表示される', () => {
    const { getByText } = render(<StreakEditModal {...defaultProps} />);
    expect(getByText('キャンセル')).toBeTruthy();
  });

  it('visible=false で何も表示されない', () => {
    const { queryByText } = render(
      <StreakEditModal {...defaultProps} visible={false} />
    );
    expect(queryByText('開始日を編集')).toBeNull();
  });

  it('「保存」タップで onSave が yyyy-MM-dd 形式の日付で呼ばれる', () => {
    const onSave = jest.fn();
    const onClose = jest.fn();
    const { getByText } = render(
      <StreakEditModal {...defaultProps} onSave={onSave} onClose={onClose} />
    );
    fireEvent.press(getByText('保存'));
    expect(onSave).toHaveBeenCalledWith('2026-02-17');
    expect(onClose).toHaveBeenCalled();
  });

  it('「キャンセル」タップで onClose が呼ばれ、onSave は呼ばれない', () => {
    const onSave = jest.fn();
    const onClose = jest.fn();
    const { getByText } = render(
      <StreakEditModal {...defaultProps} onSave={onSave} onClose={onClose} />
    );
    fireEvent.press(getByText('キャンセル'));
    expect(onClose).toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('DateTimePicker に maximumDate が今日で設定されている', () => {
    const today = new Date();
    const { getByTestId } = render(<StreakEditModal {...defaultProps} />);
    const picker = getByTestId('date-picker');
    expect(picker.props.maximumDate).toBeDefined();
    expect(picker.props.maximumDate.getFullYear()).toBe(today.getFullYear());
    expect(picker.props.maximumDate.getMonth()).toBe(today.getMonth());
    expect(picker.props.maximumDate.getDate()).toBe(today.getDate());
  });

  it('未来の initialDate が渡されても保存時に未来日付にならない', () => {
    const onSave = jest.fn();
    const futureDate = '2099-12-31';
    const { getByText } = render(
      <StreakEditModal
        visible={true}
        initialDate={futureDate}
        onClose={jest.fn()}
        onSave={onSave}
      />
    );
    fireEvent.press(getByText('保存'));
    // onSave に渡される日付は未来ではない（今日以前）
    const savedDate = onSave.mock.calls[0][0];
    expect(new Date(savedDate) <= new Date()).toBe(true);
  });
});
