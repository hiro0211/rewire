import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('@/lib/nativeGuard', () => ({ isExpoGo: true }));
import { PrePaywallBenefits } from '../PrePaywallBenefits';

describe('PrePaywallBenefits', () => {
  const defaultProps = {
    nickname: 'テスト',
    goalDays: 30,
    onContinue: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('クラッシュせずにレンダリングされる', () => {
    expect(() => render(<PrePaywallBenefits {...defaultProps} />)).not.toThrow();
  });

  it('ニックネームが表示される', () => {
    const { getByText } = render(<PrePaywallBenefits {...defaultProps} />);
    expect(getByText(/テスト/)).toBeTruthy();
  });

  it('目標日付が表示される（2箇所）', () => {
    const { getAllByText } = render(<PrePaywallBenefits {...defaultProps} />);
    // ヘッダーと途中のリマインダーで2箇所
    expect(getAllByText(/年.*月.*日/).length).toBeGreaterThanOrEqual(2);
  });

  it('ベネフィットタグが表示される', () => {
    const { getByText } = render(<PrePaywallBenefits {...defaultProps} />);
    expect(getByText(/Rewireで/)).toBeTruthy();
    expect(getByText(/集中力回復/)).toBeTruthy();
    expect(getByText(/脳のリセット/)).toBeTruthy();
  });

  it('ベネフィットセクションが全て表示される', () => {
    const { getByText } = render(<PrePaywallBenefits {...defaultProps} />);
    expect(getByText('脳をリセットする')).toBeTruthy();
    expect(getByText('自分をコントロールする')).toBeTruthy();
    expect(getByText('人生を変える')).toBeTruthy();
    expect(getByText('本物の人間関係を築く')).toBeTruthy();
  });

  it('機能紹介が表示される（実在機能のみ）', () => {
    const { getByText, queryByText } = render(<PrePaywallBenefits {...defaultProps} />);
    expect(getByText(/Rewireの仕組み/)).toBeTruthy();
    expect(getByText('ストリーク記録')).toBeTruthy();
    expect(queryByText('SNSフリクション介入')).toBeNull();
  });

  it('セクション見出しが日本語で表示される', () => {
    const { getByText } = render(<PrePaywallBenefits {...defaultProps} />);
    expect(getByText(/ポルノを見て後悔するの/)).toBeTruthy();
  });

  it('固定CTAボタンが表示される', () => {
    const { getByText } = render(<PrePaywallBenefits {...defaultProps} />);
    expect(getByText('Rewireを始める')).toBeTruthy();
  });

  it('CTAボタンを押すとonContinueが呼ばれる', () => {
    const { getByText } = render(<PrePaywallBenefits {...defaultProps} />);
    fireEvent.press(getByText('Rewireを始める'));
    expect(defaultProps.onContinue).toHaveBeenCalledTimes(1);
  });
});
