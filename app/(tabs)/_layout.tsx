import { Tabs } from 'expo-router';
import { COLORS, SPACING } from '@/constants/theme';
import { View } from 'react-native';

// Simple text icons for MVP. We will add vector icons later if needed.
const TabIcon = ({ name, color }: { name: string; color: string }) => (
  // Placeholder for icon
  <View style={{ width: 24, height: 24, backgroundColor: color, borderRadius: 12 }} />
);

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
          title: 'Home',
          tabBarLabel: 'Home',
          // tabBarIcon: ({ color }) => <TabIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="articles"
        options={{
          title: 'Articles',
          tabBarLabel: '記事',
          // tabBarIcon: ({ color }) => <TabIcon name="book" color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarLabel: '履歴',
          tabBarIcon: ({ color }) => <TabIcon name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarLabel: '設定',
          tabBarIcon: ({ color }) => <TabIcon name="settings" color={color} />,
        }}
      />
    </Tabs>
  );
}
