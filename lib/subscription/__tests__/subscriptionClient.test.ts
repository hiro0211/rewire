const mockConfigure = jest.fn().mockResolvedValue(undefined);
const mockGetOfferings = jest.fn();
const mockPurchasePackage = jest.fn();
const mockRestorePurchases = jest.fn();
const mockGetCustomerInfo = jest.fn();
const mockSetLogLevel = jest.fn();
const mockAddListener = jest.fn();

jest.mock('@/lib/nativeGuard', () => ({ isExpoGo: false }));

jest.mock('react-native-purchases', () => ({
  __esModule: true,
  default: {
    configure: (...args: any[]) => mockConfigure(...args),
    getOfferings: (...args: any[]) => mockGetOfferings(...args),
    purchasePackage: (...args: any[]) => mockPurchasePackage(...args),
    restorePurchases: (...args: any[]) => mockRestorePurchases(...args),
    getCustomerInfo: (...args: any[]) => mockGetCustomerInfo(...args),
    setLogLevel: (...args: any[]) => mockSetLogLevel(...args),
    addCustomerInfoUpdateListener: (...args: any[]) => mockAddListener(...args),
  },
  LOG_LEVEL: { ERROR: 4 },
}));

// Must set env vars BEFORE the module is loaded (import is hoisted above process.env)
process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS = 'test-ios-key';
process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID = 'test-android-key';

// Use require to control load order (after env vars are set)
const { subscriptionClient } = require('../subscriptionClient') as typeof import('../subscriptionClient');

describe('subscriptionClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (subscriptionClient as any)._resetForTesting();
  });

  describe('initialize', () => {
    it('Purchases.configureを呼び出す', async () => {
      await subscriptionClient.initialize();
      expect(mockConfigure).toHaveBeenCalledWith({ apiKey: 'test-ios-key' });
    });

    it('初期化後isReadyがtrueを返す', async () => {
      await subscriptionClient.initialize();
      expect(subscriptionClient.isReady()).toBe(true);
    });

    it('configureエラー時にisReadyがfalseを返す', async () => {
      mockConfigure.mockRejectedValueOnce(new Error('Config failed'));
      await subscriptionClient.initialize();
      expect(subscriptionClient.isReady()).toBe(false);
    });
  });

  describe('getOfferings', () => {
    it('パッケージ一覧をマッピングして返す', async () => {
      mockGetOfferings.mockResolvedValue({
        current: {
          availablePackages: [
            {
              identifier: '$rc_monthly',
              packageType: 'monthly',
              product: { priceString: '¥580', price: 580 },
            },
            {
              identifier: '$rc_annual',
              packageType: 'annual',
              product: { priceString: '¥4,200', price: 4200 },
            },
          ],
        },
      });

      const result = await subscriptionClient.getOfferings();
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(expect.objectContaining({
        identifier: '$rc_monthly',
        plan: 'pro_monthly',
        priceString: '¥580',
      }));
      expect(result[1]).toEqual(expect.objectContaining({
        identifier: '$rc_annual',
        plan: 'pro_annual',
      }));
    });

    it('currentがない場合は空配列を返す', async () => {
      mockGetOfferings.mockResolvedValue({ current: null });
      const result = await subscriptionClient.getOfferings();
      expect(result).toEqual([]);
    });

    it('エラー時は空配列を返す', async () => {
      mockGetOfferings.mockRejectedValue(new Error('Network error'));
      const result = await subscriptionClient.getOfferings();
      expect(result).toEqual([]);
    });
  });

  describe('purchase', () => {
    beforeEach(() => {
      mockGetOfferings.mockResolvedValue({
        current: {
          availablePackages: [
            { identifier: 'monthly', product: {} },
          ],
        },
      });
    });

    it('購入成功時にSubscriptionStatusを返す', async () => {
      mockPurchasePackage.mockResolvedValue({
        customerInfo: {
          entitlements: {
            active: {
              'Rewire Pro': { expirationDate: '2027-01-01', willRenew: true, productIdentifier: 'monthly' },
            },
          },
        },
      });

      const result = await subscriptionClient.purchase('monthly');
      expect(result.isActive).toBe(true);
      expect(result.plan).toBe('pro_monthly');
    });

    it('パッケージが見つからない場合はFREE_STATUSを返す', async () => {
      const result = await subscriptionClient.purchase('nonexistent');
      expect(result.isActive).toBe(false);
      expect(result.plan).toBe('free');
    });

    it('エラー時はFREE_STATUSを返す', async () => {
      mockPurchasePackage.mockRejectedValue(new Error('Purchase cancelled'));
      const result = await subscriptionClient.purchase('monthly');
      expect(result.isActive).toBe(false);
    });
  });

  describe('restorePurchases', () => {
    it('復元成功時にSubscriptionStatusを返す', async () => {
      mockRestorePurchases.mockResolvedValue({
        entitlements: {
          active: {
            'Rewire Pro': { expirationDate: '2027-01-01', willRenew: true, productIdentifier: 'yearly' },
          },
        },
      });

      const result = await subscriptionClient.restorePurchases();
      expect(result.isActive).toBe(true);
      expect(result.plan).toBe('pro_annual');
    });

    it('エラー時はFREE_STATUSを返す', async () => {
      mockRestorePurchases.mockRejectedValue(new Error('Restore failed'));
      const result = await subscriptionClient.restorePurchases();
      expect(result.isActive).toBe(false);
    });
  });

  describe('getSubscriptionStatus', () => {
    it('Pro状態の場合isActive=trueを返す', async () => {
      mockGetCustomerInfo.mockResolvedValue({
        entitlements: {
          active: {
            'Rewire Pro': { expirationDate: '2027-01-01', willRenew: true, productIdentifier: 'monthly' },
          },
        },
      });

      const result = await subscriptionClient.getSubscriptionStatus();
      expect(result.isActive).toBe(true);
    });

    it('Free状態の場合isActive=falseを返す', async () => {
      mockGetCustomerInfo.mockResolvedValue({
        entitlements: { active: {} },
      });

      const result = await subscriptionClient.getSubscriptionStatus();
      expect(result.isActive).toBe(false);
      expect(result.plan).toBe('free');
    });

    it('lifetimeプランを正しくマッピングする', async () => {
      mockGetCustomerInfo.mockResolvedValue({
        entitlements: {
          active: {
            'Rewire Pro': { expirationDate: null, willRenew: false, productIdentifier: 'lifetime_pro' },
          },
        },
      });

      const result = await subscriptionClient.getSubscriptionStatus();
      expect(result.plan).toBe('pro_lifetime');
      expect(result.expiresAt).toBeNull();
      expect(result.willRenew).toBe(false);
    });

    it('エラー時はFREE_STATUSを返す', async () => {
      mockGetCustomerInfo.mockRejectedValue(new Error('Network error'));
      const result = await subscriptionClient.getSubscriptionStatus();
      expect(result.isActive).toBe(false);
    });
  });

  describe('addListener', () => {
    it('Purchases.addCustomerInfoUpdateListenerを呼び出す', () => {
      const callback = jest.fn();
      subscriptionClient.addListener(callback);
      expect(mockAddListener).toHaveBeenCalled();
    });
  });
});
