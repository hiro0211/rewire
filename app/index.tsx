import { Redirect } from 'expo-router';
import { useUserStore } from '@/stores/userStore';
import { ActivityIndicator, View } from 'react-native';
import { COLORS } from '@/constants/theme';

export default function Index() {
  const { hasHydrated } = useUserStore();

  if (!hasHydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  // Brand screen handles routing to /(tabs) or /onboarding after animation
  return <Redirect href="/brand" />;
}
