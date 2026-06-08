import type { AnalyticsEventParams } from '@/constants/analyticsEvents';

import { analyticsClient } from './analyticsClient';

type EventArgs<K extends keyof AnalyticsEventParams> =
  AnalyticsEventParams[K] extends undefined ? [] : [params: AnalyticsEventParams[K]];

/**
 * Type-safe wrapper over `analyticsClient.logEvent`. The event name is checked
 * against the catalog in `constants/analyticsEvents.ts` and the params shape is
 * enforced per event, so typos and wrong params fail at compile time.
 */
export function trackEvent<K extends keyof AnalyticsEventParams>(
  event: K,
  ...args: EventArgs<K>
): void {
  analyticsClient.logEvent(event, ...(args as [Record<string, string | number | boolean>?]));
}
