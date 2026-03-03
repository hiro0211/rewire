import { renderHook, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { usePurchase } from '../usePurchase';

// Mock isExpoGo
jest.mock('@/lib/nativeGuard', () => ({ isExpoGo: false }));

// Mock react-native-purchases
const mockPurchasePackage = jest.fn();
const mockRestorePurchases = jest.fn();
jest.mock('react-native-purchases', () => ({
  __esModule: true,
  default: {
    purchasePackage: (...args: any[]) => mockPurchasePackage(...args),
    restorePurchases: (...args: any[]) => mockRestorePurchases(...args),
  },
}));

jest.spyOn(Alert, 'alert');

const mockPackage = { identifier: '$rc_annual' };
const onPurchaseCompleted = jest.fn();
const onRestoreCompleted = jest.fn();

function renderUsePurchase(pkg: any = mockPackage) {
  return renderHook(() =>
    usePurchase({
      package: pkg,
      onPurchaseCompleted,
      onRestoreCompleted,
    }),
  );
}

describe('usePurchase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('初期状態で purchasing が false', () => {
    const { result } = renderUsePurchase();
    expect(result.current.purchasing).toBe(false);
  });

  describe('handlePurchase', () => {
    it('購入成功時に onPurchaseCompleted が呼ばれる', async () => {
      mockPurchasePackage.mockResolvedValue({
        customerInfo: { entitlements: { active: { 'Rewire Pro': {} } } },
      });

      const { result } = renderUsePurchase();
      await act(async () => {
        await result.current.handlePurchase();
      });

      expect(onPurchaseCompleted).toHaveBeenCalled();
      expect(result.current.purchasing).toBe(false);
    });

    it('ユーザーキャンセル時にアラートを表示しない', async () => {
      mockPurchasePackage.mockRejectedValue({ userCancelled: true });

      const { result } = renderUsePurchase();
      await act(async () => {
        await result.current.handlePurchase();
      });

      expect(Alert.alert).not.toHaveBeenCalled();
      expect(result.current.purchasing).toBe(false);
    });

    it('購入エラー時にアラートを表示する', async () => {
      mockPurchasePackage.mockRejectedValue(new Error('test error'));

      const { result } = renderUsePurchase();
      await act(async () => {
        await result.current.handlePurchase();
      });

      expect(Alert.alert).toHaveBeenCalledWith('購入エラー', 'お支払い処理中にエラーが発生しました。');
      expect(result.current.purchasing).toBe(false);
    });

    it('パッケージが null の場合エラーアラートを表示', async () => {
      const { result } = renderUsePurchase(null);
      await act(async () => {
        await result.current.handlePurchase();
      });

      expect(Alert.alert).toHaveBeenCalledWith('エラー', 'プランの取得に失敗しました。再度お試しください。');
    });
  });

  describe('handleRestore', () => {
    it('リストア成功時に onRestoreCompleted が呼ばれる', async () => {
      mockRestorePurchases.mockResolvedValue({
        entitlements: { active: { 'Rewire Pro': {} } },
      });

      const { result } = renderUsePurchase();
      await act(async () => {
        await result.current.handleRestore();
      });

      expect(onRestoreCompleted).toHaveBeenCalled();
      expect(result.current.purchasing).toBe(false);
    });

    it('有効なサブスクリプションがない場合アラートを表示', async () => {
      mockRestorePurchases.mockResolvedValue({
        entitlements: { active: {} },
      });

      const { result } = renderUsePurchase();
      await act(async () => {
        await result.current.handleRestore();
      });

      expect(Alert.alert).toHaveBeenCalledWith('復元結果', '有効なサブスクリプションが見つかりませんでした。');
      expect(result.current.purchasing).toBe(false);
    });

    it('リストアエラー時にアラートを表示', async () => {
      mockRestorePurchases.mockRejectedValue(new Error('restore error'));

      const { result } = renderUsePurchase();
      await act(async () => {
        await result.current.handleRestore();
      });

      expect(Alert.alert).toHaveBeenCalledWith('復元エラー', '購入の復元中にエラーが発生しました。');
      expect(result.current.purchasing).toBe(false);
    });
  });
});
