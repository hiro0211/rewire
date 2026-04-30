export type WebExtensionStatus =
  | 'checking'
  | 'never'
  | 'active'
  | 'stale'
  | 'needsAllUrls';

export const ACTIVE_WINDOW_SECONDS = 6 * 60 * 60;

interface DeriveInput {
  lastActiveAt: number;
  hasAllUrls: boolean;
  nowSeconds: number;
}

export function deriveStatus({
  lastActiveAt,
  hasAllUrls,
  nowSeconds,
}: DeriveInput): Exclude<WebExtensionStatus, 'checking'> {
  if (lastActiveAt <= 0) return 'never';
  const delta = nowSeconds - lastActiveAt;
  if (delta >= ACTIVE_WINDOW_SECONDS) return 'stale';
  return hasAllUrls ? 'active' : 'needsAllUrls';
}
