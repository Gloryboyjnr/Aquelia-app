import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, KeyboardAvoidingView, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Eye, EyeOff, User, Phone, Mail, Lock, Shield } from 'lucide-react-native';
import ScreenContainer from '@/components/ScreenContainer';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import useAuthStore from '@/store/auth-store';
import { trpc, trpcClient, checkBackendConnection, isBackendRunning } from '@/lib/trpc';

export default function RegisterScreen() {
  const router = useRouter();
  const { setUser, setIsLoading, setError, isLoading } = useAuthStore();
  
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [isBackendAvailable, setIsBackendAvailable] = useState(true);
  const [backendError, setBackendError] = useState<string | null>(null);
  
  const [errors, setErrors] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    pin: '',
    confirmPin: '',
    general: ''
  });

  // Check backend connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // First check if the server is running at all
        const isRunning = await isBackendRunning();
        
        if (!isRunning) {
          setIsBackendAvailable(false);
          setBackendError("Backend server is not running. Some features may be limited.");
          return;
        }
        
        // Then check if the health endpoint is available
        const isAvailable = await checkBackendConnection();
        setIsBackendAvailable(isAvailable);
        
        if (!isAvailable) {
          setBackendError("Backend health check failed. Some features may be limited.");
        } else {
          setBackendError(null);
        }
      } catch (error) {
        console.error("Error checking backend:", error);
        setIsBackendAvailable(false);
        setBackendError("Error connecting to backend. Some features may be limited.");
      }
    };
    
    checkConnection();
  }, []);

  // Handle registration
  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      setErrors(prev => ({ ...prev, general: '' }));
      
      // If backend is available, try to send OTP
      if (isBackendAvailable) {
        try {
          // Use direct client instead of hooks to avoid React hooks rules issues
          await trpcClient.auth.sendOtp.mutate({ phoneNumber: phoneNumber.trim() });
        } catch (error) {
          console.warn("Failed to send OTP via tRPC, falling back to mock:", error);
          // Continue with mock flow even if tRPC call fails
        }
      }
      
      // Create user object regardless of backend availability
      const newUser = {
        id: `user_${Date.now()}`,
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim() || undefined,
        role: 'manager',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setUser(newUser);
      
      setErrors({
        fullName: '',
        phoneNumber: '',
        email: '',
        pin: '',
        confirmPin: '',
        general: ''
      });
      
      setTimeout(() => {
        router.push('/auth/verify');
      }, 100);
    } catch (error) {
      setIsLoading(false);
      
      let errorMessage = 'Failed to create account. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setErrors(prev => ({
        ...prev,
        general: errorMessage
      }));
      setError(errorMessage);
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      fullName: '',
      phoneNumber: '',
      email: '',
      pin: '',
      confirmPin: '',
      general: ''
    };

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
      isValid = false;
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
      isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(fullName.trim())) {
      newErrors.fullName = 'Full name can only contain letters and spaces';
      isValid = false;
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
      isValid = false;
    } else if (!/^\d{10}$/.test(phoneNumber.trim())) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
      isValid = false;
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!pin.trim()) {
      newErrors.pin = 'PIN is required';
      isValid = false;
    } else if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      newErrors.pin = 'PIN must be exactly 4 digits';
      isValid = false;
    }

    if (!confirmPin.trim()) {
      newErrors.confirmPin = 'Please confirm your PIN';
      isValid = false;
    } else if (pin !== confirmPin) {
      newErrors.confirmPin = 'PINs do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleBack = () => {
    if (isLoading) return;
    router.replace('/auth/login');
  };

  const togglePinVisibility = () => {
    setShowPin(!showPin);
  };

  const toggleConfirmPinVisibility = () => {
    setShowConfirmPin(!showConfirmPin);
  };

  const clearError = (field: string) => {
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
    if (errors.general) {
      setErrors(prev => ({
        ...prev,
        general: ''
      }));
    }
  };

  const isFormDisabled = isLoading;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBack}
          disabled={isFormDisabled}
        >
          <ArrowLeft size={24} color={isFormDisabled ? Colors.textLight : Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Account</Text>
        <View style={styles.placeholder} />
      </View>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <ScreenContainer>
            <View style={styles.content}>
              <View style={styles.heroSection}>
                <View style={styles.logoContainer}>
                  <View style={styles.logoCircle}>
                    <Shield size={40} color={Colors.white} />
                  </View>
                </View>
                <Text style={styles.title}>Create Your Account</Text>
                <Text style={styles.subtitle}>
                  Join Aquelia to streamline your sachet water production and grow your business
                </Text>
              </View>
              
              {!isBackendAvailable && (
                <View style={styles.offlineContainer}>
                  <Text style={styles.offlineText}>
                    {backendError || "You are currently in offline mode. Some features may be limited."}
                  </Text>
                </View>
              )}
              
              {errors.general ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{errors.general}</Text>
                </View>
              ) : null}
              
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <View style={styles.inputIconContainer}>
                    <User size={20} color={Colors.primary} />
                  </View>
                  <Input
                    label="Full Name"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChangeText={(text) => {
                      setFullName(text);
                      clearError('fullName');
                    }}
                    error={errors.fullName}
                    autoCapitalize="words"
                    editable={!isFormDisabled}
                    containerStyle={styles.inputWithIcon}
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <View style={styles.inputIconContainer}>
                    <Phone size={20} color={Colors.primary} />
                  </View>
                  <Input
                    label="Phone Number"
                    placeholder="Enter your phone number"
                    value={phoneNumber}
                    onChangeText={(text) => {
                      setPhoneNumber(text);
                      clearError('phoneNumber');
                    }}
                    keyboardType="phone-pad"
                    error={errors.phoneNumber}
                    editable={!isFormDisabled}
                    containerStyle={styles.inputWithIcon}
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <View style={styles.inputIconContainer}>
                    <Mail size={20} color={Colors.primary} />
                  </View>
                  <Input
                    label="Email (Optional)"
                    placeholder="Enter your email address"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      clearError('email');
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={errors.email}
                    hint="For account recovery and updates"
                    editable={!isFormDisabled}
                    containerStyle={styles.inputWithIcon}
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <View style={styles.inputIconContainer}>
                    <Lock size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.pinInputContainer}>
                    <Input
                      label="PIN"
                      placeholder="Create a 4-digit PIN"
                      value={pin}
                      onChangeText={(text) => {
                        setPin(text);
                        clearError('pin');
                      }}
                      keyboardType="number-pad"
                      secureTextEntry={!showPin}
                      maxLength={4}
                      error={errors.pin}
                      containerStyle={[styles.inputWithIcon, styles.pinInput]}
                      editable={!isFormDisabled}
                    />
                    <TouchableOpacity 
                      style={styles.visibilityToggle}
                      onPress={togglePinVisibility}
                      disabled={isFormDisabled}
                    >
                      {showPin ? (
                        <EyeOff size={20} color={Colors.textLight} />
                      ) : (
                        <Eye size={20} color={Colors.textLight} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.inputContainer}>
                  <View style={styles.inputIconContainer}>
                    <Lock size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.pinInputContainer}>
                    <Input
                      label="Confirm PIN"
                      placeholder="Confirm your PIN"
                      value={confirmPin}
                      onChangeText={(text) => {
                        setConfirmPin(text);
                        clearError('confirmPin');
                      }}
                      keyboardType="number-pad"
                      secureTextEntry={!showConfirmPin}
                      maxLength={4}
                      error={errors.confirmPin}
                      containerStyle={[styles.inputWithIcon, styles.pinInput]}
                      editable={!isFormDisabled}
                    />
                    <TouchableOpacity 
                      style={styles.visibilityToggle}
                      onPress={toggleConfirmPinVisibility}
                      disabled={isFormDisabled}
                    >
                      {showConfirmPin ? (
                        <EyeOff size={20} color={Colors.textLight} />
                      ) : (
                        <Eye size={20} color={Colors.textLight} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              
              <Button
                title={isFormDisabled ? "Creating Account..." : "Create Account"}
                onPress={handleRegister}
                loading={isFormDisabled}
                disabled={isFormDisabled}
                style={styles.button}
              />
              
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity 
                  onPress={() => router.push('/auth/login')}
                  disabled={isFormDisabled}
                >
                  <Text style={[
                    styles.loginLink,
                    isFormDisabled && styles.loginLinkDisabled
                  ]}>
                    Login
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScreenContainer>
        </ScrollView>
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
    flex: 1
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background
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
    flex: 1,
    paddingBottom: 24
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32
  },
  logoContainer: {
    marginBottom: 24
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#48CAE4',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#48CAE4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: Fonts.sizes.md,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20
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
  errorContainer: {
    backgroundColor: Colors.danger + '10',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.danger + '30'
  },
  errorText: {
    color: Colors.danger,
    fontSize: Fonts.sizes.sm,
    textAlign: 'center',
    fontWeight: '500'
  },
  form: {
    marginBottom: 24
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20
  },
  inputIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#48CAE4' + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 24
  },
  inputWithIcon: {
    flex: 1,
    marginBottom: 0
  },
  pinInputContainer: {
    position: 'relative',
    flex: 1
  },
  pinInput: {
    width: '100%',
  },
  visibilityToggle: {
    position: 'absolute',
    right: 12,
    top: 38,
    padding: 8,
  },
  button: {
    marginTop: 16,
    backgroundColor: '#48CAE4',
    paddingVertical: Platform.OS === 'ios' ? 16 : 14,
    borderRadius: 12,
    shadowColor: '#48CAE4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    paddingVertical: 16
  },
  loginText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textLight
  },
  loginLink: {
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: '#48CAE4'
  },
  loginLinkDisabled: {
    color: Colors.textLight
  }
});