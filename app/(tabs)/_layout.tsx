import { Tabs } from 'expo-router';
import { COLORS, SPACING } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: 'rgba(0, 212, 255, 0.08)',
          height: 60,
          paddingBottom: SPACING.xs,
        },
        tabBarActiveTintColor: COLORS.cyan,
        tabBarInactiveTintColor: COLORS.textSecondary,
        // iOS Large Title style for tab headers
        headerStyle: { backgroundColor: COLORS.background },
        headerTitleStyle: {
          fontSize: 28,
          fontWeight: 'bold',
          color: COLORS.text,
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
      {/* Safari Web Extension トラッキング実装後に有効化
      <Tabs.Screen
        name="stats"
        options={{
          title: '統計',
          headerShown: true,
          tabBarLabel: '統計',
          tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart-outline" size={size} color={color} />,
        }}
      />
      */}
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
