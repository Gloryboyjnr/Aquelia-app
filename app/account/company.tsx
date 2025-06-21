import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Save } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import useAuthStore from '@/store/auth-store';
import Input from '@/components/Input';
import Button from '@/components/Button';

export default function CompanyScreen() {
  const router = useRouter();
  const { company, setCompany } = useAuthStore();
  
  const [name, setName] = useState(company?.name || '');
  const [productName, setProductName] = useState(company?.productName || '');
  const [region, setRegion] = useState(company?.region || '');
  const [city, setCity] = useState(company?.city || '');
  const [gpsAddress, setGpsAddress] = useState(company?.gpsAddress || '');
  const [phoneNumber, setPhoneNumber] = useState(company?.phoneNumbers?.[0] || '');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Company name is required');
      return;
    }
    
    if (!productName.trim()) {
      Alert.alert('Error', 'Product name is required');
      return;
    }
    
    if (!region.trim()) {
      Alert.alert('Error', 'Region is required');
      return;
    }
    
    if (!city.trim()) {
      Alert.alert('Error', 'City is required');
      return;
    }
    
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Phone number is required');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (company) {
        setCompany({
          ...company,
          name,
          productName,
          region,
          city,
          gpsAddress: gpsAddress || undefined,
          phoneNumbers: [phoneNumber],
          updatedAt: new Date().toISOString(),
        });
      }
      
      setIsLoading(false);
      Alert.alert('Success', 'Company information updated successfully');
      router.back();
    }, 1000);
  };
  
  const handleBack = () => {
    router.back();
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Company Settings</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Save size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.form}>
            <Input
              label="Company Name"
              value={name}
              onChangeText={setName}
              placeholder="Enter company name"
              required
            />
            
            <Input
              label="Product Name"
              value={productName}
              onChangeText={setProductName}
              placeholder="Enter product name"
              required
            />
            
            <Input
              label="Region"
              value={region}
              onChangeText={setRegion}
              placeholder="Enter region"
              required
            />
            
            <Input
              label="City"
              value={city}
              onChangeText={setCity}
              placeholder="Enter city"
              required
            />
            
            <Input
              label="GPS Address"
              value={gpsAddress}
              onChangeText={setGpsAddress}
              placeholder="Enter GPS address"
            />
            
            <Input
              label="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              required
            />
          </View>
          
          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={isLoading}
            style={styles.saveChangesButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  saveButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  form: {
    marginBottom: 24,
  },
  saveChangesButton: {
    marginTop: 8,
  },
});