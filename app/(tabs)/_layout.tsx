import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { BlurTabBar } from '@/components/ui/BlurTabBar';

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      tabBar={(props) => <BlurTabBar {...props} />}
      sceneContainerStyle={{ backgroundColor: colors.background }}
      screenOptions={{
        headerShown: false,
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
          tabBarIcon: ({ color, size }) => <Ionicons name={color === colors.cyan ? 'home' : 'home-outline'} size={size} color={color} />,
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
          tabBarIcon: ({ color, size }) => <Ionicons name={color === colors.cyan ? 'calendar' : 'calendar-outline'} size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: '学ぶ',
          headerShown: false,
          tabBarLabel: '学ぶ',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={color === colors.cyan ? 'book' : 'book-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'プロフィール',
          headerShown: false,
          tabBarLabel: 'プロフィール',
          tabBarIcon: ({ color, size }) => <Ionicons name={color === colors.cyan ? 'person' : 'person-outline'} size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
