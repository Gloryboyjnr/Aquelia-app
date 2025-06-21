import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Calendar, Filter, User, X, ChevronDown, ChevronUp } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import Card from '@/components/Card';
import Input from '@/components/Input';
import useProductionStore from '@/store/production-store';
import { ProductionRecord } from '@/types/inventory';

const dateRangeOptions = [
  { label: 'All Time', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Last 7 Days', value: 'week' },
  { label: 'Last 30 Days', value: 'month' },
];

export default function ProductionHistoryScreen() {
  const { productionRecords } = useProductionStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all');
  const [selectedProducer, setSelectedProducer] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showSummary, setShowSummary] = useState(true);

  // Get unique producer names for filter - with null check
  const uniqueProducers = Array.from(
    new Set((productionRecords || []).map(entry => entry.producerName))
  ).sort();
  
  const producerOptions = [
    { label: 'All Producers', value: 'all' },
    ...uniqueProducers.map(name => ({ label: name, value: name }))
  ];

  const filterByDateRange = (entries: ProductionRecord[] | undefined, range: string) => {
    if (!entries || entries.length === 0) return [];
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (range) {
      case 'today':
        return entries.filter(entry => {
          const entryDate = new Date(entry.date);
          const entryDay = new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate());
          return entryDay.getTime() === today.getTime();
        });
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return entries.filter(entry => new Date(entry.date) >= weekAgo);
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setDate(monthAgo.getDate() - 30);
        return entries.filter(entry => new Date(entry.date) >= monthAgo);
      default:
        return entries;
    }
  };

  const filteredHistory = filterByDateRange(productionRecords || [], selectedDateRange)
    .filter(entry => {
      // Filter by producer
      if (selectedProducer !== 'all' && entry.producerName !== selectedProducer) {
        return false;
      }
      // Filter by search query
      return entry.producerName.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const clearAllFilters = () => {
    setSelectedProducer('all');
    setSelectedDateRange('all');
    setSearchQuery('');
    setShowFilters(false);
  };

  const hasActiveFilters = selectedProducer !== 'all' || selectedDateRange !== 'all' || searchQuery;

  const renderHistoryItem = ({ item }: { item: ProductionRecord }) => (
    <Card style={[
      styles.historyItem,
      selectedProducer !== 'all' && item.producerName === selectedProducer && styles.highlightedItem
    ]}>
      <View style={styles.historyHeader}>
        <View style={styles.historyMainInfo}>
          <View style={styles.producerNameContainer}>
            <Text style={[
              styles.producerName,
              selectedProducer !== 'all' && item.producerName === selectedProducer && styles.highlightedProducerName
            ]}>
              {item.producerName}
            </Text>
            {selectedProducer !== 'all' && item.producerName === selectedProducer && (
              <View style={styles.selectedBadge}>
                <Text style={styles.selectedBadgeText}>MATCH</Text>
              </View>
            )}
          </View>
          <Text style={styles.date}>
            {new Date(item.date).toLocaleString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })}
          </Text>
        </View>
        
        <View style={styles.historyStats}>
          <Text style={[
            styles.bagsProduced,
            selectedProducer !== 'all' && item.producerName === selectedProducer && styles.highlightedBags
          ]}>
            {item.bagsProduced}
          </Text>
          <Text style={styles.bagsLabel}>bags</Text>
        </View>
      </View>

      <View style={styles.historyDetails}>
        <View style={styles.detailGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Packing Bags</Text>
            <Text style={styles.detailValue}>{item.bundlesProduced}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Machine</Text>
            <Text style={styles.detailValue}>#{item.machineNumber}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Rolls Used</Text>
            <Text style={styles.detailValue}>{item.rawMaterialUsed}kg</Text>
          </View>
        </View>
      </View>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No Production Records</Text>
      <Text style={styles.emptyStateSubtitle}>
        {hasActiveFilters
          ? 'No records match your current filters'
          : 'Start assigning production to see records here'
        }
      </Text>
      {hasActiveFilters && (
        <TouchableOpacity style={styles.clearFiltersButton} onPress={clearAllFilters}>
          <Text style={styles.clearFiltersText}>Clear All Filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const getTotalStats = () => {
    const totalBags = filteredHistory.reduce((sum, entry) => sum + entry.bagsProduced, 0);
    const totalPackingBags = filteredHistory.reduce((sum, entry) => sum + entry.bundlesProduced, 0);
    const totalRolls = filteredHistory.reduce((sum, entry) => sum + entry.rawMaterialUsed, 0);
    
    return { totalBags, totalPackingBags, totalRolls };
  };

  const { totalBags, totalPackingBags, totalRolls } = getTotalStats();

  const renderHeader = () => (
    <>
      <View style={styles.headerContainer}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Input
              placeholder="Search producers..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              containerStyle={styles.searchInputWrapper}
              leftIcon={<Search size={18} color={Colors.textLight} />}
            />
          </View>
          
          <TouchableOpacity
            style={[styles.filterButton, showFilters && styles.activeFilterButton]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} color={showFilters ? '#fff' : Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <View style={styles.activeFiltersRow}>
            {selectedProducer !== 'all' && (
              <View style={styles.activeFilterChip}>
                <User size={14} color={Colors.secondary} />
                <Text style={styles.activeFilterChipText}>{selectedProducer}</Text>
                <TouchableOpacity onPress={() => setSelectedProducer('all')}>
                  <X size={14} color={Colors.secondary} />
                </TouchableOpacity>
              </View>
            )}
            
            {selectedDateRange !== 'all' && (
              <View style={styles.activeFilterChip}>
                <Calendar size={14} color={Colors.primary} />
                <Text style={styles.activeFilterChipText}>
                  {dateRangeOptions.find(opt => opt.value === selectedDateRange)?.label}
                </Text>
                <TouchableOpacity onPress={() => setSelectedDateRange('all')}>
                  <X size={14} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            )}
            
            <TouchableOpacity style={styles.clearAllChip} onPress={clearAllFilters}>
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Expandable Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <Card style={styles.filtersCard}>
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Date Range</Text>
              <View style={styles.filterOptions}>
                {dateRangeOptions.map((option) => (
                  <TouchableOpacity
                    key={`date-${option.value}`}
                    style={[
                      styles.filterOption,
                      selectedDateRange === option.value && styles.selectedDateRangeOption
                    ]}
                    onPress={() => setSelectedDateRange(option.value)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      selectedDateRange === option.value && styles.selectedOptionText
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Producer</Text>
              <View style={styles.filterOptions}>
                {producerOptions.map((option) => (
                  <TouchableOpacity
                    key={`producer-${option.value}`}
                    style={[
                      styles.filterOption,
                      selectedProducer === option.value && styles.selectedProducerOption
                    ]}
                    onPress={() => setSelectedProducer(option.value)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      selectedProducer === option.value && styles.selectedOptionText
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Card>
        </View>
      )}

      {/* Collapsible Summary */}
      {filteredHistory.length > 0 && (
        <View style={styles.summaryContainer}>
          <TouchableOpacity
            style={styles.summaryHeader}
            onPress={() => setShowSummary(!showSummary)}
          >
            <Text style={styles.summaryHeaderText}>
              Summary ({filteredHistory.length} records)
            </Text>
            {showSummary ? (
              <ChevronUp size={20} color={Colors.textLight} />
            ) : (
              <ChevronDown size={20} color={Colors.textLight} />
            )}
          </TouchableOpacity>
          
          {showSummary && (
            <Card style={styles.summaryCard}>
              <View style={styles.summaryStats}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{totalBags}</Text>
                  <Text style={styles.summaryLabel}>Bags</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{totalPackingBags}</Text>
                  <Text style={styles.summaryLabel}>Packing Bags</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{totalRolls}kg</Text>
                  <Text style={styles.summaryLabel}>Rolls Used</Text>
                </View>
              </View>
            </Card>
          )}
        </View>
      )}
    </>
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
  headerContainer: {
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    position: 'relative',
  },
  searchInputWrapper: {
    marginBottom: 0,
  },
  searchInput: {
    paddingLeft: 8, // Adjusted for the icon inside Input component
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeFilterButton: {
    backgroundColor: Colors.primary,
  },
  activeFiltersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeFilterChipText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
    fontWeight: '500',
  },
  clearAllChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.textLight + '20',
  },
  clearAllText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    fontWeight: '500',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filtersCard: {
    marginBottom: 0,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  selectedDateRangeOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  selectedProducerOption: {
    borderColor: Colors.secondary,
    backgroundColor: Colors.secondary,
  },
  filterOptionText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: '600',
  },
  summaryContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryHeaderText: {
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  summaryCard: {
    marginBottom: 0,
    marginTop: 4,
  },
  summaryStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    textAlign: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  historyList: {
    padding: 16,
    paddingTop: 8,
  },
  historyItem: {
    marginBottom: 12,
  },
  highlightedItem: {
    borderWidth: 2,
    borderColor: Colors.secondary + '40',
    backgroundColor: Colors.secondary + '05',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  historyMainInfo: {
    flex: 1,
  },
  producerNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  producerName: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  highlightedProducerName: {
    color: Colors.secondary,
  },
  selectedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: Colors.secondary,
  },
  selectedBadgeText: {
    fontSize: Fonts.sizes.xs,
    color: '#fff',
    fontWeight: '600',
  },
  date: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
  },
  historyStats: {
    alignItems: 'flex-end',
  },
  bagsProduced: {
    fontSize: Fonts.sizes.xl,
    fontWeight: '700',
    color: Colors.primary,
  },
  highlightedBags: {
    color: Colors.secondary,
  },
  bagsLabel: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
  },
  historyDetails: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 16,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailItem: {
    flex: 1,
    minWidth: '30%',
  },
  detailLabel: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
    color: Colors.text,
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
    marginBottom: 16,
  },
  clearFiltersButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.primary,
  },
  clearFiltersText: {
    fontSize: Fonts.sizes.sm,
    color: '#fff',
    fontWeight: '600',
  },
});