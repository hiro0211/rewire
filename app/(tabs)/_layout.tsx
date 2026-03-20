import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { BlurTabBar } from '@/components/ui/BlurTabBar';

export default function TabLayout() {
  const { colors } = useTheme();
  const { t } = useLocale();

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
          title: t('nav.home'),
          headerShown: false,
          tabBarLabel: t('nav.home'),
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
          title: t('nav.recordHistory'),
          headerShown: true,
          tabBarLabel: t('nav.history'),
          tabBarIcon: ({ color, size }) => <Ionicons name={color === colors.cyan ? 'calendar' : 'calendar-outline'} size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: t('nav.learn'),
          headerShown: false,
          tabBarLabel: t('nav.learn'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={color === colors.cyan ? 'book' : 'book-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('nav.profile'),
          headerShown: false,
          tabBarLabel: t('nav.profile'),
          tabBarIcon: ({ color, size }) => <Ionicons name={color === colors.cyan ? 'person' : 'person-outline'} size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
