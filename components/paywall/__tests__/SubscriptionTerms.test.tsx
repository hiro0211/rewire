import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(),
}));

import * as WebBrowser from 'expo-web-browser';
import { SubscriptionTerms } from '../SubscriptionTerms';

describe('SubscriptionTerms', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('自動更新テキストが表示される', () => {
    const { getByText } = render(<SubscriptionTerms />);
    expect(getByText(/サブスクリプションは期間終了の24時間前までにキャンセルしない限り自動更新されます/)).toBeTruthy();
    expect(getByText(/お支払いはApple IDに請求されます/)).toBeTruthy();
  });

  it('trialText が渡された場合にトライアル固有文言が表示される', () => {
    const { getByText } = render(
      <SubscriptionTerms trialText="無料トライアル終了後、サブスクリプション料金が自動で課金されます。" />
    );
    expect(getByText(/無料トライアル終了後、サブスクリプション料金が自動で課金されます/)).toBeTruthy();
  });

  it('trialText が無い場合にトライアル文言が表示されない', () => {
    const { queryByText } = render(<SubscriptionTerms />);
    expect(queryByText(/無料トライアル終了後/)).toBeNull();
  });

  it('利用規約リンクが表示される', () => {
    const { getByText } = render(<SubscriptionTerms />);
    expect(getByText('利用規約')).toBeTruthy();
  });

  it('プライバシーポリシーリンクが表示される', () => {
    const { getByText } = render(<SubscriptionTerms />);
    expect(getByText('プライバシーポリシー')).toBeTruthy();
  });

  it('利用規約タップでWebBrowserが開く', () => {
    const { getByText } = render(<SubscriptionTerms />);
    fireEvent.press(getByText('利用規約'));
    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(
      'https://hiro0211.github.io/rewire-support/#terms'
    );
  });

  it('プライバシーポリシータップでWebBrowserが開く', () => {
    const { getByText } = render(<SubscriptionTerms />);
    fireEvent.press(getByText('プライバシーポリシー'));
    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(
      'https://hiro0211.github.io/rewire-support/#privacy'
    );
  });
});
