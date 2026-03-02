import { Tabs } from 'expo-router';
import { SPACING } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';

export default function TabLayout() {
  const { colors, glow, isDark } = useTheme();

  return (
    <Tabs
      screenListeners={{
        tabPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        },
      }}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#0D0D14' : colors.surface,
          borderTopColor: isDark ? 'rgba(139, 92, 246, 0.15)' : colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: SPACING.xs,
          shadowColor: isDark ? glow.purple : 'rgba(0, 0, 0, 0.1)',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarActiveTintColor: colors.cyan,
        tabBarInactiveTintColor: colors.textSecondary,
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: {
          fontSize: 28,
          fontWeight: 'bold',
          color: colors.text,
        },
        headerTitleAlign: 'left',
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'ホーム',
          headerShown: false,
          tabBarLabel: 'ホーム',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      {/* Safari Web Extension トラッキング実装後に有効化 */}
      <Tabs.Screen
        name="stats"
        options={{ href: null }}
      />
      {/* v1.1 で記事機能を追加予定 */}
      <Tabs.Screen
        name="articles"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: '記録履歴',
          headerShown: true,
          tabBarLabel: '履歴',
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'プロフィール',
          headerShown: false,
          tabBarLabel: 'プロフィール',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
