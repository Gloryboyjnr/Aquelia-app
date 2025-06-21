import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, MessageCircle, Phone, Mail, Globe, FileText, HelpCircle } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import Card from '@/components/Card';

export default function HelpScreen() {
  const router = useRouter();
  
  const handleBack = () => {
    router.back();
  };
  
  const handleContact = (type: 'phone' | 'email' | 'chat' | 'website') => {
    switch (type) {
      case 'phone':
        Linking.openURL('tel:+233241234567');
        break;
      case 'email':
        Linking.openURL('mailto:support@aquelia.com');
        break;
      case 'chat':
        // Open chat support
        break;
      case 'website':
        Linking.openURL('https://aquelia.com');
        break;
    }
  };
  
  const faqs = [
    {
      question: 'How do I add a new production batch?',
      answer: 'Go to the Production tab and tap on the "New Batch" button. Fill in the required details and submit the form.',
    },
    {
      question: 'How do I track inventory?',
      answer: 'Navigate to the Inventory tab where you can view current stock levels, add new inventory items, and track usage.',
    },
    {
      question: 'How do I generate reports?',
      answer: 'Reports can be generated from each module (Production, Sales, Inventory, Quality). Look for the "Reports" or "Export" option in the respective screens.',
    },
    {
      question: 'How do I add a new employee?',
      answer: 'Go to Settings > Employee Management > Add Employee. Fill in the employee details and assign appropriate roles and permissions.',
    },
    {
      question: 'How do I upgrade my subscription?',
      answer: 'Go to Settings > Subscription Plan > Upgrade. Choose the Pro plan and follow the payment instructions.',
    },
  ];
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactCards}>
            <TouchableOpacity 
              style={styles.contactCard} 
              onPress={() => handleContact('phone')}
            >
              <Phone size={24} color={Colors.primary} />
              <Text style={styles.contactText}>Call Support</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.contactCard} 
              onPress={() => handleContact('email')}
            >
              <Mail size={24} color={Colors.primary} />
              <Text style={styles.contactText}>Email</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.contactCard} 
              onPress={() => handleContact('chat')}
            >
              <MessageCircle size={24} color={Colors.primary} />
              <Text style={styles.contactText}>Live Chat</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.contactCard} 
              onPress={() => handleContact('website')}
            >
              <Globe size={24} color={Colors.primary} />
              <Text style={styles.contactText}>Website</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqs.map((faq, index) => (
            <Card key={index} style={styles.faqCard}>
              <View style={styles.questionContainer}>
                <HelpCircle size={20} color={Colors.primary} />
                <Text style={styles.question}>{faq.question}</Text>
              </View>
              <Text style={styles.answer}>{faq.answer}</Text>
            </Card>
          ))}
          
          <Text style={styles.sectionTitle}>Documentation</Text>
          <Card style={styles.docCard}>
            <TouchableOpacity style={styles.docItem}>
              <FileText size={20} color={Colors.primary} />
              <Text style={styles.docText}>User Manual</Text>
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.docItem}>
              <FileText size={20} color={Colors.primary} />
              <Text style={styles.docText}>Quick Start Guide</Text>
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.docItem}>
              <FileText size={20} color={Colors.primary} />
              <Text style={styles.docText}>Video Tutorials</Text>
            </TouchableOpacity>
          </Card>
          
          <View style={styles.supportInfo}>
            <Text style={styles.supportInfoText}>
              Support Hours: Monday - Friday, 8:00 AM - 5:00 PM GMT
            </Text>
            <Text style={styles.supportInfoText}>
              Email: support@aquelia.com
            </Text>
            <Text style={styles.supportInfoText}>
              Phone: +233 24 123 4567
            </Text>
          </View>
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
  sectionTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
    marginTop: 24,
  },
  contactCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  contactCard: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  contactCardInner: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  contactText: {
    fontSize: Fonts.sizes.md,
    fontWeight: '500',
    color: Colors.text,
    marginTop: 8,
  },
  faqCard: {
    marginBottom: 12,
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  question: {
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    marginLeft: 12,
  },
  answer: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    marginLeft: 32,
  },
  docCard: {
    marginBottom: 24,
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  docText: {
    fontSize: Fonts.sizes.md,
    color: Colors.text,
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  supportInfo: {
    marginTop: 8,
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  supportInfoText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    marginBottom: 4,
  },
});