import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, TrendingUp, Package, AlertTriangle, BarChart3, Boxes } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import Card from '@/components/Card';
import Button from '@/components/Button';
import useProductionStore from '@/store/production-store';
import useInventoryStore from '@/store/inventory-store';

// Define types for the dashboard items
interface DashboardItem {
  id: string;
  type: 'summary' | 'capacity' | 'actions' | 'noProduction' | 'stock';
}

export default function ProductionScreen() {
  const router = useRouter();
  const { 
    getBagsInStock, 
    getTodayManualEntries, 
    getTodayRollsUsed,
    getTodayProduction,
    resetTodayProduction
  } = useProductionStore();
  const { rolls, packingBags } = useInventoryStore();

  // Check if we need to reset today's production (new day)
  useEffect(() => {
    const productionStore = useProductionStore.getState();
    const today = new Date().toDateString();
    const lastEntryDate = productionStore.productionRecords[0]
      ? new Date(productionStore.productionRecords[0].date).toDateString()
      : null;

    // If we have entries but none for today, reset today's production
    if (lastEntryDate && lastEntryDate !== today) {
      resetTodayProduction();
    }
  }, [resetTodayProduction]);

  // Get the latest production data
  const currentTodayProduction = getTodayProduction();
  const bagsInStock = getBagsInStock();
  const todayManualEntries = getTodayManualEntries();
  const todayRollsUsed = getTodayRollsUsed();

  const handleNewProduction = () => {
    router.push('/(tabs)/(production)/new');
  };

  const handleViewHistory = () => {
    router.push('/(tabs)/(production)/history');
  };

  const handleManageBags = () => {
    router.push('/(tabs)/(production)/manage-bags');
  };

  // Calculate if we have low inventory
  const isLowInventory = rolls.total < 50 || packingBags.total < 10;
  const canProduce = Math.min(
    Math.floor(rolls.estimatedBags / 100), // bundles from rolls
    packingBags.total // bundles from packing bags
  );

  // Calculate today's manual bag additions (only positive entries)
  // Only count entries that are not from supplier returns
  const todayManualBags = todayManualEntries.reduce((sum, entry) => {
    if (entry.quantity > 0 && !entry.source.startsWith('supplier_')) {
      return sum + entry.quantity;
    }
    return sum;
  }, 0);

  const renderItem = ({ item }: { item: DashboardItem }) => {
    if (item.type === 'summary') {
      return (
        <Card style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryTitleContainer}>
              <TrendingUp size={24} color={Colors.primary} />
              <Text style={styles.summaryTitle}>Today's Production</Text>
            </View>
            <TouchableOpacity 
              style={styles.historyButton}
              onPress={handleViewHistory}
            >
              <BarChart3 size={20} color={Colors.textLight} />
            </TouchableOpacity>
          </View>

          <View style={styles.productionStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{currentTodayProduction.bags}</Text>
              <Text style={styles.statLabel}>Bags Produced</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{currentTodayProduction.bundles}</Text>
              <Text style={styles.statLabel}>Bundles</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{todayRollsUsed}kg</Text>
              <Text style={styles.statLabel}>Rolls Used</Text>
            </View>
          </View>
        </Card>
      );
    }

    if (item.type === 'capacity') {
      return (
        <Card style={styles.capacityCard}>
          <View style={styles.capacityHeader}>
            <Package size={20} color={Colors.secondary} />
            <Text style={styles.capacityTitle}>Production Capacity</Text>
            {isLowInventory && (
              <View style={styles.warningBadge}>
                <AlertTriangle size={16} color={Colors.danger} />
              </View>
            )}
          </View>

          <View style={styles.capacityDetails}>
            <View style={styles.capacityRow}>
              <Text style={styles.capacityLabel}>Available Materials:</Text>
              <Text style={styles.capacityValue}>
                {rolls.total}kg rolls, {packingBags.total} bundles
              </Text>
            </View>

            <View style={styles.capacityRow}>
              <Text style={styles.capacityLabel}>Estimated Bags from Rolls:</Text>
              <Text style={styles.capacityValue}>{rolls.estimatedBags} bags</Text>
            </View>
          </View>

          {isLowInventory && (
            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>
                ⚠️ Low inventory detected. Consider restocking soon.
              </Text>
            </View>
          )}
        </Card>
      );
    }

    if (item.type === 'actions') {
      return (
        <View style={styles.actionsContainer}>
          <Button
            title="Assign Production"
            onPress={handleNewProduction}
            leftIcon={<Plus size={20} color="#fff" />}
            style={[styles.actionButton, styles.primaryAction]}
            disabled={canProduce === 0}
          />
          
          <Button
            title="View Production History"
            onPress={handleViewHistory}
            variant="outline"
            style={styles.actionButton}
            leftIcon={<BarChart3 size={20} color={Colors.primary} />}
          />
        </View>
      );
    }

    if (item.type === 'noProduction') {
      return canProduce === 0 ? (
        <Card style={styles.noProductionCard}>
          <Text style={styles.noProductionTitle}>Cannot Start Production</Text>
          <Text style={styles.noProductionText}>
            Insufficient materials available. Please update your inventory before starting production.
          </Text>
          <Button
            title="Update Inventory"
            onPress={() => router.push('/(tabs)/(inventory)/add')}
            variant="outline"
            style={styles.updateInventoryButton}
          />
        </Card>
      ) : null;
    }

    if (item.type === 'stock') {
      return (
        <View style={styles.floatingCardContainer}>
          <TouchableOpacity 
            style={styles.stockCard}
            onPress={handleManageBags}
          >
            <View style={styles.stockHeader}>
              <View style={styles.stockIconContainer}>
                <Boxes size={20} color={Colors.accent} />
              </View>
              <View style={styles.stockInfo}>
                <Text style={styles.stockTitle}>Bags in Stock</Text>
                <Text style={styles.stockSubtitle}>Inventory Management</Text>
              </View>
              <View style={styles.stockValueContainer}>
                <Text style={styles.stockValue}>{bagsInStock.total}</Text>
                <Text style={styles.stockUnit}>bags</Text>
              </View>
            </View>

            <View style={styles.stockDetails}>
              <View style={styles.stockDetailRow}>
                <View style={styles.stockDetailItem}>
                  <Text style={styles.stockDetailValue}>{bagsInStock.production}</Text>
                  <Text style={styles.stockDetailLabel}>Production</Text>
                </View>
                <View style={styles.stockDetailItem}>
                  <Text style={styles.stockDetailValue}>{bagsInStock.remaining}</Text>
                  <Text style={styles.stockDetailLabel}>Returned</Text>
                </View>
                <View style={styles.stockDetailItem}>
                  <Text style={[styles.stockDetailValue, { color: Colors.accent }]}>{bagsInStock.manual}</Text>
                  <Text style={styles.stockDetailLabel}>Manual</Text>
                </View>
              </View>

              {todayManualBags > 0 && (
                <View style={styles.todayManualContainer}>
                  <Text style={styles.todayManualLabel}>Today's Manual:</Text>
                  <Text style={styles.todayManualValue}>
                    +{todayManualBags} bags
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  const data: DashboardItem[] = [
    { id: 'summary', type: 'summary' },
    { id: 'capacity', type: 'capacity' },
    { id: 'actions', type: 'actions' },
    { id: 'noProduction', type: 'noProduction' },
    { id: 'stock', type: 'stock' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  summaryCard: {
    marginBottom: 24,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  historyButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
  productionStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  capacityCard: {
    marginBottom: 16,
  },
  capacityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  capacityTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  warningBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.danger + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  capacityDetails: {
    gap: 12,
  },
  capacityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  capacityLabel: {
    fontSize: Fonts.sizes.md,
    color: Colors.textLight,
    flex: 1,
  },
  capacityValue: {
    fontSize: Fonts.sizes.md,
    fontWeight: '500',
    color: Colors.text,
    textAlign: 'right',
  },
  warningContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: Colors.danger + '10',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.danger + '20',
  },
  warningText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.danger,
    textAlign: 'center',
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    width: '100%',
  },
  primaryAction: {
    backgroundColor: Colors.primary,
  },
  noProductionCard: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 24,
  },
  noProductionTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  noProductionText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  updateInventoryButton: {
    borderColor: Colors.primary,
  },
  // Floating card styling to visually separate it from production section
  floatingCardContainer: {
    marginBottom: 16,
    marginHorizontal: -8, // Make it slightly wider than other cards
    elevation: 8, // Add elevation for Android
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  stockCard: {
    backgroundColor: Colors.accent + '08',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.accent + '20',
  },
  stockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stockIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accent + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stockInfo: {
    flex: 1,
  },
  stockTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  stockSubtitle: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    fontWeight: '500',
  },
  stockValueContainer: {
    alignItems: 'flex-end',
  },
  stockValue: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: '800',
    color: Colors.accent,
    lineHeight: 32,
  },
  stockUnit: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    fontWeight: '500',
  },
  stockDetails: {
    gap: 12,
  },
  stockDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.accent + '20',
  },
  stockDetailItem: {
    alignItems: 'center',
  },
  stockDetailValue: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  stockDetailLabel: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    fontWeight: '500',
  },
  todayManualContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.accent + '15',
  },
  todayManualLabel: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    fontWeight: '500',
  },
  todayManualValue: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
    color: Colors.success,
  },
});