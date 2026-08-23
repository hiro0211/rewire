import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { useUserStore } from '@/stores/userStore';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { seedDevUser } from '@/lib/dev/seedDevUser';
import { ROUTES } from '@/lib/routing/routes';
import { DEBUG_MENU_ENABLED } from '@/constants/debug';
import { useDebugStore } from '@/stores/debugStore';
import { useDebugUnlockAll } from '@/hooks/debug/useDebugUnlockAll';

// ブランド画面を常に表示する（dev clientでもスキップしない）
// ⚠️ 本番運用設定: false。ローカルでオンボーディングをスキップしたい場合のみ一時的に true にする。
const DEV_SKIP_ONBOARDING = false;
// ⚠️ 開発用: 起動時にペイウォール後オンボーディングを直接開く。確認後は false に戻すこと
const DEV_PREVIEW_POST_PURCHASE = false;
// ペイウォールの確認は設定画面のデバッグメニューから行う。起動を乗っ取るフラグは
// 戻し忘れると全ユーザーが起動直後にペイウォールへ飛ぶので置かない。

export default function Index() {
  const { hasHydrated, user } = useUserStore();
  const { colors } = useTheme();
  const [didSeed, setDidSeed] = useState(false);

  // 設定画面のデバッグトグル（二重ゲート済み）でもオンボーディングをスキップできる。
  const debugSkip = useDebugUnlockAll();
  const debugHasHydrated = useDebugStore((s) => s.hasHydrated);
  const skipOnboarding = DEV_SKIP_ONBOARDING || debugSkip;

  useEffect(() => {
    if (!skipOnboarding || !hasHydrated || user || didSeed) return;
    seedDevUser().finally(() => setDidSeed(true));
  }, [skipOnboarding, hasHydrated, user, didSeed]);

  const isWaiting =
    !hasHydrated ||
    // デバッグフラグは AsyncStorage 復元後に判定する（dev のみ。prod は DEBUG_MENU_ENABLED=false で待たない）
    (DEBUG_MENU_ENABLED && !debugHasHydrated) ||
    (skipOnboarding && !user);

  if (isWaiting) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator testID="activity-indicator" color={colors.primary} />
      </View>
    );
  }

  if (DEV_PREVIEW_POST_PURCHASE) {
    return <Redirect href={ROUTES.postPurchaseOnboarding} />;
  }

  if (skipOnboarding) {
    return <Redirect href="/(tabs)" />;
  }

  // Brand screen handles routing to /(tabs) or /onboarding after animation
  return <Redirect href="/brand" />;
}
