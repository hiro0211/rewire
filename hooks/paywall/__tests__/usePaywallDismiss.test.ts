import { usePaywallDismiss } from '../usePaywallDismiss';

const mockReplace = jest.fn();
const mockDismiss = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, dismiss: mockDismiss }),
}));

jest.mock('@/lib/paywall/discountExpiry', () => ({
  discountExpiry: {
    getRemainingSeconds: jest.fn().mockResolvedValue(0),
  },
}));

describe('usePaywallDismiss', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('エクスポートされる', () => {
    expect(usePaywallDismiss).toBeDefined();
  });
});
