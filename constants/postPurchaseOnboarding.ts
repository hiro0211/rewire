export type PostPurchaseStep = 'thankYou' | 'screenTimeSetup' | 'complete';

export const POST_PURCHASE_STEPS: PostPurchaseStep[] = [
  'thankYou',
  'screenTimeSetup',
  'complete',
];

export const TOTAL_POST_PURCHASE_STEPS = POST_PURCHASE_STEPS.length;
