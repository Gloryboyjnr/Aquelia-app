import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Calendar, Filter, Package, DollarSign, AlertTriangle } from 'lucide-react-native';
import ScreenContainer from '@/components/ScreenContainer';
import Button from '@/components/Button';
import useSalesStore from '@/store/sales-store';
import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';

type FilterType = 'all' | 'supply' | 'factory';

export default function SaleHistoryScreen() {
  const { history } = useSalesStore();
  
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');

  const filteredHistory = history.filter(sale => {
    if (filterType !== 'all' && sale.type !== filterType) return false;
    if (selectedDate && !sale.date.startsWith(selectedDate)) return false;
    return true;
  });

  const groupedHistory = filteredHistory.reduce((groups, sale) => {
    const date = new Date(sale.date).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(sale);
    return groups;
  }, {} as Record<string, typeof filteredHistory>);

  const getDaySummary = (sales: typeof filteredHistory) => {
    const totalBags = sales.reduce((sum, sale) => {
      return sum + sale.bagsTaken;
    }, 0);
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.revenue, 0);
    const totalLeakages = sales.reduce((sum, sale) => sum + sale.leakages, 0);
    const totalReturns = sales.reduce((sum, sale) => sum + (sale.bagsReturned || 0), 0);
    
    return { totalBags, totalRevenue, totalLeakages, totalReturns };
  };

  const getUniqueDate = (dateString: string) => {
    return dateString.split('T')[0];
  };

  const uniqueDates = [...new Set(history.map(sale => getUniqueDate(sale.date)))].sort().reverse();

  // Convert grouped history to array for FlatList
  const groupedHistoryArray = Object.entries(groupedHistory)
    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
    .map(([date, sales]) => ({
      date,
      sales,
      summary: getDaySummary(sales)
    }));

  const renderDayGroup = ({ item }: { item: { date: string, sales: typeof filteredHistory, summary: ReturnType<typeof getDaySummary> } }) => {
    return (
      <View style={styles.dayGroup}>
        <View style={styles.dayHeader}>
          <View style={styles.dayInfo}>
            <Calendar size={20} color={Colors.primary} />
            <Text style={styles.dayDate}>
              {new Date(item.date).toLocaleDateString([], { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>
          <Text style={styles.dayCount}>{item.sales.length} sales</Text>
        </View>

        <View style={styles.daySummary}>
          <View style={styles.summaryStats}>
            <View style={styles.summaryStat}>
              <Package size={16} color={Colors.primary} />
              <Text style={styles.summaryStatText}>{item.summary.totalBags} bags</Text>
            </View>
            <View style={styles.summaryStat}>
              <DollarSign size={16} color={Colors.success} />
              <Text style={styles.summaryStatText}>GHS {item.summary.totalRevenue.toFixed(2)}</Text>
            </View>
            {item.summary.totalLeakages > 0 && (
              <View style={styles.summaryStat}>
                <AlertTriangle size={16} color={Colors.warning} />
                <Text style={styles.summaryStatText}>{item.summary.totalLeakages} leakages</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.salesList}>
          {item.sales.map((sale) => (
            <View key={sale.id} style={styles.saleCard}>
              <View style={styles.saleHeader}>
                <View style={styles.saleType}>
                  <View style={[
                    styles.saleTypeBadge,
                    { backgroundColor: sale.type === 'supply' ? Colors.primary + '20' : Colors.secondary + '20' }
                  ]}>
                    <Text style={[
                      styles.saleTypeBadgeText,
                      { color: sale.type === 'supply' ? Colors.primary : Colors.secondary }
                    ]}>
                      {sale.type === 'supply' ? 'Supply' : 'Factory'}
                    </Text>
                  </View>
                  {sale.supplierName && (
                    <Text style={styles.supplierName}>{sale.supplierName}</Text>
                  )}
                  {sale.tripNumber && (
                    <Text style={styles.tripNumber}>Trip #{sale.tripNumber}</Text>
                  )}
                </View>
                <Text style={styles.saleTime}>
                  {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>

              <View style={styles.saleDetails}>
                <View style={styles.saleStats}>
                  <View style={styles.saleStat}>
                    <Text style={styles.saleStatLabel}>Bags Taken</Text>
                    <Text style={styles.saleStatValue}>{sale.bagsTaken}</Text>
                  </View>
                  <View style={styles.saleStat}>
                    <Text style={styles.saleStatLabel}>Revenue</Text>
                    <Text style={styles.saleStatValue}>GHS {sale.revenue.toFixed(2)}</Text>
                  </View>
                  <View style={styles.saleStat}>
                    <Text style={styles.saleStatLabel}>Price/Bag</Text>
                    <Text style={styles.saleStatValue}>GHS {sale.pricePerBag.toFixed(2)}</Text>
                  </View>
                </View>

                {(sale.leakages > 0 || (sale.bagsReturned && sale.bagsReturned > 0)) && (
                  <View style={styles.saleAdjustments}>
                    {sale.leakages > 0 && (
                      <Text style={styles.adjustmentText}>
                        {sale.leakages} leakages handled
                      </Text>
                    )}
                    {sale.bagsReturned && sale.bagsReturned > 0 && sale.type === 'supply' && (
                      <Text style={styles.adjustmentText}>
                        {sale.bagsReturned} remaining bags deducted
                      </Text>
                    )}
                    {sale.bagsReturned && sale.bagsReturned > 0 && sale.type === 'factory' && (
                      <Text style={styles.adjustmentText}>
                        {sale.bagsReturned} bags returned
                      </Text>
                    )}
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Package size={48} color={Colors.textLight} />
      <Text style={styles.emptyText}>No sales history found</Text>
      <Text style={styles.emptySubtext}>
        {filterType !== 'all' || selectedDate 
          ? 'Try adjusting your filters' 
          : 'Sales will appear here once recorded'
        }
      </Text>
    </View>
  );

  const renderHeader = () => (
    <>
      <View style={styles.filterHeader}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={Colors.primary} />
          <Text style={styles.filterButtonText}>Filters</Text>
        </TouchableOpacity>
        
        {(filterType !== 'all' || selectedDate) && (
          <TouchableOpacity
            style={styles.clearFilters}
            onPress={() => {
              setFilterType('all');
              setSelectedDate('');
            }}
          >
            <Text style={styles.clearFiltersText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Panel */}
      {showFilters && (
        <View style={styles.filterPanel}>
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Sales Channel</Text>
            <View style={styles.filterOptions}>
              <Button
                title="All"
                onPress={() => setFilterType('all')}
                variant={filterType === 'all' ? 'primary' : 'outline'}
                size="small"
                style={styles.filterOption}
              />
              <Button
                title="Supply"
                onPress={() => setFilterType('supply')}
                variant={filterType === 'supply' ? 'primary' : 'outline'}
                size="small"
                style={styles.filterOption}
              />
              <Button
                title="Factory"
                onPress={() => setFilterType('factory')}
                variant={filterType === 'factory' ? 'primary' : 'outline'}
                size="small"
                style={styles.filterOption}
              />
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Date</Text>
            <View style={styles.dateOptions}>
              <Button
                title="All Dates"
                onPress={() => setSelectedDate('')}
                variant={selectedDate === '' ? 'primary' : 'outline'}
                size="small"
                style={styles.dateOption}
              />
              {uniqueDates.slice(0, 5).map((date) => (
                <Button
                  key={date}
                  title={new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  onPress={() => setSelectedDate(date)}
                  variant={selectedDate === date ? 'primary' : 'outline'}
                  size="small"
                  style={styles.dateOption}
                />
              ))}
            </View>
          </View>
        </View>
      )}
    </>
  );

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <FlatList
          data={groupedHistoryArray}
          renderItem={renderDayGroup}
          keyExtractor={item => item.date}
          contentContainerStyle={styles.historyContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          ListHeaderComponent={renderHeader}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.primary + '20',
    borderRadius: 8,
  },
  filterButtonText: {
    fontSize: Fonts.sizes.md,
    fontWeight: '500',
    color: Colors.primary,
  },
  clearFilters: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  clearFiltersText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.danger,
    fontWeight: '500',
  },
  filterPanel: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 16,
  },
  filterSection: {
    gap: 8,
  },
  filterLabel: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
    color: Colors.text,
  },
  filterOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  filterOption: {
    minWidth: 60,
  },
  dateOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dateOption: {
    minWidth: 80,
  },
  historyContainer: {
    padding: 16,
    gap: 24,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '600',
    color: Colors.textLight,
  },
  emptySubtext: {
    fontSize: Fonts.sizes.md,
    color: Colors.textLight,
    textAlign: 'center',
  },
  dayGroup: {
    gap: 12,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayDate: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  dayCount: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
  },
  daySummary: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  summaryStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  summaryStatText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '500',
    color: Colors.text,
  },
  salesList: {
    gap: 8,
  },
  saleCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  saleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  saleType: {
    flex: 1,
    gap: 4,
  },
  saleTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  saleTypeBadgeText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '600',
  },
  supplierName: {
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  tripNumber: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
  },
  saleTime: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
  },
  saleDetails: {
    gap: 8,
  },
  saleStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saleStat: {
    alignItems: 'center',
  },
  saleStatLabel: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    marginBottom: 2,
  },
  saleStatValue: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
    color: Colors.text,
  },
  saleAdjustments: {
    gap: 2,
  },
  adjustmentText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.warning,
  },
});