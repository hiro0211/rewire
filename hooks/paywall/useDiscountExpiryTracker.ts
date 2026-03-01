import { useEffect } from 'react';
import { discountExpiry } from '@/lib/paywall/discountExpiry';

export function useDiscountExpiryTracker(): void {
  useEffect(() => {
    discountExpiry.recordFirstExposure();
  }, []);
}
