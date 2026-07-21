import { asyncStorageClient } from '@/lib/storage/asyncStorageClient';

/**
 * Records when this device first installed the app, so every analytics event
 * can carry `days_since_install`.
 *
 * GA4 can only tell us that a user was active on a given date; it cannot tell
 * us how far into their lifecycle that date was. Stamping the day count onto
 * events is what makes "users drop off around day 3" answerable.
 */

const STORAGE_KEY = 'analytics_install_date';

/** Calendar date in the device's local timezone, as YYYY-MM-DD. */
function toDateKey(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateKey(key: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) return null;
  const [, y, m, d] = match;
  return new Date(Number(y), Number(m) - 1, Number(d));
}

/**
 * Returns the stored install date, writing it on the first call.
 *
 * `seedIso` should be the existing user's `createdAt`. Everyone already using
 * the app when this ships would otherwise look like a fresh install, which
 * would restart every retention curve at the release date.
 */
export async function ensureInstallDate(
  seedIso?: string | null,
  now: Date = new Date(),
): Promise<string> {
  const existing = await asyncStorageClient.get<string>(STORAGE_KEY);
  if (existing) return existing;

  let installDate = toDateKey(now);
  if (seedIso) {
    const seeded = new Date(seedIso);
    if (!Number.isNaN(seeded.getTime())) {
      installDate = toDateKey(seeded);
    }
  }

  await asyncStorageClient.set(STORAGE_KEY, installDate);
  return installDate;
}

/**
 * Whole calendar days between install and `now`, or null before the install
 * date has been recorded.
 *
 * Counted in calendar days rather than elapsed 24h blocks: an 23:00 install
 * followed by a 01:00 open the next morning is day 1, which is how retention
 * cohorts are defined.
 */
export async function daysSinceInstall(now: Date = new Date()): Promise<number | null> {
  const stored = await asyncStorageClient.get<string>(STORAGE_KEY);
  if (!stored) return null;

  const installed = parseDateKey(stored);
  if (!installed) return null;

  const today = parseDateKey(toDateKey(now));
  if (!today) return null;

  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((today.getTime() - installed.getTime()) / msPerDay);
}
