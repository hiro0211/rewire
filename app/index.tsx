import { Redirect } from 'expo-router';
import { useUserStore } from '@/stores/userStore';
import { ActivityIndicator, View } from 'react-native';
import { COLORS } from '@/constants/theme';

export default function Index() {
  const { user, hasHydrated } = useUserStore();

  if (!hasHydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  // If user exists (nickname is set), go to main tabs
  if (user && user.nickname) {
    return <Redirect href="/(tabs)" />;
  }

  // Otherwise, go to onboarding
  return <Redirect href="/onboarding" />;
}
