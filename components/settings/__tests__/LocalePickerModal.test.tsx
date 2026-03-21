import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LocalePickerModal } from '../LocalePickerModal';

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({
    t: (key: string) => key,
    locale: 'ja' as const,
    isJapanese: true,
  }),
}));

describe('LocalePickerModal', () => {
  const defaultProps = {
    visible: true,
    currentPreference: 'system' as const,
    onSelect: jest.fn(),
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('visible=true でレンダリングされる', () => {
    expect(() => render(<LocalePickerModal {...defaultProps} />)).not.toThrow();
  });

  it('タイトル localePicker.title が表示される', () => {
    const { getByText } = render(<LocalePickerModal {...defaultProps} />);
    expect(getByText('localePicker.title')).toBeTruthy();
  });

  it('3つの選択肢が表示される', () => {
    const { getByText } = render(<LocalePickerModal {...defaultProps} />);
    expect(getByText('localePicker.system')).toBeTruthy();
    expect(getByText('localePicker.ja')).toBeTruthy();
    expect(getByText('localePicker.en')).toBeTruthy();
  });

  it('system選択時にonSelectが "system" で呼ばれる', () => {
    const { getByText } = render(<LocalePickerModal {...defaultProps} />);
    fireEvent.press(getByText('localePicker.system'));
    expect(defaultProps.onSelect).toHaveBeenCalledWith('system');
  });

  it('ja選択時にonSelectが "ja" で呼ばれる', () => {
    const { getByText } = render(<LocalePickerModal {...defaultProps} />);
    fireEvent.press(getByText('localePicker.ja'));
    expect(defaultProps.onSelect).toHaveBeenCalledWith('ja');
  });

  it('en選択時にonSelectが "en" で呼ばれる', () => {
    const { getByText } = render(<LocalePickerModal {...defaultProps} />);
    fireEvent.press(getByText('localePicker.en'));
    expect(defaultProps.onSelect).toHaveBeenCalledWith('en');
  });

  it('currentPreference=ja のとき ja のチェックマークが表示される', () => {
    const { UNSAFE_getAllByType } = render(
      <LocalePickerModal {...defaultProps} currentPreference="ja" />
    );
    // Ionicons checkmark は currentPreference と一致する選択肢にのみ表示
    // checkmark アイコンが1つだけ存在することを確認
    const allIcons = UNSAFE_getAllByType(
      require('@expo/vector-icons').Ionicons
    );
    const checkmarkIcons = allIcons.filter(
      (icon) => icon.props.name === 'checkmark'
    );
    expect(checkmarkIcons).toHaveLength(1);
  });
});
