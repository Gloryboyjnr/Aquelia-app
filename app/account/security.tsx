import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Key, Fingerprint, Shield, AlertTriangle } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import SettingsSection from '@/components/SettingsSection';
import SettingsItem from '@/components/SettingsItem';
import Button from '@/components/Button';

export default function SecurityScreen() {
  const router = useRouter();
  
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  
  const handleBack = () => {
    router.back();
  };
  
  const handleChangePin = () => {
    Alert.alert('Change PIN', 'This would navigate to change PIN screen');
  };
  
  const handleBiometricToggle = (value: boolean) => {
    if (value) {
      Alert.alert(
        'Enable Biometric Authentication',
        'This would enable biometric authentication (fingerprint/face ID)',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setBiometricEnabled(false),
          },
          {
            text: 'Enable',
            onPress: () => setBiometricEnabled(true),
          },
        ]
      );
    } else {
      setBiometricEnabled(false);
    }
  };
  
  const handleSessionTimeout = () => {
    Alert.alert('Session Timeout', 'This would navigate to session timeout settings');
  };
  
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            // Handle account deletion
            Alert.alert('Account Deleted', 'Your account has been deleted');
            router.replace('/auth/login');
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Security</Text>
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.content}>
        <SettingsSection title="Authentication">
          <SettingsItem
            title="Change PIN"
            subtitle="Update your login PIN"
            icon={<Key size={20} color={Colors.primary} />}
            onPress={handleChangePin}
          />
          <SettingsItem
            title="Biometric Authentication"
            subtitle="Use fingerprint or face ID to login"
            icon={<Fingerprint size={20} color={Colors.primary} />}
            type="switch"
            switchValue={biometricEnabled}
            onSwitchChange={handleBiometricToggle}
            isLast={true}
          />
        </SettingsSection>
        
        <SettingsSection title="Session">
          <SettingsItem
            title="Session Timeout"
            subtitle="Automatically log out after inactivity"
            icon={<Shield size={20} color={Colors.primary} />}
            onPress={handleSessionTimeout}
            isLast={true}
          />
        </SettingsSection>
        
        <View style={styles.dangerZone}>
          <Text style={styles.dangerZoneTitle}>Danger Zone</Text>
          <View style={styles.dangerZoneContent}>
            <View style={styles.dangerItem}>
              <View style={styles.dangerItemHeader}>
                <AlertTriangle size={20} color={Colors.danger} />
                <Text style={styles.dangerItemTitle}>Delete Account</Text>
              </View>
              <Text style={styles.dangerItemDescription}>
                Permanently delete your account and all associated data. This action cannot be undone.
              </Text>
              <Button
                title="Delete Account"
                onPress={handleDeleteAccount}
                variant="outline"
                style={styles.deleteButton}
                textStyle={styles.deleteButtonText}
              />
            </View>
          </View>
        </View>
      </View>
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  dangerZone: {
    marginTop: 32,
  },
  dangerZoneTitle: {
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: Colors.danger,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  dangerZoneContent: {
    backgroundColor: 'rgba(255, 0, 110, 0.05)',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 110, 0.2)',
  },
  dangerItem: {
    padding: 16,
  },
  dangerItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dangerItemTitle: {
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: Colors.danger,
    marginLeft: 8,
  },
  dangerItemDescription: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    marginBottom: 16,
  },
  deleteButton: {
    borderColor: Colors.danger,
    backgroundColor: 'transparent',
  },
  deleteButtonText: {
    color: Colors.danger,
  },
});