import { Redirect } from 'expo-router';
import { useUserStore } from '@/stores/userStore';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

// DEV: skip onboarding, paywall, and brand animation
// テスト時は process.env.NODE_ENV === 'test' でスキップを無効化
const DEV_SKIP_ONBOARDING = __DEV__ && process.env.NODE_ENV !== 'test';

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

  if (DEV_SKIP_ONBOARDING) {
    return <Redirect href="/(tabs)" />;
  }

  // Brand screen handles routing to /(tabs) or /onboarding after animation
  return <Redirect href="/brand" />;
}
