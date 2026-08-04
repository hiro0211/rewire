jest.mock('@/lib/nativeGuard', () => ({ isExpoGo: false }));

const mockConfigure = jest.fn();
jest.mock('react-native-purchases', () => ({
  __esModule: true,
  default: {
    configure: (...args: any[]) => mockConfigure(...args),
    setLogLevel: jest.fn(),
  },
  LOG_LEVEL: { ERROR: 4 },
}));

const mockLoggerWarn = jest.fn();
jest.mock('@/lib/logger', () => ({
  logger: { error: jest.fn(), warn: (...args: any[]) => mockLoggerWarn(...args), info: jest.fn(), debug: jest.fn() },
}));

// モジュールのトップレベルで env を読むため、読み込み前に消しておく
delete process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS;
delete process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID;

const { subscriptionClient } =
  require('../subscriptionClient') as typeof import('../subscriptionClient');

describe('subscriptionClient — RevenueCat API キー未設定', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('configure を呼ばない', async () => {
    await subscriptionClient.initialize();
    expect(mockConfigure).not.toHaveBeenCalled();
  });

  it('原因が追えるよう警告ログを残す', async () => {
    // 以前は無言 return で、ペイウォールが unavailable になる以外の手がかりが無かった
    await subscriptionClient.initialize();
    expect(mockLoggerWarn).toHaveBeenCalled();
  });

  it('再度呼べば再試行する', async () => {
    // 同期的に早期 return する経路では `_initPromise` が消えず、以降の
    // initialize() が古い Promise を返し続けて再試行が死んでいた
    // （useOfferings は初期化を最大2回リトライする設計）。
    await subscriptionClient.initialize();
    mockLoggerWarn.mockClear();
    await subscriptionClient.initialize();
    expect(mockLoggerWarn).toHaveBeenCalled();
  });

  it('初期化済みにはならない', async () => {
    await subscriptionClient.initialize();
    expect(subscriptionClient.isReady()).toBe(false);
  });
});
