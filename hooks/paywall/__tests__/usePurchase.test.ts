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

    it('購入エラー時（不明なエラー）にアラートを表示する', async () => {
      mockPurchasePackage.mockRejectedValue(new Error('test error'));

      const { result } = renderUsePurchase();
      await act(async () => {
        await result.current.handlePurchase();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        '購入エラー',
        expect.stringContaining('お支払い処理中にエラーが発生しました'),
      );
      expect(result.current.purchasing).toBe(false);
    });

    it('STORE_PROBLEM エラー時に App Store 接続問題のメッセージを表示', async () => {
      mockPurchasePackage.mockRejectedValue({ code: '2', message: 'store problem' });

      const { result } = renderUsePurchase();
      await act(async () => {
        await result.current.handlePurchase();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        '購入エラー',
        expect.stringContaining('App Store'),
      );
    });

    it('PURCHASE_NOT_ALLOWED エラー時にデバイス制限のメッセージを表示', async () => {
      mockPurchasePackage.mockRejectedValue({ code: '3', message: 'not allowed' });

      const { result } = renderUsePurchase();
      await act(async () => {
        await result.current.handlePurchase();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        '購入エラー',
        expect.stringContaining('購入が許可されていません'),
      );
    });

    it('NETWORK_ERROR 時にネットワーク確認のメッセージを表示', async () => {
      mockPurchasePackage.mockRejectedValue({ code: '10', message: 'network' });

      const { result } = renderUsePurchase();
      await act(async () => {
        await result.current.handlePurchase();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        '購入エラー',
        expect.stringContaining('ネットワーク'),
      );
    });

    it('OPERATION_ALREADY_IN_PROGRESS (code=15) 時に進行中メッセージを表示', async () => {
      mockPurchasePackage.mockRejectedValue({ code: '15', message: 'in progress' });

      const { result } = renderUsePurchase();
      await act(async () => {
        await result.current.handlePurchase();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        '購入エラー',
        expect.stringContaining('進行中'),
      );
    });

    it('INELIGIBLE_ERROR (code=18) 時に不適格メッセージを表示', async () => {
      mockPurchasePackage.mockRejectedValue({ code: '18', message: 'ineligible' });

      const { result } = renderUsePurchase();
      await act(async () => {
        await result.current.handlePurchase();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        '購入エラー',
        expect.stringContaining('ご利用いただけません'),
      );
    });

    it('PAYMENT_PENDING (code=20) 時に承認待ちメッセージを表示', async () => {
      mockPurchasePackage.mockRejectedValue({ code: '20', message: 'pending' });

      const { result } = renderUsePurchase();
      await act(async () => {
        await result.current.handlePurchase();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        '購入保留中',
        expect.stringContaining('承認'),
      );
    });

    it('CONFIGURATION_ERROR (code=23) 時にエラーメッセージを表示', async () => {
      mockPurchasePackage.mockRejectedValue({ code: '23', message: 'config error' });

      const { result } = renderUsePurchase();
      await act(async () => {
        await result.current.handlePurchase();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        '購入エラー',
        expect.stringContaining('しばらくしてから再度お試しください'),
      );
    });

    it('PRODUCT_REQUEST_TIMED_OUT (code=32) 時にタイムアウトメッセージを表示', async () => {
      mockPurchasePackage.mockRejectedValue({ code: '32', message: 'timeout' });

      const { result } = renderUsePurchase();
      await act(async () => {
        await result.current.handlePurchase();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        '購入エラー',
        expect.stringContaining('タイムアウト'),
      );
    });

    it('OFFLINE_CONNECTION_ERROR (code=35) 時にオフラインメッセージを表示', async () => {
      mockPurchasePackage.mockRejectedValue({ code: '35', message: 'offline' });

      const { result } = renderUsePurchase();
      await act(async () => {
        await result.current.handlePurchase();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        '購入エラー',
        expect.stringContaining('ネットワーク'),
      );
    });

    it('PURCHASE_CANCELLED (code=1) 時にアラートを表示しない', async () => {
      mockPurchasePackage.mockRejectedValue({ code: '1', message: 'cancelled' });

      const { result } = renderUsePurchase();
      await act(async () => {
        await result.current.handlePurchase();
      });

      expect(Alert.alert).not.toHaveBeenCalled();
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

    it('リストアエラー時（不明なエラー）にアラートを表示', async () => {
      mockRestorePurchases.mockRejectedValue(new Error('restore error'));

      const { result } = renderUsePurchase();
      await act(async () => {
        await result.current.handleRestore();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        '復元エラー',
        expect.stringContaining('購入の復元中にエラーが発生しました'),
      );
      expect(result.current.purchasing).toBe(false);
    });

    it('リストアの NETWORK_ERROR 時にネットワーク確認メッセージを表示', async () => {
      mockRestorePurchases.mockRejectedValue({ code: '10', message: 'network' });

      const { result } = renderUsePurchase();
      await act(async () => {
        await result.current.handleRestore();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        '復元エラー',
        expect.stringContaining('ネットワーク'),
      );
    });
  });
});
