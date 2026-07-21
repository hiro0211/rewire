import { useEffect, useRef } from 'react';

import { analyticsClient } from '@/lib/tracking/analyticsClient';
import { daysSinceInstall, ensureInstallDate } from '@/lib/tracking/installDate';

/**
 * Stamps every app launch with how many days into their lifecycle the user is.
 *
 * GA4's automatic `session_start` says a user was active on a date, but not how
 * far past install that date was — so "most people stop around day 3" is not
 * answerable from it. `app_open { days_since_install }` supplies the missing
 * axis for the churn-day distribution.
 *
 * @param userCreatedAt existing user's `createdAt`, used to seed the install
 *   date for people who installed before this shipped.
 */
export function useAppOpenTracking(userCreatedAt: string | null): void {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    (async () => {
      await ensureInstallDate(userCreatedAt);
      const day = await daysSinceInstall();
      if (day === null) return;

      analyticsClient.logEvent('app_open', { days_since_install: day });
      analyticsClient.setUserProperty('days_since_install', String(day));
    })();
  }, [userCreatedAt]);
}
