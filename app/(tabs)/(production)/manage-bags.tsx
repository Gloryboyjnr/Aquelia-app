import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Package, Calendar, User, FileText } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Card from '@/components/Card';
import useProductionStore from '@/store/production-store';
import useAuthStore from '@/store/auth-store';

export default function ManageBagsScreen() {
  const { 
    getBagsInStock, 
    addManualBags, 
    getTodayManualEntries,
    getManualBagsHistory 
  } = useProductionStore();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'add' | 'history'>('add');
  const [quantity, setQuantity] = useState('');
  const [source, setSource] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bagsInStock = getBagsInStock();
  
  // Filter manual entries to only show those that are not from supplier returns
  const todayManualEntries = getTodayManualEntries().filter(
    entry => !entry.source.startsWith('supplier_')
  );
  
  // Filter manual history to only show those that are not from supplier returns
  const manualHistory = getManualBagsHistory(7).filter(
    entry => !entry.source.startsWith('supplier_')
  );

  const handleAddBags = () => {
    const qty = parseInt(quantity);
    
    if (!quantity || isNaN(qty) || qty <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    if (!source.trim()) {
      Alert.alert('Error', 'Please enter the source of bags');
      return;
    }

    setIsSubmitting(true);

    try {
      addManualBags(qty, source.trim(), notes.trim() || undefined, user?.fullName);
      
      Alert.alert(
        'Success',
        `${qty} bags added to stock from ${source}`,
        [
          {
            text: 'Add More',
            onPress: () => {
              setQuantity('');
              setSource('');
              setNotes('');
              setIsSubmitting(false);
            },
          },
          {
            text: 'Done',
            onPress: () => setIsSubmitting(false),
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add bags to stock');
      setIsSubmitting(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'add':
        return (
          <View style={styles.tabContent}>
            <Input
              label="Quantity"
              placeholder="Enter number of bags"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="number-pad"
            />

            <Input
              label="Source"
              placeholder="e.g., External supplier, Transfer from warehouse"
              value={source}
              onChangeText={setSource}
              autoCapitalize="words"
            />

            <Input
              label="Notes (Optional)"
              placeholder="Additional details about these bags"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />

            <Button
              title="Add Bags to Stock"
              onPress={handleAddBags}
              loading={isSubmitting}
              disabled={isSubmitting || !quantity || !source}
              leftIcon={<Plus size={20} color="#fff" />}
              style={styles.submitButton}
            />
          </View>
        );

      case 'history':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.historyTitle}>Recent Manual Entries (Last 7 days)</Text>
            
            {manualHistory.length === 0 ? (
              <View style={styles.emptyState}>
                <FileText size={48} color={Colors.textLight} />
                <Text style={styles.emptyText}>No manual entries found</Text>
              </View>
            ) : (
              <FlatList
                data={manualHistory}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Card style={styles.historyCard}>
                    <View style={styles.historyHeader}>
                      <View style={styles.historyInfo}>
                        <Text style={[
                          styles.historyQuantity,
                          { color: item.quantity > 0 ? Colors.success : Colors.danger }
                        ]}>
                          {item.quantity > 0 ? '+' : ''}{item.quantity} bags
                        </Text>
                        <Text style={styles.historySource}>{item.source}</Text>
                      </View>
                      <Text style={styles.historyDate}>
                        {new Date(item.date).toLocaleDateString()}
                      </Text>
                    </View>

                    {item.enteredBy && (
                      <View style={styles.historyDetail}>
                        <User size={14} color={Colors.textLight} />
                        <Text style={styles.historyDetailText}>By: {item.enteredBy}</Text>
                      </View>
                    )}

                    {item.notes && (
                      <View style={styles.historyDetail}>
                        <FileText size={14} color={Colors.textLight} />
                        <Text style={styles.historyDetailText}>{item.notes}</Text>
                      </View>
                    )}
                  </Card>
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.historyList}
              />
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Stock Summary */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Package size={20} color={Colors.primary} />
            <Text style={styles.summaryTitle}>Current Stock Summary</Text>
          </View>

          <View style={styles.summaryStats}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{bagsInStock.total}</Text>
              <Text style={styles.summaryLabel}>Total Bags</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{bagsInStock.production}</Text>
              <Text style={styles.summaryLabel}>Production</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{bagsInStock.remaining}</Text>
              <Text style={styles.summaryLabel}>Remaining</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: Colors.accent }]}>{bagsInStock.manual}</Text>
              <Text style={styles.summaryLabel}>Manual</Text>
            </View>
          </View>

          {todayManualEntries.length > 0 && (
            <View style={styles.todayInfo}>
              <Calendar size={16} color={Colors.primary} />
              <Text style={styles.todayText}>
                {todayManualEntries.length} manual entries today
              </Text>
            </View>
          )}
        </Card>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <Button
            title="Add Bags"
            onPress={() => setActiveTab('add')}
            variant={activeTab === 'add' ? 'primary' : 'outline'}
            style={styles.tabButton}
          />
          <Button
            title="History"
            onPress={() => setActiveTab('history')}
            variant={activeTab === 'history' ? 'primary' : 'outline'}
            style={styles.tabButton}
          />
        </View>

        {/* Tab Content */}
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  summaryCard: {
    marginBottom: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: Fonts.sizes.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
  },
  todayInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  todayText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
  },
  tabContent: {
    gap: 16,
  },
  submitButton: {
    marginTop: 8,
  },
  historyTitle: {
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 16,
  },
  emptyText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textLight,
  },
  historyList: {
    gap: 12,
  },
  historyCard: {
    padding: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  historyInfo: {
    flex: 1,
  },
  historyQuantity: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '600',
    marginBottom: 2,
  },
  historySource: {
    fontSize: Fonts.sizes.md,
    color: Colors.text,
    fontWeight: '500',
  },
  historyDate: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
  },
  historyDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  historyDetailText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
  },
});