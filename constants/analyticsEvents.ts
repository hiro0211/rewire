/**
 * Single source of truth for feature-usage analytics events + their param shapes.
 *
 * New events MUST be fired through `trackEvent` (lib/tracking/trackEvent.ts) so
 * names and params are type-checked at the call site (no stray string typos).
 *
 * NOTE: when adding an event here, also add its name to `REWIRE_KEY_EVENTS` in
 * `scripts/analytics/firebase_ga4_client.py` (separate language — manual sync)
 * so the daily report picks it up.
 *
 * Use `undefined` as the param type for events that carry no params.
 */
export interface AnalyticsEventParams {
  // --- Lessons ---
  lesson_started: { lesson_id: string };
  lesson_completed: { lesson_id: string };

  // --- Dashboard / achievements ---
  quick_action_tapped: { action: 'breathe' | 'checkin' | 'calendar' };
  achievements_opened: undefined;
  badge_unlocked: { badge_id: string; chapter: string };

  // --- Paywall depth ---
  plan_selected: { plan: string };
  purchase_initiated: { plan: string };
  purchase_failed: { reason: string; cancelled: boolean };
  restore_tapped: undefined;
  restore_completed: { success: boolean };
  paywall_dismissed: { source: string };

  // --- Notifications ---
  notification_permission: { granted: boolean };
  notification_scheduled: { hour: number };
  notification_opened: { route: string };
}

export type AnalyticsEventName = keyof AnalyticsEventParams;
