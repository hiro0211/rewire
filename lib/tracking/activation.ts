import { asyncStorageClient } from '@/lib/storage/asyncStorageClient';

import { analyticsClient } from './analyticsClient';
import { daysSinceInstall } from './installDate';

/**
 * The activation ("発火") milestone: the first time a user actually receives
 * the app's core value — completing a breathing session after onboarding.
 *
 * This is the denominator for 真のリテンション. Overall retention is diluted by
 * people who installed and never used anything; measuring retention among
 * activated users is what tells us whether the product holds people who have
 * genuinely tried it.
 */

const STORAGE_KEY = 'analytics_activation';

/** Where the user was when they first reached the core loop. */
export type ActivationPath = 'sos' | 'quick_action' | 'onboarding' | 'other';

interface ActivationRecord {
  path: ActivationPath;
  /** Days from install to activation, or null when install date was unknown. */
  day: number | null;
}

async function read(): Promise<ActivationRecord | null> {
  return asyncStorageClient.get<ActivationRecord>(STORAGE_KEY);
}

/** Whether this user has ever reached the core loop. */
export async function isActivated(): Promise<boolean> {
  return (await read()) !== null;
}

/** Days from install to activation, or null if not activated (or unknown). */
export async function getActivationDay(): Promise<number | null> {
  const record = await read();
  return record ? record.day : null;
}

/**
 * Records activation and fires `activation_reached` — but only the first time.
 *
 * Firing on every breathing session would turn this into a usage counter and
 * destroy its value as a one-per-user milestone.
 */
export async function trackActivation(
  path: ActivationPath,
  now: Date = new Date(),
): Promise<void> {
  if (await isActivated()) return;

  const day = await daysSinceInstall(now);
  await asyncStorageClient.set<ActivationRecord>(STORAGE_KEY, { path, day });

  analyticsClient.logEvent('activation_reached', {
    path,
    ...(day === null ? {} : { days_since_install: day }),
  });

  analyticsClient.setUserProperty('is_activated', 'true');
  if (day !== null) {
    analyticsClient.setUserProperty('activation_day', String(day));
  }
}
