import { fireEvent, render, within } from '@testing-library/react-native';
import React from 'react';

jest.mock('@/lib/nativeGuard', () => ({ isExpoGo: true }));
jest.mock('expo-web-browser', () => ({ openBrowserAsync: jest.fn() }));
const mockTrackEvent = jest.fn();
jest.mock('@/lib/tracking/trackEvent', () => ({
  trackEvent: (...args: any[]) => mockTrackEvent(...args),
}));

import { PaywallCosmicJourney } from '../PaywallCosmicJourney';

const mockOffering = {
  annual: { product: { price: 5400, priceString: '¥5,400', currencyCode: 'JPY' } },
  monthly: { product: { price: 680, priceString: '¥680', currencyCode: 'JPY' } },
};

describe('PaywallCosmicJourney', () => {
  const defaultProps = {
    offering: mockOffering,
    onDismiss: jest.fn(),
    onPurchaseCompleted: jest.fn(),
    onRestoreCompleted: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // 請求開始日の表示を実行日に依存させないため Date だけ固定する。
    // TRIAL_DAYS=3 → 8月18日。タイマー系まで偽装すると AnimatedOrb の
    // useFrameCallback が unmount 時に落ちるので doNotFake で除外する。
    jest.useFakeTimers({
      doNotFake: [
        'hrtime',
        'nextTick',
        'performance',
        'queueMicrotask',
        'requestAnimationFrame',
        'cancelAnimationFrame',
        'requestIdleCallback',
        'cancelIdleCallback',
        'setImmediate',
        'clearImmediate',
        'setInterval',
        'clearInterval',
        'setTimeout',
        'clearTimeout',
      ],
      now: new Date(2026, 7, 15, 12, 0, 0),
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('クラッシュせずにレンダリングされる', () => {
    expect(() => render(<PaywallCosmicJourney {...defaultProps} />)).not.toThrow();
  });

  it('レンダリングしたとき見出し2行と本文が表示される', () => {
    const { getByText } = render(<PaywallCosmicJourney {...defaultProps} />);

    expect(getByText('意志力の問題じゃない。')).toBeTruthy();
    expect(getByText('仕組みで、止める。')).toBeTruthy();
    expect(getByText(/誘惑が強すぎるだけ/)).toBeTruthy();
  });






  it('レンダリングしたとき機能が5行表示される', () => {
    const { getAllByTestId } = render(<PaywallCosmicJourney {...defaultProps} />);

    expect(getAllByTestId('feature-row')).toHaveLength(5);
  });

  it('レンダリングしたときレビューが表示される', () => {
    const { getByTestId } = render(<PaywallCosmicJourney {...defaultProps} />);

    expect(getByTestId('review-carousel')).toBeTruthy();
  });

  it('レンダリングしたときプラン選択が固定フッターに出る', () => {
    const { getByTestId } = render(<PaywallCosmicJourney {...defaultProps} />);
    const footer = getByTestId('cosmic-paywall-footer');

    expect(within(footer).getByTestId('plan-option-list')).toBeTruthy();
  });

  it('初期表示のとき年額が選択されている', () => {
    const { getByTestId, queryByTestId } = render(<PaywallCosmicJourney {...defaultProps} />);

    expect(getByTestId('plan-annual-checked')).toBeTruthy();
    expect(queryByTestId('plan-monthly-checked')).toBeNull();
  });

  it('初期表示のとき請求文が年額になる', () => {
    const { getByText } = render(<PaywallCosmicJourney {...defaultProps} />);

    expect(getByText(/8月18日から ¥5,400／年。それまでに解約すれば/)).toBeTruthy();
  });

  it('年額カードに月換算と実際の請求総額の両方が出る', () => {
    // 総額を消すと「¥450 だと思ったら ¥5,400 請求された」になる
    const { getByText } = render(<PaywallCosmicJourney {...defaultProps} />);

    expect(getByText('¥450／月')).toBeTruthy();
    expect(getByText('¥5,400／年')).toBeTruthy();
  });

  it('月額に切り替えたとき請求文が月額になる', () => {
    const { getByTestId, getByText } = render(<PaywallCosmicJourney {...defaultProps} />);

    fireEvent.press(getByTestId('plan-monthly'));

    expect(getByText(/8月18日から ¥680／月。それまでに解約すれば/)).toBeTruthy();
  });

  it('月額に切り替えたとき plan_selected が monthly で送られる', () => {
    const { getByTestId } = render(<PaywallCosmicJourney {...defaultProps} />);

    fireEvent.press(getByTestId('plan-monthly'));

    expect(mockTrackEvent).toHaveBeenCalledWith('plan_selected', { plan: 'monthly' });
  });

  it('規約リンクは固定フッターの外にあるが画面からは消えていない', () => {
    // 「移した」ことの検証は片側だけでは足りない。
    // 固定側に無いことと、画面には在ることを対で押さえる
    const { getByTestId, getByText } = render(<PaywallCosmicJourney {...defaultProps} />);

    expect(
      within(getByTestId('cosmic-paywall-footer')).queryByText('利用規約')
    ).toBeNull();
    expect(getByText('利用規約')).toBeTruthy();
    expect(getByTestId('paywall-legal-block')).toBeTruthy();
  });

  it('自動更新の説明が画面内に残る', () => {
    const { getByText } = render(<PaywallCosmicJourney {...defaultProps} />);

    expect(getByText(/24時間前までに解約しない場合/)).toBeTruthy();
  });

  it('購入を復元が規約リンクと同じ末尾のブロックにある', () => {
    // 画面上部に単独で置くと浮いて見えるので、法的表記とまとめて末尾に置く。
    // Apple が要求するのは sign-up screen 内にあることで、位置の指定は無い
    const { getByTestId } = render(<PaywallCosmicJourney {...defaultProps} />);
    const legal = within(getByTestId('paywall-legal-block'));

    expect(legal.getByText('購入を復元')).toBeTruthy();
    expect(legal.getByText('利用規約')).toBeTruthy();
    expect(legal.getByText('プライバシーポリシー')).toBeTruthy();
  });

  it('購入を復元を固定フッターには置かない', () => {
    const { getByTestId } = render(<PaywallCosmicJourney {...defaultProps} />);

    expect(
      within(getByTestId('cosmic-paywall-footer')).queryByText('購入を復元')
    ).toBeNull();
  });

  it('レンダリングしたときCTAに「無料で始める」が表示される', () => {
    const { getByText } = render(<PaywallCosmicJourney {...defaultProps} />);

    expect(getByText('無料で始める')).toBeTruthy();
  });

  it('閉じるボタンを押したとき onDismiss が呼ばれる', () => {
    const { getByTestId } = render(<PaywallCosmicJourney {...defaultProps} />);

    fireEvent.press(getByTestId('close-button'));

    expect(defaultProps.onDismiss).toHaveBeenCalled();
  });





  it('レンダリングしたとき購入復元リンクが表示される', () => {
    const { getByText } = render(<PaywallCosmicJourney {...defaultProps} />);

    expect(getByText('購入を復元')).toBeTruthy();
  });

  it('翻訳キーが解決できたとき missing translation の生文字列が出ない', () => {
    const { queryByText } = render(<PaywallCosmicJourney {...defaultProps} />);

    expect(queryByText(/missing/i)).toBeNull();
  });
});
