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
          borderTopColor: COLORS.surfaceHighlight,
          height: 60,
          paddingBottom: SPACING.xs,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'ホーム',
          tabBarLabel: 'ホーム',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      {/* v1.1 で記事機能を追加予定
      <Tabs.Screen
        name="articles"
        options={{
          title: '記事',
          tabBarLabel: '記事',
          tabBarIcon: ({ color, size }) => <Ionicons name="book-outline" size={size} color={color} />,
        }}
      />
      */}
      <Tabs.Screen
        name="articles"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: '履歴',
          tabBarLabel: '履歴',
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '設定',
          tabBarLabel: '設定',
          tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
