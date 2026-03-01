import { renderHook } from '@testing-library/react-native';
import { discountExpiry } from '@/lib/paywall/discountExpiry';

jest.mock('@/lib/paywall/discountExpiry', () => ({
  discountExpiry: {
    recordFirstExposure: jest.fn().mockResolvedValue(undefined),
  },
}));

import { useDiscountExpiryTracker } from '../useDiscountExpiryTracker';

describe('useDiscountExpiryTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('マウント時にrecordFirstExposureを1回呼ぶ', () => {
    renderHook(() => useDiscountExpiryTracker());
    expect(discountExpiry.recordFirstExposure).toHaveBeenCalledTimes(1);
  });

  it('再レンダリングでも1回だけ呼ばれる', () => {
    const { rerender } = renderHook(() => useDiscountExpiryTracker());
    rerender({});
    expect(discountExpiry.recordFirstExposure).toHaveBeenCalledTimes(1);
  });
});
