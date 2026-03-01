describe('nativeModules', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('should not load Purchases or RevenueCatUI in Expo Go environment', () => {
    jest.doMock('@/lib/nativeGuard', () => ({ isExpoGo: true }));

    const { Purchases, RevenueCatUI } = require('../nativeModules');

    expect(Purchases).toBeNull();
    expect(RevenueCatUI).toBeNull();
  });

  it('should load Purchases and RevenueCatUI when not in Expo Go and modules are available', () => {
    jest.doMock('@/lib/nativeGuard', () => ({ isExpoGo: false }));
    jest.doMock('react-native-purchases', () => ({
      default: { purchasePackage: jest.fn(), addCustomerInfoUpdateListener: jest.fn(), getOfferings: jest.fn() },
    }), { virtual: true });
    jest.doMock('react-native-purchases-ui', () => ({
      default: { presentCustomerCenter: jest.fn() },
    }), { virtual: true });

    const { Purchases, RevenueCatUI } = require('../nativeModules');

    expect(Purchases).not.toBeNull();
    expect(Purchases).toEqual(expect.any(Object));
    expect(RevenueCatUI).not.toBeNull();
    expect(RevenueCatUI).toEqual(expect.any(Object));
  });

  it('should not load Purchases or RevenueCatUI when not in Expo Go and modules are unavailable', () => {
    jest.doMock('@/lib/nativeGuard', () => ({ isExpoGo: false }));
    jest.doMock('react-native-purchases', () => {
      throw new Error('Module not found');
    }, { virtual: true });
    jest.doMock('react-native-purchases-ui', () => {
      throw new Error('Module not found');
    }, { virtual: true });

    const { Purchases, RevenueCatUI } = require('../nativeModules');

    expect(Purchases).toBeNull();
    expect(RevenueCatUI).toBeNull();
  });
});
