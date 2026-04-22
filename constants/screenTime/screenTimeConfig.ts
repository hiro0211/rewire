// Route used by local notifications to deep-link into the panic screen.
// Historically lived in this file alongside Shield-specific constants
// (SHIELD_ID, WEB_FILTER_ACTIVITY_ID, PANIC_NOTIFICATION_IDENTIFIER) that
// were removed when Screen Time API integration was retired to unblock
// App Store submission. See docs/screen-time-restoration.md for history.
export const PANIC_ROUTE = '/panic';
