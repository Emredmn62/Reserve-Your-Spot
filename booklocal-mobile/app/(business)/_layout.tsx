import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { COLORS } from '../../constants/AppConstants';

export default function BusinessLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.surface3,
          borderTopWidth: 1,
          height: 72,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.gold,
        tabBarInactiveTintColor: COLORS.greyDark,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <TabIcon emoji="📊" color={color} /> }} />
      <Tabs.Screen name="calendar" options={{ title: 'Calendar', tabBarIcon: ({ color }) => <TabIcon emoji="📅" color={color} /> }} />
      <Tabs.Screen name="services" options={{ title: 'Services', tabBarIcon: ({ color }) => <TabIcon emoji="✂️" color={color} /> }} />
      <Tabs.Screen name="staff" options={{ title: 'Team', tabBarIcon: ({ color }) => <TabIcon emoji="👥" color={color} /> }} />
      <Tabs.Screen name="analytics" options={{ title: 'Analytics', tabBarIcon: ({ color }) => <TabIcon emoji="📈" color={color} /> }} />
    </Tabs>
  );
}

function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  return <Text style={{ fontSize: 22, opacity: color === COLORS.gold ? 1 : 0.5 }}>{emoji}</Text>;
}
