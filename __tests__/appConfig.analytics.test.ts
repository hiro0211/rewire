import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * app.config.ts の中でも「計測の正しさ」に直結する設定だけを守るテスト。
 *
 * ここが壊れても TypeScript も lint も何も言わない。壊れたことは翌日の
 * BigQuery エクスポートを見るまで分からず、その間のデータは遡って直せない。
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const buildConfig = require('../app.config').default as (
  ctx: ConfigContext,
) => ExpoConfig;

function infoPlist(): Record<string, unknown> {
  const config = buildConfig({ config: {} } as ConfigContext);
  return (config.ios?.infoPlist ?? {}) as Record<string, unknown>;
}

describe('app.config.ts — Analytics 計測設定', () => {
  it('Firebase の自動 screen_view 収集が無効になっている', () => {
    // 既定（未設定）は ON。ON のままだと iOS が UIViewController を
    // swizzle して RNSScreen / UIViewController / RCTFabricModalHostViewController
    // を screen_view として送る。実測 2026-08-08 では screen_view 1,814 行のうち
    // 1,100 行（61%）がこの自動収集で、`firebase_screen` を持たない。
    // 結果「1セッションあたり 21.6 画面」のような壊れた数字になる。
    // 自前の useScreenTracking が全ルートで logScreenView しているので、
    // 自動収集は重複でしかない。
    expect(infoPlist().FirebaseAutomaticScreenReportingEnabled).toBe(false);
  });
});
