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

const mockLoggerError = jest.fn();
const mockLoggerWarn = jest.fn();
jest.mock('@/lib/logger', () => ({
  logger: {
    error: (...args: any[]) => mockLoggerError(...args),
    warn: (...args: any[]) => mockLoggerWarn(...args),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

const mockTrackEvent = jest.fn();
jest.mock('@/lib/tracking/trackEvent', () => ({
  trackEvent: (...args: any[]) => mockTrackEvent(...args),
}));

const mockPackage = { identifier: '$rc_annual' };
const onPurchaseCompleted = jest.fn();
const onRestoreCompleted = jest.fn();

function renderUsePurchase(pkg: any = mockPackage) {
  return renderHook(() =>
    usePurchase({
      package: pkg,
      plan: 'annual',
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

    it('購入成功時に onPurchaseCompleted へ購入プランを渡す', async () => {
      // pro_purchase_completed に plan を載せるため、成功時にどのプランだったかを伝える
      mockPurchasePackage.mockResolvedValue({
        customerInfo: { entitlements: { active: { 'Rewire Pro': {} } } },
      });

      const { result } = renderUsePurchase();
      await act(async () => {
        await result.current.handlePurchase();
      });

      expect(onPurchaseCompleted).toHaveBeenCalledWith('annual');
    });

    describe('決済は成功したのに Pro 権利が付いていない場合', () => {
      // RevenueCat 側の entitlement 識別子がアプリ側の定数と一致しないと起きる。
      // 以前は else が無く、アラートも計測も出ずに画面が無反応になっていた。
      const noEntitlement = { customerInfo: { entitlements: { active: {} } } };

      it('onPurchaseCompleted を呼ばない', async () => {
        mockPurchasePackage.mockResolvedValue(noEntitlement);
        const { result } = renderUsePurchase();
        await act(async () => {
          await result.current.handlePurchase();
        });
        expect(onPurchaseCompleted).not.toHaveBeenCalled();
      });

      it('purchase_failed を entitlement_missing で送信する', async () => {
        mockPurchasePackage.mockResolvedValue(noEntitlement);
        const { result } = renderUsePurchase();
        await act(async () => {
          await result.current.handlePurchase();
        });
        expect(mockTrackEvent).toHaveBeenCalledWith('purchase_failed', {
          reason: 'entitlement_missing',
          cancelled: false,
        });
      });

      it('ユーザーにアラートを表示する', async () => {
        mockPurchasePackage.mockResolvedValue(noEntitlement);
        const { result } = renderUsePurchase();
        await act(async () => {
          await result.current.handlePurchase();
        });
        expect(Alert.alert).toHaveBeenCalled();
      });

      it('原因調査のため logger.error を残す', async () => {
        mockPurchasePackage.mockResolvedValue(noEntitlement);
        const { result } = renderUsePurchase();
        await act(async () => {
          await result.current.handlePurchase();
        });
        expect(mockLoggerError).toHaveBeenCalled();
      });
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

    it('ユーザーキャンセル時に logger.error を呼ばない', async () => {
      mockPurchasePackage.mockRejectedValue({ userCancelled: true });

      const { result } = renderUsePurchase();
      await act(async () => {
        await result.current.handlePurchase();
      });

      expect(mockLoggerError).not.toHaveBeenCalled();
    });

    it('PURCHASE_CANCELLED (code=1) 時に logger.error を呼ばない', async () => {
      mockPurchasePackage.mockRejectedValue({ code: '1', message: 'cancelled' });

      const { result } = renderUsePurchase();
      await act(async () => {
        await result.current.handlePurchase();
      });

      expect(mockLoggerError).not.toHaveBeenCalled();
    });

    it('実際のエラー時には logger.error が呼ばれる', async () => {
      mockPurchasePackage.mockRejectedValue({ code: '2', message: 'store problem' });

      const { result } = renderUsePurchase();
      await act(async () => {
        await result.current.handlePurchase();
      });

      expect(mockLoggerError).toHaveBeenCalledWith('Purchase', 'failed:', expect.any(Object));
    });

    it('パッケージが null の場合エラーアラートを表示', async () => {
      const { result } = renderUsePurchase(null);
      await act(async () => {
        await result.current.handlePurchase();
      });

      expect(Alert.alert).toHaveBeenCalledWith('エラー', 'プランの取得に失敗しました。再度お試しください。');
    });

    it('購入開始時に purchase_initiated を plan 付きで送信する', async () => {
      mockPurchasePackage.mockResolvedValue({
        customerInfo: { entitlements: { active: { 'Rewire Pro': {} } } },
      });

      const { result } = renderUsePurchase();
      await act(async () => {
        await result.current.handlePurchase();
      });

      expect(mockTrackEvent).toHaveBeenCalledWith('purchase_initiated', { plan: 'annual' });
    });

    it('ユーザーキャンセル時に purchase_failed を cancelled=true で送信する', async () => {
      mockPurchasePackage.mockRejectedValue({ userCancelled: true, code: '1' });

      const { result } = renderUsePurchase();
      await act(async () => {
        await result.current.handlePurchase();
      });

      expect(mockTrackEvent).toHaveBeenCalledWith('purchase_failed', {
        reason: '1',
        cancelled: true,
      });
    });

    it('実エラー時に purchase_failed を cancelled=false で送信する', async () => {
      mockPurchasePackage.mockRejectedValue({ code: '2', message: 'store problem' });

      const { result } = renderUsePurchase();
      await act(async () => {
        await result.current.handlePurchase();
      });

      expect(mockTrackEvent).toHaveBeenCalledWith('purchase_failed', {
        reason: '2',
        cancelled: false,
      });
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

    it('リストア実行時に restore_tapped を送信する', async () => {
      mockRestorePurchases.mockResolvedValue({ entitlements: { active: {} } });

      const { result } = renderUsePurchase();
      await act(async () => {
        await result.current.handleRestore();
      });

      expect(mockTrackEvent).toHaveBeenCalledWith('restore_tapped');
    });

    it('リストア成功時に restore_completed を success=true で送信する', async () => {
      mockRestorePurchases.mockResolvedValue({
        entitlements: { active: { 'Rewire Pro': {} } },
      });

      const { result } = renderUsePurchase();
      await act(async () => {
        await result.current.handleRestore();
      });

      expect(mockTrackEvent).toHaveBeenCalledWith('restore_completed', { success: true });
    });

    it('有効サブスク無し時に restore_completed を success=false で送信する', async () => {
      mockRestorePurchases.mockResolvedValue({ entitlements: { active: {} } });

      const { result } = renderUsePurchase();
      await act(async () => {
        await result.current.handleRestore();
      });

      expect(mockTrackEvent).toHaveBeenCalledWith('restore_completed', { success: false });
    });
  });
});
