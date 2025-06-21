import { Stack } from 'expo-router';
import Colors from '@/constants/colors';

export default function SalesLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerTintColor: Colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Sales Management',
          headerLargeTitle: true,
        }} 
      />
      <Stack.Screen 
        name="new" 
        options={{ 
          title: 'New Sale',
          presentation: 'modal',
        }} 
      />
      <Stack.Screen 
        name="records" 
        options={{ 
          title: 'Sale Records',
        }} 
      />
      <Stack.Screen 
        name="history" 
        options={{ 
          title: 'Sale History',
        }} 
      />
    </Stack>
  );
}