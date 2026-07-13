export type PostPurchaseStep =
  | 'thankYou'
  | 'screenTimeIntro'
  | 'dataProtection'
  | 'screenTime'
  | 'blockerActivation'
  | 'complete';

export const POST_PURCHASE_STEPS: PostPurchaseStep[] = [
  'thankYou',
  'screenTimeIntro',
  'dataProtection',
  'screenTime',
  'blockerActivation',
  'complete',
];

export const TOTAL_POST_PURCHASE_STEPS = POST_PURCHASE_STEPS.length;

// ブロック開始ステップ: 成功トースト表示から自動で次へ進むまでの待ち時間
export const BLOCKER_ACTIVATION_ADVANCE_DELAY_MS = 1800;
