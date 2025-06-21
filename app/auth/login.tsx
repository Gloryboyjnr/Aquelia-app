import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Eye, EyeOff, Phone, Lock, Shield } from 'lucide-react-native';
import ScreenContainer from '@/components/ScreenContainer';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import useAuthStore from '@/store/auth-store';

export default function LoginScreen() {
  const router = useRouter();
  const { setUser, setIsAuthenticated, setIsLoading, setError, setCompany } = useAuthStore();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  
  const [errors, setErrors] = useState({
    phoneNumber: '',
    pin: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      phoneNumber: '',
      pin: ''
    };

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
      isValid = false;
    } else if (!/^\d{10}$/.test(phoneNumber.trim())) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
      isValid = false;
    }

    if (!pin.trim()) {
      newErrors.pin = 'PIN is required';
      isValid = false;
    } else if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      newErrors.pin = 'PIN must be 4 digits';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setIsLoading(true);
    
    setTimeout(() => {
      try {
        const mockUser = {
          id: '12345',
          fullName: 'Demo User',
          phoneNumber,
          pin,
          role: 'manager' as 'manager' | 'operator' | 'sales' | 'delivery',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const mockCompany = {
          id: '67890',
          name: 'Demo Water Company',
          productName: 'Pure Water',
          companyId: 'FDA-12345',
          region: 'Greater Accra',
          city: 'Accra',
          phoneNumbers: [phoneNumber],
          active: true,
          subscriptionPlan: 'basic' as 'basic' | 'pro',
          subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          ownerId: '12345',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setUser(mockUser);
        setCompany(mockCompany);
        setIsAuthenticated(true);
        setIsLoading(false);
        setIsSubmitting(false);
        
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 100);
      } catch (error) {
        setIsLoading(false);
        setIsSubmitting(false);
        setError('Invalid phone number or PIN. Please try again.');
      }
    }, 1500);
  };

  const handleBack = () => {
    router.replace('/onboarding');
  };

  const togglePinVisibility = () => {
    setShowPin(!showPin);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBack}
        >
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Login</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScreenContainer>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Shield size={40} color={Colors.white} />
            </View>
            <Text style={styles.appName}>Aquelia</Text>
          </View>
          
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Login to continue managing your sachet water production
          </Text>
          
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <Phone size={20} color="#48CAE4" />
              </View>
              <Input
                label="Phone Number"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                error={errors.phoneNumber}
                containerStyle={styles.inputWithIcon}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <Lock size={20} color="#48CAE4" />
              </View>
              <View style={styles.pinInputContainer}>
                <Input
                  label="PIN"
                  placeholder="Enter your 4-digit PIN"
                  value={pin}
                  onChangeText={setPin}
                  keyboardType="number-pad"
                  secureTextEntry={!showPin}
                  maxLength={4}
                  error={errors.pin}
                  containerStyle={[styles.inputWithIcon, styles.pinInput]}
                />
                <TouchableOpacity 
                  style={styles.visibilityToggle}
                  onPress={togglePinVisibility}
                >
                  {showPin ? (
                    <EyeOff size={20} color={Colors.textLight} />
                  ) : (
                    <Eye size={20} color={Colors.textLight} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          <Button
            title="Login"
            onPress={handleLogin}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.button}
          />
          
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/register')}>
              <Text style={styles.registerLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScreenContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background
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
    flex: 1
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 40
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#48CAE4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#48CAE4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  appName: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: '700',
    color: '#48CAE4'
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
    marginBottom: 32
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
    paddingVertical: 16,
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
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    paddingVertical: 16
  },
  registerText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textLight
  },
  registerLink: {
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: '#48CAE4'
  }
});