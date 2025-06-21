import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import ScreenContainer from '@/components/ScreenContainer';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import useAuthStore from '@/store/auth-store';
import type { Company } from '@/types/auth';

export default function CompanySetupScreen() {
  const router = useRouter();
  const { user, setCompany } = useAuthStore();
  
  const [companyName, setCompanyName] = useState('');
  const [productName, setProductName] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [region, setRegion] = useState('');
  const [city, setCity] = useState('');
  const [gpsAddress, setGpsAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
  
  const [errors, setErrors] = useState({
    companyName: '',
    productName: '',
    companyId: '',
    region: '',
    city: '',
    phoneNumbers: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      companyName: '',
      productName: '',
      companyId: '',
      region: '',
      city: '',
      phoneNumbers: ''
    };

    if (!companyName.trim()) {
      newErrors.companyName = 'Company name is required';
      isValid = false;
    } else if (companyName.trim().length < 2) {
      newErrors.companyName = 'Company name must be at least 2 characters';
      isValid = false;
    }

    if (!productName.trim()) {
      newErrors.productName = 'Product name is required';
      isValid = false;
    } else if (productName.trim().length < 2) {
      newErrors.productName = 'Product name must be at least 2 characters';
      isValid = false;
    }

    if (!companyId.trim()) {
      newErrors.companyId = 'Company/FDA ID is required';
      isValid = false;
    } else if (companyId.trim().length < 3) {
      newErrors.companyId = 'Company/FDA ID must be at least 3 characters';
      isValid = false;
    }

    if (!region.trim()) {
      newErrors.region = 'Region is required';
      isValid = false;
    } else if (region.trim().length < 2) {
      newErrors.region = 'Region must be at least 2 characters';
      isValid = false;
    }

    if (!city.trim()) {
      newErrors.city = 'City is required';
      isValid = false;
    } else if (city.trim().length < 2) {
      newErrors.city = 'City must be at least 2 characters';
      isValid = false;
    }

    if (phoneNumbers.length === 0) {
      newErrors.phoneNumbers = 'At least one phone number is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const addPhoneNumber = () => {
    const trimmedPhone = phoneNumber.trim();
    
    if (!trimmedPhone) {
      setErrors({
        ...errors,
        phoneNumbers: 'Please enter a phone number'
      });
      return;
    }

    if (!/^\d{10}$/.test(trimmedPhone)) {
      setErrors({
        ...errors,
        phoneNumbers: 'Please enter a valid 10-digit phone number'
      });
      return;
    }

    if (phoneNumbers.includes(trimmedPhone)) {
      setErrors({
        ...errors,
        phoneNumbers: 'This phone number is already added'
      });
      return;
    }

    setPhoneNumbers([...phoneNumbers, trimmedPhone]);
    setPhoneNumber('');
    setErrors({
      ...errors,
      phoneNumbers: ''
    });
  };

  const removePhoneNumber = (index: number) => {
    const updatedPhoneNumbers = [...phoneNumbers];
    updatedPhoneNumbers.splice(index, 1);
    setPhoneNumbers(updatedPhoneNumbers);
    
    // Clear error if we still have phone numbers
    if (updatedPhoneNumbers.length > 0) {
      setErrors({
        ...errors,
        phoneNumbers: ''
      });
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors and try again.');
      return;
    }
    
    if (!user?.id) {
      Alert.alert('Error', 'User information not found. Please try logging in again.');
      router.replace('/auth/register');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('[CompanySetup] Creating company with data:', {
        name: companyName.trim(),
        productName: productName.trim(),
        companyId: companyId.trim(),
        region: region.trim(),
        city: city.trim(),
        phoneNumbers: phoneNumbers.length
      });
      
      // Simulate API call with realistic delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newCompany: Company = {
        id: `company_${Date.now()}`,
        name: companyName.trim(),
        productName: productName.trim(),
        companyId: companyId.trim(),
        region: region.trim(),
        city: city.trim(),
        gpsAddress: gpsAddress.trim() || undefined,
        phoneNumbers,
        active: false,
        ownerId: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        subscriptionPlan: 'basic', // Required property - default to basic
        address: `${city.trim()}, ${region.trim()}`,
        phoneNumber: phoneNumbers[0] || undefined,
        email: user.email || undefined,
        logo: undefined,
        industry: 'Water Production',
        subscriptionStartDate: undefined,
        subscriptionEndDate: undefined
      };
      
      console.log('[CompanySetup] Company created successfully:', newCompany.id);
      setCompany(newCompany);
      
      // Navigate to subscription screen
      router.push('/setup/subscription');
    } catch (error) {
      console.error('[CompanySetup] Company setup error:', error);
      Alert.alert(
        'Setup Error', 
        'Failed to create company. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (isSubmitting) return;
    router.replace('/auth/verify');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBack}
          disabled={isSubmitting}
        >
          <ArrowLeft size={24} color={isSubmitting ? Colors.textLight : Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Company Setup</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScreenContainer>
        <View style={styles.content}>
          <Text style={styles.title}>Create Your Company</Text>
          <Text style={styles.subtitle}>
            Enter your company details to get started with Aquelia
          </Text>
          
          <View style={styles.form}>
            <Input
              label="Company Name"
              placeholder="Enter company name"
              value={companyName}
              onChangeText={setCompanyName}
              error={errors.companyName}
              autoCapitalize="words"
              editable={!isSubmitting}
            />
            
            <Input
              label="Product Name"
              placeholder="Enter product name"
              value={productName}
              onChangeText={setProductName}
              error={errors.productName}
              autoCapitalize="words"
              editable={!isSubmitting}
            />
            
            <Input
              label="Company/FDA ID"
              placeholder="Enter company or FDA issued ID"
              value={companyId}
              onChangeText={setCompanyId}
              error={errors.companyId}
              autoCapitalize="characters"
              editable={!isSubmitting}
            />
            
            <Input
              label="Region"
              placeholder="Enter region"
              value={region}
              onChangeText={setRegion}
              error={errors.region}
              autoCapitalize="words"
              editable={!isSubmitting}
            />
            
            <Input
              label="City"
              placeholder="Enter city"
              value={city}
              onChangeText={setCity}
              error={errors.city}
              autoCapitalize="words"
              editable={!isSubmitting}
            />
            
            <Input
              label="GPS Address (Optional)"
              placeholder="Enter GPS address"
              value={gpsAddress}
              onChangeText={setGpsAddress}
              editable={!isSubmitting}
            />
            
            <View style={styles.phoneSection}>
              <Text style={styles.label}>Company Phone Numbers</Text>
              <View style={styles.phoneInputContainer}>
                <Input
                  placeholder="Enter phone number"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  containerStyle={styles.phoneInput}
                  error={errors.phoneNumbers}
                  editable={!isSubmitting}
                />
                <Button
                  title="Add"
                  onPress={addPhoneNumber}
                  size="small"
                  style={styles.addButton}
                  disabled={isSubmitting || !phoneNumber.trim()}
                />
              </View>
              
              {phoneNumbers.length > 0 && (
                <View style={styles.phoneList}>
                  {phoneNumbers.map((number, index) => (
                    <View key={index} style={styles.phoneItem}>
                      <Text style={styles.phoneNumber}>{number}</Text>
                      <TouchableOpacity
                        onPress={() => removePhoneNumber(index)}
                        style={styles.removeButton}
                        disabled={isSubmitting}
                      >
                        <Text style={[
                          styles.removeButtonText,
                          isSubmitting && styles.removeButtonTextDisabled
                        ]}>
                          Remove
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
          
          <Button
            title={isSubmitting ? "Creating Company..." : "Continue"}
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.button}
          />
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
    marginBottom: 24,
    lineHeight: 20
  },
  form: {
    marginBottom: 24
  },
  label: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 6
  },
  phoneSection: {
    marginBottom: 16
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  phoneInput: {
    flex: 1,
    marginRight: 8,
    marginBottom: 0
  },
  addButton: {
    marginTop: 24
  },
  phoneList: {
    marginTop: 12
  },
  phoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border
  },
  phoneNumber: {
    fontSize: Fonts.sizes.md,
    color: Colors.text,
    fontWeight: '500'
  },
  removeButton: {
    padding: 4
  },
  removeButtonText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.danger,
    fontWeight: '500'
  },
  removeButtonTextDisabled: {
    color: Colors.textLight
  },
  button: {
    marginTop: 16,
    backgroundColor: Colors.primary
  }
});