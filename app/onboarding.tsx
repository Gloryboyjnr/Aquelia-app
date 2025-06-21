import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import Button from '@/components/Button';

interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function OnboardingScreen() {
  const router = useRouter();

  const features: FeatureItem[] = [
    {
      id: '1',
      title: 'Track Production',
      description: 'Monitor your sachet water production in real-time. Track batches, quality checks, and production targets.',
      icon: <CheckCircle size={24} color={Colors.primary} />
    },
    {
      id: '2',
      title: 'Manage Sales',
      description: 'Record sales, track revenue, and analyze sales performance. Generate reports and insights for better decision making.',
      icon: <CheckCircle size={24} color={Colors.primary} />
    },
    {
      id: '4',
      title: 'FDA Compliance',
      description: 'Stay compliant with FDA regulations. Generate required reports and maintain proper documentation.',
      icon: <CheckCircle size={24} color={Colors.primary} />
    },
  ];

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      router.replace('/auth/login');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>A</Text>
          </View>
          <Text style={styles.appName}>Aquelia</Text>
          <Text style={styles.tagline}>Sachet Water Production Management</Text>
        </View>
        
        <Text style={styles.welcomeTitle}>Welcome to Aquelia</Text>
        <Text style={styles.welcomeDescription}>
          The complete solution for sachet water production businesses in Ghana
        </Text>
        
        <View style={styles.featuresContainer}>
          {features.map((feature) => (
            <View key={feature.id} style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                {feature.icon}
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      
      <View style={styles.bottomContainer}>
        <Button
          title="Get Started"
          onPress={handleGetStarted}
          style={styles.button}
          size="large"
        />
        
        <TouchableOpacity 
          style={styles.loginLink}
          onPress={() => router.replace('/auth/login')}
        >
          <Text style={styles.loginText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
  },
  appName: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  tagline: {
    fontSize: Fonts.sizes.md,
    color: Colors.textLight,
  },
  welcomeTitle: {
    fontSize: Fonts.sizes.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
    paddingHorizontal: 20,
    textAlign: 'center',
  },
  welcomeDescription: {
    fontSize: Fonts.sizes.md,
    color: Colors.textLight,
    marginBottom: 40,
    paddingHorizontal: 20,
    lineHeight: 22,
    textAlign: 'center',
  },
  featuresContainer: {
    paddingHorizontal: 20,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 180, 216, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    lineHeight: 20,
  },
  bottomContainer: {
    padding: 20,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  button: {
    width: '100%',
    marginBottom: 16,
  },
  loginLink: {
    alignItems: 'center',
  },
  loginText: {
    fontSize: Fonts.sizes.md,
    color: Colors.primary,
    fontWeight: '500',
  },
});