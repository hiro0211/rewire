import { getPurchaseErrorKeys } from '../purchaseErrors';

describe('getPurchaseErrorKeys', () => {
  it('ユーザーキャンセル時はnullを返す', () => {
    expect(getPurchaseErrorKeys({ userCancelled: true })).toBeNull();
  });

  it('code="1" (キャンセル) はnullを返す', () => {
    expect(getPurchaseErrorKeys({ code: '1' })).toBeNull();
  });

  it('PURCHASE_CANCELLED はnullを返す', () => {
    expect(getPurchaseErrorKeys({ code: 'PURCHASE_CANCELLED' })).toBeNull();
  });

  it('STORE_PROBLEM はApp Storeエラーキーを返す', () => {
    const result = getPurchaseErrorKeys({ code: 'STORE_PROBLEM' });
    expect(result?.titleKey).toBe('errors.purchase.storeProblem.title');
    expect(result?.messageKey).toBe('errors.purchase.storeProblem.message');
  });

  it('NETWORK_ERROR はネットワークエラーキーを返す', () => {
    const result = getPurchaseErrorKeys({ code: 'NETWORK_ERROR' });
    expect(result?.titleKey).toBe('errors.purchase.networkError.title');
    expect(result?.messageKey).toBe('errors.purchase.networkError.message');
  });

  it('PAYMENT_PENDING は保留中キーを返す', () => {
    const result = getPurchaseErrorKeys({ code: 'PAYMENT_PENDING' });
    expect(result?.titleKey).toBe('errors.purchase.paymentPending.title');
  });

  it('不明なコードはデフォルトエラーキーを返す', () => {
    const result = getPurchaseErrorKeys({ code: '999' });
    expect(result?.titleKey).toBe('errors.purchase.defaultError.title');
    expect(result?.messageKey).toBe('errors.purchase.defaultError.message');
  });

  it('errorCode フォールバックも動作する', () => {
    expect(getPurchaseErrorKeys({ errorCode: '1' })).toBeNull();
  });
});
