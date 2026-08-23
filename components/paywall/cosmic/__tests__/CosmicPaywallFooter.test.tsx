import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

jest.mock('@/lib/nativeGuard', () => ({ isExpoGo: true }));
jest.mock('expo-web-browser', () => ({ openBrowserAsync: jest.fn() }));
const mockTrackEvent = jest.fn();
jest.mock('@/lib/tracking/trackEvent', () => ({
  trackEvent: (...args: any[]) => mockTrackEvent(...args),
}));

import { CosmicPaywallFooter } from '../CosmicPaywallFooter';

describe('CosmicPaywallFooter', () => {
  const defaultProps = {
    // プラン選択の中身は PlanOptionList のテストで見る。
    // ここは「固定側に差し込まれること」だけを確認したいので差し替え可能な印にする
    planSelector: <Text testID="plan-slot-content">プラン</Text>,
    billingNote: 'はじめての方は3日間無料。8月18日から ¥680／月。',
    purchasing: false,
    onPurchase: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('渡されたプラン選択を固定側に描画する', () => {
    const { getByTestId } = render(<CosmicPaywallFooter {...defaultProps} />);

    expect(getByTestId('plan-slot-content')).toBeTruthy();
  });

  it('固定側に規約リンクを置かない', () => {
    // 固定領域が画面の半分を占めるのを避けるため本文側へ移した。
    // 「画面から消えた」のではないことは PaywallCosmicJourney のテストで対にして押さえる
    const { queryByText } = render(<CosmicPaywallFooter {...defaultProps} />);

    expect(queryByText('利用規約')).toBeNull();
  });

  it('固定側に購入を復元を置かない', () => {
    const { queryByText } = render(<CosmicPaywallFooter {...defaultProps} />);

    expect(queryByText('購入を復元')).toBeNull();
  });

  it('レンダリングしたときCTAに「無料で始める」が表示される', () => {
    const { getByText } = render(<CosmicPaywallFooter {...defaultProps} />);

    expect(getByText('無料で始める')).toBeTruthy();
  });

  it('請求文を渡したときそのまま表示される', () => {
    const { getByText } = render(<CosmicPaywallFooter {...defaultProps} />);

    expect(getByText('はじめての方は3日間無料。8月18日から ¥680／月。')).toBeTruthy();
  });

  it('CTAを押したとき onPurchase が呼ばれる', () => {
    const { getByText } = render(<CosmicPaywallFooter {...defaultProps} />);

    fireEvent.press(getByText('無料で始める'));

    expect(defaultProps.onPurchase).toHaveBeenCalled();
  });


  it('購入処理中のときCTAのラベルが消える', () => {
    // Button は loading 中にラベルを ActivityIndicator へ差し替える。
    // ラベルが無い＝二重購入のタップ先が存在しない、という担保
    const { queryByText } = render(<CosmicPaywallFooter {...defaultProps} purchasing />);

    expect(queryByText('無料で始める')).toBeNull();
  });

  it('購入処理中でも請求文は読める', () => {
    const { getByText } = render(<CosmicPaywallFooter {...defaultProps} purchasing />);

    expect(getByText('はじめての方は3日間無料。8月18日から ¥680／月。')).toBeTruthy();
  });
});
