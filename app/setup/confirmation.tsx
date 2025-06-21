import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Platform,
  Animated,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import Button from '@/components/Button';
import useAuthStore from '@/store/auth-store';
import useSubscriptionStore from '@/store/subscription-store';

export default function ConfirmationScreen() {
  const router = useRouter();
  const { company } = useAuthStore();
  const { selectedPlan } = useSubscriptionStore();
  
  const opacityAnim = new Animated.Value(0);

  // Basic plan details with updated price
  const basicPlanDetails = {
    name: 'Basic Plan',
    price: '₵299/month'
  };

  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 1000,
      delay: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleGoToDashboard = () => {
    router.replace('/(tabs)');
  };

  // Calculate next billing date (30 days from now)
  const nextBillingDate = new Date();
  nextBillingDate.setDate(nextBillingDate.getDate() + 30);
  const formattedNextBillingDate = nextBillingDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#00B4D8', '#0077B6']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.successContainer}>
            <Text style={styles.successTitle}>Payment Successful!</Text>
            <Text style={styles.successMessage}>
              Your Basic plan is now active
            </Text>
            <Text style={styles.companyName}>{company?.name}</Text>
          </View>
          
          <Animated.View 
            style={[
              styles.orderSummaryContainer,
              { opacity: opacityAnim }
            ]}
          >
            <Text style={styles.summaryTitle}>Order Summary</Text>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Plan</Text>
              <Text style={styles.summaryValue}>{basicPlanDetails.name}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Duration</Text>
              <Text style={styles.summaryValue}>1 Month</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Amount Paid</Text>
              <Text style={styles.summaryValue}>{basicPlanDetails.price}</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Next Billing</Text>
              <Text style={styles.summaryValue}>{formattedNextBillingDate}</Text>
            </View>
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.thankYouContainer,
              { opacity: opacityAnim }
            ]}
          >
            <Text style={styles.thankYouText}>
              Thank you for choosing Aquelia for your sachet water production management!
            </Text>
          </Animated.View>
        </ScrollView>
        
        <View style={styles.buttonContainer}>
          <Button
            title="Go to Dashboard"
            onPress={handleGoToDashboard}
            size="large"
            style={styles.button}
            textStyle={styles.buttonText}
          />
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  successTitle: {
    fontSize: Fonts.sizes.xxxl,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: Fonts.sizes.lg,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 8,
    textAlign: 'center',
  },
  companyName: {
    fontSize: Fonts.sizes.xl,
    fontWeight: '600',
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
  },
  orderSummaryContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  summaryTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: Fonts.sizes.md,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  summaryValue: {
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: '#fff',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 12,
  },
  thankYouContainer: {
    marginBottom: 20,
  },
  thankYouText: {
    fontSize: Fonts.sizes.md,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
  },
  button: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: Platform.OS === 'ios' ? 16 : 14,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.3)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.8,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  buttonText: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '700',
    color: Colors.primary,
  },
});