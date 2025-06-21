import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import Card from '@/components/Card';
import useInventoryStore from '@/store/inventory-store';
import { InventoryItem } from '@/types/inventory';

const filterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Rolls', value: 'rolls' },
  { label: 'Packing Bags', value: 'packingBags' },
];

export default function InventoryHistoryScreen() {
  const { items } = useInventoryStore();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'all' | 'week' | 'month'>('all');

  // Ensure items is always an array
  const inventoryItems = items || [];

  const filteredHistory = inventoryItems.filter(item => {
    if (selectedFilter !== 'all' && item.type !== selectedFilter) {
      return false;
    }

    if (dateRange !== 'all') {
      const itemDate = new Date(item.dateAdded);
      const now = new Date();
      const daysAgo = dateRange === 'week' ? 7 : 30;
      const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      
      if (itemDate < cutoffDate) {
        return false;
      }
    }

    return true;
  });

  const renderHistoryItem = ({ item }: { item: InventoryItem }) => (
    <Card style={styles.historyItem}>
      <View style={styles.historyHeader}>
        <View style={styles.historyDetails}>
          <Text style={styles.historyTitle}>
            {item.type === 'rolls' ? 'Rolls' : 'Packing Bags'}
          </Text>
          <Text style={styles.historyDate}>
            {new Date(item.dateAdded).toLocaleString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
        
        <View style={styles.historyQuantity}>
          <Text style={styles.quantityValue}>
            {item.quantity} {item.type === 'rolls' ? 'kg' : 'bundles'}
          </Text>
          {item.micronType && (
            <Text style={styles.micronType}>{item.micronType} microns</Text>
          )}
        </View>
      </View>

      {(item.manufacturerName || item.notes) && (
        <View style={styles.historyMeta}>
          {item.manufacturerName && (
            <Text style={styles.manufacturer}>
              Manufacturer: {item.manufacturerName}
            </Text>
          )}
          {item.notes && (
            <Text style={styles.notes}>
              Notes: {item.notes}
            </Text>
          )}
        </View>
      )}

      {item.receiptUrl && (
        <View style={styles.receiptIndicator}>
          <Text style={styles.receiptText}>Receipt Available</Text>
        </View>
      )}
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No Inventory History</Text>
      <Text style={styles.emptyStateSubtitle}>
        Start adding inventory items to see them here
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.filtersContainer}>
      <Card style={styles.filtersCard}>
        <Text style={styles.filtersTitle}>Filter by Material Type</Text>
        <View style={styles.filterOptions}>
          {filterOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.filterOption,
                selectedFilter === option.value && styles.selectedFilter
              ]}
              onPress={() => setSelectedFilter(option.value)}
            >
              <Text style={[
                styles.filterOptionText,
                selectedFilter === option.value && styles.selectedFilterText
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.filtersTitle}>Date Range</Text>
        <View style={styles.filterOptions}>
          <TouchableOpacity
            style={[
              styles.filterOption,
              dateRange === 'all' && styles.selectedFilter
            ]}
            onPress={() => setDateRange('all')}
          >
            <Text style={[
              styles.filterOptionText,
              dateRange === 'all' && styles.selectedFilterText
            ]}>
              All Time
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterOption,
              dateRange === 'week' && styles.selectedFilter
            ]}
            onPress={() => setDateRange('week')}
          >
            <Text style={[
              styles.filterOptionText,
              dateRange === 'week' && styles.selectedFilterText
            ]}>
              Last Week
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterOption,
              dateRange === 'month' && styles.selectedFilter
            ]}
            onPress={() => setDateRange('month')}
          >
            <Text style={[
              styles.filterOptionText,
              dateRange === 'month' && styles.selectedFilterText
            ]}>
              Last Month
            </Text>
          </TouchableOpacity>
        </View>
      </Card>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={filteredHistory}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.historyList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        ListHeaderComponent={renderHeader}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  filtersContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  filtersCard: {
    padding: 16,
  },
  filtersTitle: {
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
    marginTop: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  selectedFilter: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  filterOptionText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
  },
  selectedFilterText: {
    color: '#fff',
    fontWeight: '600',
  },
  historyList: {
    padding: 16,
    paddingTop: 8,
  },
  historyItem: {
    marginBottom: 12,
    padding: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  historyDetails: {
    flex: 1,
  },
  historyTitle: {
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  historyDate: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
  },
  historyQuantity: {
    alignItems: 'flex-end',
  },
  quantityValue: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  micronType: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
  },
  historyMeta: {
    marginBottom: 12,
  },
  manufacturer: {
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
    marginBottom: 4,
  },
  notes: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    fontStyle: 'italic',
  },
  receiptIndicator: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  receiptText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.success,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: Fonts.sizes.md,
    color: Colors.textLight,
    textAlign: 'center',
  },
});