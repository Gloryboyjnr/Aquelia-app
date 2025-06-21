import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Download, FileText } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import Card from '@/components/Card';
import useAuthStore from '@/store/auth-store';

interface Invoice {
  id: string;
  date: string;
  amount: number;
  plan: 'basic' | 'pro';
  status: 'paid' | 'pending';
  invoiceNumber: string;
}

// Mock billing history data
const billingHistory: Invoice[] = [
  {
    id: '1',
    date: '2025-05-01',
    amount: 99.99,
    plan: 'pro',
    status: 'paid',
    invoiceNumber: 'INV-2025-001',
  },
  {
    id: '2',
    date: '2025-04-01',
    amount: 99.99,
    plan: 'pro',
    status: 'paid',
    invoiceNumber: 'INV-2025-002',
  },
  {
    id: '3',
    date: '2025-03-01',
    amount: 99.99,
    plan: 'pro',
    status: 'paid',
    invoiceNumber: 'INV-2025-003',
  },
  {
    id: '4',
    date: '2025-02-01',
    amount: 49.99,
    plan: 'basic',
    status: 'paid',
    invoiceNumber: 'INV-2025-004',
  },
  {
    id: '5',
    date: '2025-01-01',
    amount: 49.99,
    plan: 'basic',
    status: 'paid',
    invoiceNumber: 'INV-2025-005',
  },
];

export default function BillingHistoryScreen() {
  const router = useRouter();
  const { company } = useAuthStore();
  
  const handleBack = () => {
    router.back();
  };
  
  const handleDownloadInvoice = (invoiceId: string) => {
    // In a real app, this would download the invoice
    console.log(`Downloading invoice ${invoiceId}`);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const renderInvoiceItem = ({ item }: { item: Invoice }) => (
    <Card style={styles.invoiceCard}>
      <View style={styles.invoiceHeader}>
        <View>
          <Text style={styles.invoiceDate}>{formatDate(item.date)}</Text>
          <Text style={styles.invoiceNumber}>{item.invoiceNumber}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          item.status === 'paid' ? styles.paidBadge : styles.pendingBadge
        ]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.invoiceDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Plan:</Text>
          <Text style={styles.detailValue}>
            {item.plan === 'pro' ? 'Pro Plan' : 'Basic Plan'}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Amount:</Text>
          <Text style={styles.detailValue}>₵{item.amount.toFixed(2)}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Company:</Text>
          <Text style={styles.detailValue}>{company?.name || 'Your Company'}</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.downloadButton}
        onPress={() => handleDownloadInvoice(item.id)}
      >
        <Download size={16} color={Colors.primary} />
        <Text style={styles.downloadText}>Download Invoice</Text>
      </TouchableOpacity>
    </Card>
  );
  
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <FileText size={64} color={Colors.textLight} />
      <Text style={styles.emptyTitle}>No Billing History</Text>
      <Text style={styles.emptyText}>
        You don't have any billing history yet. Your invoices will appear here once you make a payment.
      </Text>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Billing History</Text>
        <View style={styles.placeholder} />
      </View>
      
      <FlatList
        data={billingHistory}
        renderItem={renderInvoiceItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>Recent Invoices</Text>
        }
      />
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
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  invoiceCard: {
    marginBottom: 16,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  invoiceDate: {
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  invoiceNumber: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  paidBadge: {
    backgroundColor: 'rgba(0, 200, 83, 0.1)',
  },
  pendingBadge: {
    backgroundColor: 'rgba(255, 171, 0, 0.1)',
  },
  statusText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '600',
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 12,
  },
  invoiceDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '500',
    color: Colors.text,
    width: 80,
  },
  detailValue: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    flex: 1,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
  },
  downloadText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textLight,
    textAlign: 'center',
  },
});