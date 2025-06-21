import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform, KeyboardAvoidingView, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle, CreditCard, Smartphone, Calendar, User } from 'lucide-react-native';
import ScreenContainer from '@/components/ScreenContainer';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import useAuthStore from '@/store/auth-store';
import useSubscriptionStore from '@/store/subscription-store';
import { trpc, trpcClient, checkBackendConnection, isBackendRunning } from '@/lib/trpc';

const paymentMethods = [
  {
    id: 'mtn',
    name: 'MTN Mobile Money',
  },
  {
    id: 'telecel',
    name: 'Telecel Cash',
  },
  {
    id: 'airtel',
    name: 'AirtelTigo Money',
  },
  {
    id: 'card',
    name: 'Credit/Debit Card',
  }
];

export default function PaymentScreen() {
  const router = useRouter();
  const { company, setCompany, user } = useAuthStore();
  const { selectedPlan } = useSubscriptionStore();
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<'select' | 'details' | 'confirm' | 'processing'>('select');
  const [isBackendAvailable, setIsBackendAvailable] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);
  
  // Mobile Money fields
  const [mobileNumber, setMobileNumber] = useState('');
  const [mobileNumberError, setMobileNumberError] = useState('');
  
  // Credit Card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardErrors, setCardErrors] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  // Basic plan details
  const basicPlanDetails = {
    id: 'basic',
    name: 'Basic Plan',
    price: '₵299/month',
    amount: 299
  };

  // Check backend connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // First check if the server is running at all
        const isRunning = await isBackendRunning();
        
        if (!isRunning) {
          setIsBackendAvailable(false);
          setBackendError("Backend server is not running. Payment processing will be simulated.");
          return;
        }
        
        // Then check if the health endpoint is available
        const isAvailable = await checkBackendConnection();
        setIsBackendAvailable(isAvailable);
        
        if (!isAvailable) {
          setBackendError("Backend health check failed. Payment processing will be simulated.");
        } else {
          setBackendError(null);
        }
      } catch (error) {
        console.error("Error checking backend:", error);
        setIsBackendAvailable(false);
        setBackendError("Error connecting to backend. Payment processing will be simulated.");
      }
    };
    
    checkConnection();
  }, []);

  useEffect(() => {
    if (!selectedPlan || selectedPlan !== 'basic') {
      router.replace('/setup/subscription');
    }
  }, [selectedPlan, router]);

  const handleSelectPaymentMethod = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
    setMobileNumberError('');
    setCardErrors({
      number: '',
      expiry: '',
      cvv: '',
      name: ''
    });
  };

  const handleContinueToDetails = () => {
    if (!selectedPaymentMethod) return;
    setPaymentStep('details');
  };

  const validateMobileNumber = () => {
    if (!mobileNumber.trim()) {
      setMobileNumberError('Mobile number is required');
      return false;
    }
    
    if (!/^\d{10}$/.test(mobileNumber.trim())) {
      setMobileNumberError('Please enter a valid 10-digit mobile number');
      return false;
    }
    
    setMobileNumberError('');
    return true;
  };

  const validateCardDetails = () => {
    let isValid = true;
    const newErrors = {
      number: '',
      expiry: '',
      cvv: '',
      name: ''
    };

    if (!cardNumber.trim()) {
      newErrors.number = 'Card number is required';
      isValid = false;
    } else if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
      newErrors.number = 'Please enter a valid 16-digit card number';
      isValid = false;
    }

    if (!cardExpiry.trim()) {
      newErrors.expiry = 'Expiry date is required';
      isValid = false;
    } else if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      newErrors.expiry = 'Please use MM/YY format';
      isValid = false;
    }

    if (!cardCvv.trim()) {
      newErrors.cvv = 'CVV is required';
      isValid = false;
    } else if (!/^\d{3,4}$/.test(cardCvv)) {
      newErrors.cvv = 'CVV should be 3 or 4 digits';
      isValid = false;
    }

    if (!cardName.trim()) {
      newErrors.name = 'Cardholder name is required';
      isValid = false;
    }

    setCardErrors(newErrors);
    return isValid;
  };

  const handleContinueToConfirm = () => {
    if (selectedPaymentMethod === 'card') {
      if (!validateCardDetails()) return;
    } else {
      if (!validateMobileNumber()) return;
    }
    
    setPaymentStep('confirm');
  };

  const handlePayment = async () => {
    if (!selectedPaymentMethod || !selectedPlan || selectedPlan !== 'basic' || !company || !user) return;
    
    try {
      setPaymentStep('processing');
      
      // Mock payment reference
      const paymentReference = `pay_${Date.now()}_${company.id}`;
      
      // If backend is available, try to initialize payment
      if (isBackendAvailable) {
        try {
          // Use direct client instead of hooks to avoid React hooks rules issues
          const paymentResult = await trpcClient.payments.initialize.mutate({
            amount: basicPlanDetails.amount,
            email: user.email,
            phoneNumber: selectedPaymentMethod === 'card' ? user.phoneNumber : mobileNumber,
            paymentMethod: selectedPaymentMethod as 'card' | 'mtn' | 'telecel' | 'airtel',
            plan: 'basic',
            companyId: company.id
          });
          
          if (paymentResult.success) {
            if (selectedPaymentMethod === 'card' && paymentResult.paymentUrl) {
              await Linking.openURL(paymentResult.paymentUrl);
            }
          }
        } catch (error) {
          console.warn("Failed to initialize payment via tRPC:", error);
          // Continue with mock flow even if tRPC call fails
        }
      }
      
      // For demo purposes, simulate successful payment after 3 seconds
      setTimeout(async () => {
        try {
          // If backend is available, try to verify payment
          if (isBackendAvailable) {
            try {
              // Use direct client instead of hooks
              await trpcClient.payments.verify.mutate({
                reference: paymentReference,
                companyId: company.id
              });
            } catch (error) {
              console.warn("Failed to verify payment via tRPC:", error);
              // Continue with mock flow even if tRPC call fails
            }
          }
          
          // Update company subscription
          const updatedCompany = {
            ...company,
            active: true,
            subscriptionPlan: 'basic' as const,
            subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          };
          
          setCompany(updatedCompany);
          router.push('/setup/confirmation');
        } catch (error) {
          console.error('Payment verification error:', error);
          setPaymentStep('confirm');
          Alert.alert(
            "Payment Error",
            "There was an error processing your payment. Please try again.",
            [{ text: "OK" }]
          );
        }
      }, 3000);
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStep('confirm');
      Alert.alert(
        "Payment Error",
        error instanceof Error ? error.message : "There was an error processing your payment. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const handleBack = () => {
    if (paymentStep === 'details') {
      setPaymentStep('select');
    } else if (paymentStep === 'confirm') {
      setPaymentStep('details');
    } else {
      router.replace('/setup/subscription');
    }
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted.slice(0, 19);
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    
    if (cleaned.length > 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    
    return cleaned;
  };

  if (!selectedPlan || selectedPlan !== 'basic') {
    return null;
  }

  const renderPaymentIcon = (methodId: string) => {
    switch (methodId) {
      case 'mtn':
        return (
          <View style={[styles.iconContainer, { backgroundColor: '#FFCC00' }]}>
            <Text style={styles.iconText}>MTN</Text>
          </View>
        );
      case 'telecel':
        return (
          <View style={[styles.iconContainer, { backgroundColor: '#E30613' }]}>
            <Text style={styles.iconText}>TC</Text>
          </View>
        );
      case 'airtel':
        return (
          <View style={[styles.iconContainer, { backgroundColor: '#FF0000' }]}>
            <Text style={styles.iconText}>AT</Text>
          </View>
        );
      case 'card':
        return <CreditCard size={24} color={Colors.textLight} />;
      default:
        return <Smartphone size={24} color={Colors.textLight} />;
    }
  };

  const renderPaymentMethodSelection = () => (
    <>
      <Text style={styles.title}>Complete Your Payment</Text>
      <Text style={styles.subtitle}>
        Select a payment method to continue
      </Text>
      
      {backendError && (
        <View style={styles.offlineContainer}>
          <Text style={styles.offlineText}>
            {backendError}
          </Text>
        </View>
      )}
      
      <Card style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Order Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Plan:</Text>
          <Text style={styles.summaryValue}>{basicPlanDetails.name}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Duration:</Text>
          <Text style={styles.summaryValue}>1 Month</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>{basicPlanDetails.price}</Text>
        </View>
      </Card>
      
      <Text style={styles.paymentMethodsTitle}>Payment Methods</Text>
      
      <View style={styles.paymentMethodsContainer}>
        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.paymentMethodCard,
              selectedPaymentMethod === method.id && styles.selectedPaymentMethod
            ]}
            onPress={() => handleSelectPaymentMethod(method.id)}
          >
            {renderPaymentIcon(method.id)}
            <Text style={styles.paymentName}>{method.name}</Text>
            {selectedPaymentMethod === method.id && (
              <CheckCircle size={20} color={Colors.primary} style={styles.checkIcon} />
            )}
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.guaranteeContainer}>
        <Text style={styles.guaranteeText}>
          10-day cancellation guarantee. Cancel within 10 days for a full refund.
        </Text>
      </View>
      
      <Button
        title="Continue"
        onPress={handleContinueToDetails}
        disabled={!selectedPaymentMethod}
        style={styles.button}
      />
    </>
  );

  const renderMobileMoneyDetails = () => {
    const getProviderName = () => {
      switch (selectedPaymentMethod) {
        case 'mtn': return 'MTN Mobile Money';
        case 'telecel': return 'Telecel Cash';
        case 'airtel': return 'AirtelTigo Money';
        default: return 'Mobile Money';
      }
    };

    const getProviderColor = () => {
      switch (selectedPaymentMethod) {
        case 'mtn': return '#FFCC00';
        case 'telecel': return '#E30613';
        case 'airtel': return '#FF0000';
        default: return Colors.primary;
      }
    };

    return (
      <>
        <Text style={styles.title}>{getProviderName()}</Text>
        <Text style={styles.subtitle}>
          Enter your mobile number to receive payment prompt
        </Text>
        
        <Card style={styles.mobileMoneyCard}>
          <View style={[styles.providerIconContainer, { backgroundColor: getProviderColor() }]}>
            <Text style={styles.providerIconText}>
              {selectedPaymentMethod === 'mtn' ? 'MTN' : 
               selectedPaymentMethod === 'telecel' ? 'TC' : 'AT'}
            </Text>
          </View>
          
          <Text style={styles.mobileMoneyInstructions}>
            You will receive a prompt on your phone to authorize the payment of {basicPlanDetails.price}.
          </Text>
          
          <Input
            label="Mobile Number"
            placeholder="Enter your mobile number"
            value={mobileNumber}
            onChangeText={setMobileNumber}
            keyboardType="phone-pad"
            error={mobileNumberError}
            hint="Enter the number registered with your mobile money account"
          />
        </Card>
        
        <Button
          title="Continue"
          onPress={handleContinueToConfirm}
          style={styles.button}
        />
      </>
    );
  };

  const renderCardDetails = () => (
    <>
      <Text style={styles.title}>Card Details</Text>
      <Text style={styles.subtitle}>
        Enter your card information to complete payment
      </Text>
      
      <Card style={styles.cardDetailsCard}>
        <Input
          label="Card Number"
          placeholder="1234 5678 9012 3456"
          value={cardNumber}
          onChangeText={(text) => setCardNumber(formatCardNumber(text))}
          keyboardType="number-pad"
          error={cardErrors.number}
        />
        
        <View style={styles.cardDetailsRow}>
          <Input
            label="Expiry Date"
            placeholder="MM/YY"
            value={cardExpiry}
            onChangeText={(text) => setCardExpiry(formatExpiryDate(text))}
            keyboardType="number-pad"
            maxLength={5}
            error={cardErrors.expiry}
            containerStyle={styles.expiryInput}
          />
          
          <Input
            label="CVV"
            placeholder="123"
            value={cardCvv}
            onChangeText={setCardCvv}
            keyboardType="number-pad"
            maxLength={4}
            error={cardErrors.cvv}
            containerStyle={styles.cvvInput}
          />
        </View>
        
        <Input
          label="Cardholder Name"
          placeholder="John Doe"
          value={cardName}
          onChangeText={setCardName}
          autoCapitalize="words"
          error={cardErrors.name}
        />
      </Card>
      
      <Button
        title="Continue"
        onPress={handleContinueToConfirm}
        style={styles.button}
      />
    </>
  );

  const renderConfirmation = () => {
    const getPaymentMethodName = () => {
      switch (selectedPaymentMethod) {
        case 'mtn': return 'MTN Mobile Money';
        case 'telecel': return 'Telecel Cash';
        case 'airtel': return 'AirtelTigo Money';
        case 'card': return 'Credit/Debit Card';
        default: return 'Selected payment method';
      }
    };

    return (
      <>
        <Text style={styles.title}>Confirm Payment</Text>
        <Text style={styles.subtitle}>
          Please review your payment details
        </Text>
        
        <Card style={styles.confirmationCard}>
          <Text style={styles.confirmationTitle}>Payment Summary</Text>
          
          <View style={styles.confirmationRow}>
            <Text style={styles.confirmationLabel}>Plan:</Text>
            <Text style={styles.confirmationValue}>{basicPlanDetails.name}</Text>
          </View>
          
          <View style={styles.confirmationRow}>
            <Text style={styles.confirmationLabel}>Amount:</Text>
            <Text style={styles.confirmationValue}>{basicPlanDetails.price}</Text>
          </View>
          
          <View style={styles.confirmationRow}>
            <Text style={styles.confirmationLabel}>Payment Method:</Text>
            <Text style={styles.confirmationValue}>{getPaymentMethodName()}</Text>
          </View>
          
          {selectedPaymentMethod !== 'card' && (
            <View style={styles.confirmationRow}>
              <Text style={styles.confirmationLabel}>Mobile Number:</Text>
              <Text style={styles.confirmationValue}>{mobileNumber}</Text>
            </View>
          )}
          
          {selectedPaymentMethod === 'card' && (
            <View style={styles.confirmationRow}>
              <Text style={styles.confirmationLabel}>Card:</Text>
              <Text style={styles.confirmationValue}>
                **** **** **** {cardNumber.slice(-4)}
              </Text>
            </View>
          )}
          
          <View style={styles.divider} />
          
          <Text style={styles.confirmationInstructions}>
            {selectedPaymentMethod === 'card' 
              ? "Click 'Pay Now' to process your card payment."
              : "Click 'Pay Now' to send a payment request to your mobile. You will receive a prompt to authorize the payment."}
          </Text>
        </Card>
        
        <Button
          title="Pay Now"
          onPress={handlePayment}
          style={styles.button}
        />
      </>
    );
  };

  const renderProcessing = () => (
    <View style={styles.processingContainer}>
      <Text style={styles.title}>Processing Payment</Text>
      <Text style={styles.subtitle}>
        {selectedPaymentMethod === 'card' 
          ? 'Please complete the payment in the opened browser window.'
          : 'Please check your phone for the payment prompt and authorize the transaction.'}
      </Text>
      
      <View style={styles.processingIndicator}>
        <Text style={styles.processingText}>Processing...</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBack}
          disabled={paymentStep === 'processing'}
        >
          <ArrowLeft size={24} color={paymentStep === 'processing' ? Colors.textLight : Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.placeholder} />
      </View>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScreenContainer>
          <View style={styles.content}>
            {paymentStep === 'select' && renderPaymentMethodSelection()}
            {paymentStep === 'details' && selectedPaymentMethod === 'card' && renderCardDetails()}
            {paymentStep === 'details' && selectedPaymentMethod !== 'card' && renderMobileMoneyDetails()}
            {paymentStep === 'confirm' && renderConfirmation()}
            {paymentStep === 'processing' && renderProcessing()}
          </View>
        </ScreenContainer>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border
  },
  backButton: {
    padding: 8
  },
  headerTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '600',
    color: Colors.text
  },
  placeholder: {
    width: 40
  },
  content: {
    flex: 1
  },
  title: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8
  },
  subtitle: {
    fontSize: Fonts.sizes.md,
    color: Colors.textLight,
    marginBottom: 24
  },
  offlineContainer: {
    backgroundColor: Colors.warning + '10',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.warning + '30'
  },
  offlineText: {
    color: Colors.warning,
    fontSize: Fonts.sizes.sm,
    textAlign: 'center',
    fontWeight: '500'
  },
  summaryCard: {
    marginBottom: 24
  },
  summaryTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  summaryLabel: {
    fontSize: Fonts.sizes.md,
    color: Colors.textLight
  },
  summaryValue: {
    fontSize: Fonts.sizes.md,
    color: Colors.text,
    fontWeight: '500'
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12
  },
  totalLabel: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '600',
    color: Colors.text
  },
  totalValue: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '700',
    color: Colors.primary
  },
  paymentMethodsTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16
  },
  paymentMethodsContainer: {
    marginBottom: 24
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border
  },
  selectedPaymentMethod: {
    borderColor: Colors.primary,
    borderWidth: 2
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16
  },
  iconText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: Fonts.sizes.md
  },
  paymentName: {
    fontSize: Fonts.sizes.md,
    color: Colors.text,
    fontWeight: '500',
    flex: 1
  },
  checkIcon: {
    marginLeft: 8
  },
  guaranteeContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24
  },
  guaranteeText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    textAlign: 'center'
  },
  button: {
    marginTop: 'auto',
    backgroundColor: Colors.primary
  },
  mobileMoneyCard: {
    marginBottom: 24,
    alignItems: 'center'
  },
  providerIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  providerIconText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 20
  },
  mobileMoneyInstructions: {
    fontSize: Fonts.sizes.md,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 24
  },
  cardDetailsCard: {
    marginBottom: 24
  },
  cardDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  expiryInput: {
    flex: 1,
    marginRight: 8
  },
  cvvInput: {
    flex: 1
  },
  confirmationCard: {
    marginBottom: 24
  },
  confirmationTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16
  },
  confirmationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  confirmationLabel: {
    fontSize: Fonts.sizes.md,
    color: Colors.textLight
  },
  confirmationValue: {
    fontSize: Fonts.sizes.md,
    color: Colors.text,
    fontWeight: '500'
  },
  confirmationInstructions: {
    fontSize: Fonts.sizes.md,
    color: Colors.text,
    textAlign: 'center',
    marginTop: 8
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  processingIndicator: {
    marginTop: 32
  },
  processingText: {
    fontSize: Fonts.sizes.lg,
    color: Colors.primary,
    fontWeight: '600'
  }
});