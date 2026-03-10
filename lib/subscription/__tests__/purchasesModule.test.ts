jest.mock('@/lib/nativeGuard', () => ({
  isExpoGo: false,
}));

jest.mock('react-native-purchases', () => ({
  default: { configure: jest.fn(), getOfferings: jest.fn() },
}));

describe('purchasesModule', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('isExpoGo=false のとき Purchases が読み込まれる', () => {
    jest.doMock('@/lib/nativeGuard', () => ({ isExpoGo: false }));
    const { Purchases } = require('../purchasesModule');
    expect(Purchases).toBeDefined();
    expect(Purchases).not.toBeNull();
  });

  it('isExpoGo=true のとき Purchases が null になる', () => {
    jest.doMock('@/lib/nativeGuard', () => ({ isExpoGo: true }));
    const { Purchases } = require('../purchasesModule');
    expect(Purchases).toBeNull();
  });
});
