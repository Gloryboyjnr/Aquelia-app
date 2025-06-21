import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Package, TrendingUp, Boxes, Factory, Settings, Clipboard } from 'lucide-react-native';
import Colors from '@/constants/colors';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopColor: Colors.border,
        },
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerShadowVisible: false,
        headerTintColor: Colors.text,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Package size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(inventory)"
        options={{
          title: 'Inventory',
          tabBarIcon: ({ color }) => <Boxes size={22} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="(production)"
        options={{
          title: 'Production',
          tabBarIcon: ({ color }) => <Factory size={22} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="(sales)"
        options={{
          title: 'Sales',
          tabBarIcon: ({ color }) => <TrendingUp size={22} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="(quality)"
        options={{
          title: 'FDA',
          tabBarIcon: ({ color }) => <Clipboard size={22} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Settings size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}