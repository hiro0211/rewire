export type PostPurchaseStep = 'thankYou' | 'safariSetup' | 'demo' | 'complete';

export const POST_PURCHASE_STEPS: PostPurchaseStep[] = [
  'thankYou',
  'safariSetup',
  'demo',
  'complete',
];

export const TOTAL_POST_PURCHASE_STEPS = POST_PURCHASE_STEPS.length;

// DuckDuckGo's search URL — chosen because:
// 1. Most iOS users don't have the DuckDuckGo app installed, so this opens in Safari
//    (Universal Links won't intercept). The Google search URL (google.com/search) is
//    captured by the Google iOS app when installed, breaking the "open in Safari" UX.
// 2. DuckDuckGo returns explicit results for adult queries by default (no aggressive
//    SafeSearch like Google).
// 3. The results page shows "pornhub" in DuckDuckGo's search box — matches the
//    "検索窓にpornhubと入力した状態" UX requirement.
export const DEMO_TEST_URL = 'https://duckduckgo.com/?q=pornhub';
