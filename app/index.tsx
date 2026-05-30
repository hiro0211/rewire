import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { useUserStore } from '@/stores/userStore';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { seedDevUser } from '@/lib/dev/seedDevUser';

// ブランド画面を常に表示する（dev clientでもスキップしない）
// ⚠️ 開発確認用に true。本番ビルド前に必ず false に戻すこと。
const DEV_SKIP_ONBOARDING = true;
// ⚠️ 開発用: 起動時にペイウォール後オンボーディングを直接開く。確認後は false に戻すこと
const DEV_PREVIEW_POST_PURCHASE = false;

export default function Index() {
  const { hasHydrated, user } = useUserStore();
  const { colors } = useTheme();
  const [didSeed, setDidSeed] = useState(false);

  useEffect(() => {
    if (!DEV_SKIP_ONBOARDING || !hasHydrated || user || didSeed) return;
    seedDevUser().finally(() => setDidSeed(true));
  }, [hasHydrated, user, didSeed]);

  const isWaiting =
    !hasHydrated || (DEV_SKIP_ONBOARDING && !user);

  if (isWaiting) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator testID="activity-indicator" color={colors.primary} />
      </View>
    );
  }

  if (DEV_PREVIEW_POST_PURCHASE) {
    return <Redirect href="/post-purchase-onboarding" />;
  }

  if (DEV_SKIP_ONBOARDING) {
    return <Redirect href="/(tabs)" />;
  }

  // Brand screen handles routing to /(tabs) or /onboarding after animation
  return <Redirect href="/brand" />;
}
