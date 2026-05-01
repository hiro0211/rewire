export type PostPurchaseStep = 'thankYou' | 'safariSetup' | 'demo' | 'complete';

export const POST_PURCHASE_STEPS: PostPurchaseStep[] = [
  'thankYou',
  'safariSetup',
  'demo',
  'complete',
];

export const TOTAL_POST_PURCHASE_STEPS = POST_PURCHASE_STEPS.length;

export const DEMO_TEST_URL = 'https://hiro0211.github.io/rewire-demo-block/';
