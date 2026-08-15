import { useEffect, useRef } from 'react';

import { analyticsClient } from '@/lib/tracking/analyticsClient';
import { trackEvent } from '@/lib/tracking/trackEvent';
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
 * @param ready whether the user store has finished hydrating. We must not fire
 *   before this is true: on the first render `userCreatedAt` is null because the
 *   store hasn't loaded yet, and seeding the (write-once) install date with that
 *   null would stamp today's date on every existing user, restarting all
 *   retention cohorts on upgrade day.
 */
export function useAppOpenTracking(userCreatedAt: string | null, ready: boolean): void {
  const fired = useRef(false);

  useEffect(() => {
    if (!ready) return;
    if (fired.current) return;
    fired.current = true;

    (async () => {
      await ensureInstallDate(userCreatedAt);
      const day = await daysSinceInstall();
      if (day === null) return;

      trackEvent('app_open', { days_since_install: day });
      analyticsClient.setUserProperty('days_since_install', String(day));
    })();
  }, [ready, userCreatedAt]);
}
