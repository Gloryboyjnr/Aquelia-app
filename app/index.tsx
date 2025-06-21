import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/constants/colors';
import useAuthStore from '@/store/auth-store';
import { checkBackendConnection, isBackendRunning } from '@/lib/trpc';
import { RefreshCw } from 'lucide-react-native';

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [isBackendAvailable, setIsBackendAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [backendError, setBackendError] = useState<string | null>(null);

  const checkConnection = async () => {
    setIsChecking(true);
    setBackendError(null);
    
    try {
      // First check if the server is running at all
      const isRunning = await isBackendRunning();
      
      if (!isRunning) {
        console.warn("Backend server is not running");
        setIsBackendAvailable(false);
        setBackendError("Backend server is not running. The app will run in offline mode.");
        setIsChecking(false);
        return;
      }
      
      // Then check if the health endpoint is available
      const isAvailable = await checkBackendConnection();
      setIsBackendAvailable(isAvailable);
      
      if (!isAvailable) {
        console.warn("Backend health check failed");
        setBackendError("Backend health check failed. The app will run in offline mode.");
      } else {
        setBackendError(null);
      }
    } catch (error) {
      console.error("Error checking backend:", error);
      setIsBackendAvailable(false);
      
      if (error instanceof Error) {
        setBackendError(`Error connecting to backend: ${error.message}. The app will run in offline mode.`);
      } else {
        setBackendError("Unknown error connecting to backend. The app will run in offline mode.");
      }
    } finally {
      setIsChecking(false);
    }
  };
  
  useEffect(() => {
    // Check backend connection
    checkConnection();
  }, []);
  
  useEffect(() => {
    // Only navigate when backend check is complete
    if (isChecking) return;
    
    // Use a timeout to ensure the layout is fully mounted before navigation
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.replace('/(tabs)');
      } else {
        AsyncStorage.getItem('hasSeenOnboarding')
          .then(value => {
            if (value === 'true') {
              router.replace('/auth/login');
            } else {
              router.replace('/onboarding');
            }
          })
          .catch(() => {
            router.replace('/onboarding');
          });
      }
    }, 1500); // Longer delay to ensure layout is mounted

    return () => clearTimeout(timer);
  }, [isChecking, isAuthenticated]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Aquelia</Text>
      <Text style={styles.subtitle}>Sachet Water Production Management</Text>
      
      {isChecking ? (
        <ActivityIndicator 
          size="large" 
          color={Colors.primary} 
          style={styles.loader} 
        />
      ) : (
        <>
          {isBackendAvailable === false && (
            <View style={styles.offlineContainer}>
              <Text style={styles.offlineText}>
                {backendError || "Running in offline mode"}
              </Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={checkConnection}
              >
                <RefreshCw size={16} color={Colors.warning} style={styles.retryIcon} />
                <Text style={styles.retryText}>Retry Connection</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <ActivityIndicator 
            size="large" 
            color={Colors.primary} 
            style={styles.loader} 
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.textLight,
    marginBottom: 40,
    textAlign: 'center',
  },
  loader: {
    marginTop: 20,
  },
  offlineContainer: {
    marginTop: 20,
    backgroundColor: Colors.warning + '10',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.warning + '30',
    alignItems: 'center',
    width: '100%',
    maxWidth: 350
  },
  offlineText: {
    color: Colors.warning,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 12
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning + '20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8
  },
  retryIcon: {
    marginRight: 8
  },
  retryText: {
    color: Colors.warning,
    fontWeight: '600',
    fontSize: 14
  }
});