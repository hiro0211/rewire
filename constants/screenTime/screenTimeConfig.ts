// Route used by local notifications to deep-link into the panic screen.
export const PANIC_ROUTE = '/panic';

// Category identifier set on local notifications fired by the Shield extension
// when the user taps the primary button on the iOS Shield UI. Used as a
// fallback by useNotificationDeepLink in case the JS-side data.route path is
// missing.
export const PANIC_NOTIFICATION_IDENTIFIER = 'rewire-shield-panic';

// FamilyActivitySelection id used to persist the user-chosen browser apps
// in the App Group UserDefaults. Referenced by blockSelection / unblockSelection.
export const BROWSER_SELECTION_ID = 'rewire-browsers';
