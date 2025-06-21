import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc, trpcClient } from '@/lib/trpc';
import { useState } from 'react';

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/register" />
          <Stack.Screen name="auth/verify" />
          <Stack.Screen name="setup/company" />
          <Stack.Screen name="setup/subscription" />
          <Stack.Screen name="setup/payment" />
          <Stack.Screen name="setup/confirmation" />
        </Stack>
      </QueryClientProvider>
    </trpc.Provider>
  );
}