import { getPurchaseErrorMessage } from '../purchaseErrors';

describe('getPurchaseErrorMessage', () => {
  it('ユーザーキャンセル時はnullを返す', () => {
    expect(getPurchaseErrorMessage({ userCancelled: true })).toBeNull();
  });

  it('code="1" (キャンセル) はnullを返す', () => {
    expect(getPurchaseErrorMessage({ code: '1' })).toBeNull();
  });

  it('PURCHASE_CANCELLED はnullを返す', () => {
    expect(getPurchaseErrorMessage({ code: 'PURCHASE_CANCELLED' })).toBeNull();
  });

  it('STORE_PROBLEM はApp Storeエラーメッセージを返す', () => {
    const result = getPurchaseErrorMessage({ code: 'STORE_PROBLEM' });
    expect(result?.title).toBe('購入エラー');
    expect(result?.message).toContain('App Store');
  });

  it('NETWORK_ERROR はネットワークエラーメッセージを返す', () => {
    const result = getPurchaseErrorMessage({ code: 'NETWORK_ERROR' });
    expect(result?.message).toContain('ネットワーク');
  });

  it('PAYMENT_PENDING は保留中メッセージを返す', () => {
    const result = getPurchaseErrorMessage({ code: 'PAYMENT_PENDING' });
    expect(result?.title).toBe('購入保留中');
  });

  it('不明なコードはデフォルトエラーを返す', () => {
    const result = getPurchaseErrorMessage({ code: '999' });
    expect(result?.title).toBe('購入エラー');
    expect(result?.message).toContain('エラーが発生しました');
  });

  it('errorCode フォールバックも動作する', () => {
    expect(getPurchaseErrorMessage({ errorCode: '1' })).toBeNull();
  });
});
