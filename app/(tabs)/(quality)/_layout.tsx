import { Stack } from 'expo-router';
import Colors from '@/constants/colors';

export default function QualityLayout() {
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
          title: 'FDA Quality Control',
        }}
      />
      <Stack.Screen
        name="equipment-cleaning"
        options={{
          title: 'Equipment Cleaning Log',
        }}
      />
      <Stack.Screen
        name="qa-parameters"
        options={{
          title: 'QA Parameters Check',
        }}
      />
      <Stack.Screen
        name="in-process-check"
        options={{
          title: 'In-Process QC Check',
        }}
      />
      <Stack.Screen
        name="attendance"
        options={{
          title: 'Daily Attendance & Hygiene',
        }}
      />
    </Stack>
  );
}