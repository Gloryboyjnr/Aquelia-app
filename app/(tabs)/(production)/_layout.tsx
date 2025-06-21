import { Stack } from 'expo-router';
import Colors from '@/constants/colors';

export default function ProductionLayout() {
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
          title: 'Production',
        }}
      />
      <Stack.Screen
        name="new"
        options={{
          title: 'New Production',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="history"
        options={{
          title: 'Production History',
        }}
      />
      <Stack.Screen
        name="manage-bags"
        options={{
          title: 'Manage Bags in Stock',
        }}
      />
    </Stack>
  );
}