import { createTRPCReact } from "@trpc/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import { Platform } from "react-native";
import Constants from "expo-constants";

export const trpc = createTRPCReact<AppRouter>();

// Improved getBaseUrl function with production support
const getBaseUrl = () => {
  // Get the custom API URL from environment variables
  const customApiUrl = Constants.expoConfig?.extra?.apiUrl;
  if (customApiUrl) {
    console.log(`Using custom API URL: ${customApiUrl}`);
    return customApiUrl;
  }

  // Production environment
  if (!__DEV__) {
    // Use your production backend URL here
    const prodUrl = "https://your-production-backend-url.com"; // Update this with your actual production URL
    console.log(`Using production URL: ${prodUrl}`);
    return prodUrl;
  }

  // Development environment
  if (Platform.OS === 'web') {
    // For web platform in development
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      if (origin && origin.includes('localhost')) {
        // If we're on localhost, use port 4000
        const devUrl = "http://localhost:4000";
        console.log(`Using web dev URL: ${devUrl}`);
        return devUrl;
      } else {
        // Use relative URL for same-origin requests
        console.log(`Using web origin: ${origin}`);
        return origin;
      }
    } catch (error) {
      // Fallback to localhost:4000
      const devUrl = "http://localhost:4000";
      console.log(`Using web fallback URL: ${devUrl}`);
      return devUrl;
    }
  }

  // For native platforms in development
  const devUrl = "http://localhost:4000";
  console.log(`Using native dev URL: ${devUrl}`);
  return devUrl;
};

// Create a more resilient client with retries and better error handling
export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      headers: () => ({
        "Content-Type": "application/json",
      }),
      // Add fetch options for better reliability
      fetch: async (url, options) => {
        try {
          console.log(`Making tRPC request to: ${url}`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
          
          const response = await fetch(url, {
            ...options,
            credentials: 'include',
            mode: 'cors',
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          
          // Check if response is HTML instead of JSON (common error)
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('text/html')) {
            console.error('Received HTML response instead of JSON. API endpoint may be incorrect.');
            throw new Error('Received HTML response instead of JSON. The API endpoint may be incorrect or the server returned an error page.');
          }
          
          return response;
        } catch (error) {
          if (error instanceof Error) {
            console.error('Network request failed:', error.message);
            
            // Provide more helpful error messages based on error type
            if (error.name === 'AbortError') {
              throw new Error('Request timed out. Please check your internet connection and try again.');
            } else if (error.message.includes('Network request failed')) {
              throw new Error('Network connection failed. Please check if the backend server is running and try again.');
            }
          }
          
          throw error;
        }
      },
    }),
  ],
});

// Improved backend connection check with timeout and better error handling
export const checkBackendConnection = async (): Promise<boolean> => {
  try {
    console.log(`Checking backend connection at: ${getBaseUrl()}/api/health`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(`${getBaseUrl()}/api/health`, {
      signal: controller.signal,
      headers: {
        "Accept": "application/json",
      },
    });

    clearTimeout(timeoutId);

    // Check if response is HTML instead of JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      console.warn("Backend health check failed: Received HTML instead of JSON");
      return false;
    }

    if (!response.ok) {
      console.warn("Backend health check failed:", await response.text());
      return false;
    }

    try {
      const data = await response.json();
      return data.status === "ok";
    } catch (error) {
      console.warn("Failed to parse backend health check response:", error);
      return false;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.warn("Backend connection check failed:", error.message);
    } else {
      console.warn("Backend connection check failed:", error);
    }
    return false;
  }
};

// Helper function to check if the backend is running
export const isBackendRunning = async (): Promise<boolean> => {
  try {
    console.log(`Checking if backend server is running at: ${getBaseUrl()}`);
    
    // Try a simple fetch to the backend root with a short timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    const response = await fetch(getBaseUrl(), {
      method: 'GET',
      headers: {
        "Accept": "application/json",
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    // If we get any response, the server is running
    return response.status !== 0;
  } catch (error) {
    console.warn("Backend server check failed:", error);
    return false;
  }
};