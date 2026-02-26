import { useEffect } from 'react';
import { usePathname } from 'expo-router';
import { analyticsClient } from '@/lib/tracking/analyticsClient';

export function useScreenTracking() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      analyticsClient.logScreenView(pathname);
    }
  }, [pathname]);
}
