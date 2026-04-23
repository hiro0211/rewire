import { Redirect } from 'expo-router';
import { useUserStore } from '@/stores/userStore';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

// ブランド画面を常に表示する（dev clientでもスキップしない）
const DEV_SKIP_ONBOARDING = false;
// ⚠️ 開発用: 起動時にペイウォール後オンボーディングを直接開く。確認後は false に戻すこと
const DEV_PREVIEW_POST_PURCHASE = true;

export default function Index() {
  const { hasHydrated } = useUserStore();
  const { colors } = useTheme();

  if (!hasHydrated) {
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
