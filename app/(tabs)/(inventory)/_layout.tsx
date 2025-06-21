import { Stack } from 'expo-router';
import Colors from '@/constants/colors';

export default function InventoryLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          color: Colors.text,
        },
        headerTintColor: Colors.text,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Inventory',
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: 'Update Inventory',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="history"
        options={{
          title: 'Inventory History',
        }}
      />
    </Stack>
  );
}