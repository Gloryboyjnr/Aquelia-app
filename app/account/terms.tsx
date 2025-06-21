import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';

export default function TermsScreen() {
  const router = useRouter();
  
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
        <Text style={styles.headerTitle}>Terms & Policies</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Terms of Service</Text>
            <Text style={styles.paragraph}>
              Welcome to Aquelia, a water production management application. By using our app, you agree to these terms. Please read them carefully.
            </Text>
            <Text style={styles.paragraph}>
              Aquelia provides tools for water production companies to manage their operations, including inventory tracking, production monitoring, quality control, and sales management.
            </Text>
            <Text style={styles.paragraph}>
              You must create an account to use Aquelia. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
            </Text>
            <Text style={styles.paragraph}>
              Aquelia offers different subscription plans with varying features. Payment is required for continued access to the service according to the plan you select.
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy Policy</Text>
            <Text style={styles.paragraph}>
              At Aquelia, we take your privacy seriously. This policy describes what information we collect and how we use it.
            </Text>
            <Text style={styles.paragraph}>
              We collect information you provide directly, such as your name, email address, phone number, company details, and production data. We also collect usage data to improve our service.
            </Text>
            <Text style={styles.paragraph}>
              We use your information to provide and improve our service, communicate with you, and comply with legal obligations. We do not sell your personal information to third parties.
            </Text>
            <Text style={styles.paragraph}>
              We implement appropriate security measures to protect your information. However, no method of transmission over the Internet or electronic storage is 100% secure.
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Processing Agreement</Text>
            <Text style={styles.paragraph}>
              As a data processor, Aquelia processes personal data on behalf of our customers (the data controllers) in accordance with applicable data protection laws.
            </Text>
            <Text style={styles.paragraph}>
              We process data only on documented instructions from the controller, ensure confidentiality, implement appropriate security measures, and assist the controller in meeting their obligations.
            </Text>
            <Text style={styles.paragraph}>
              Upon termination of services, we will delete or return all personal data to the controller and delete existing copies, unless legally required to store the data.
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Acceptable Use Policy</Text>
            <Text style={styles.paragraph}>
              You agree not to use Aquelia to:
            </Text>
            <Text style={styles.listItem}>• Violate any laws or regulations</Text>
            <Text style={styles.listItem}>• Infringe on the rights of others</Text>
            <Text style={styles.listItem}>• Send spam or malicious content</Text>
            <Text style={styles.listItem}>• Attempt to gain unauthorized access to our systems</Text>
            <Text style={styles.listItem}>• Interfere with the proper functioning of our service</Text>
            <Text style={styles.paragraph}>
              Violation of this policy may result in termination of your account.
            </Text>
          </View>
          
          <Text style={styles.lastUpdated}>Last updated: June 1, 2025</Text>
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
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: Fonts.sizes.md,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  listItem: {
    fontSize: Fonts.sizes.md,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 8,
    paddingLeft: 16,
  },
  lastUpdated: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 16,
  },
});