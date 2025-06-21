import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Plus, TrendingUp, Package, AlertTriangle } from 'lucide-react-native';
import ScreenContainer from '@/components/ScreenContainer';
import DashboardCard from '@/components/DashboardCard';
import Button from '@/components/Button';
import useSalesStore from '@/store/sales-store';
import useProductionStore from '@/store/production-store';
import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';

// Define types for the dashboard items
interface DashboardItem {
  id: string;
  type: 'summary' | 'stockInfo' | 'breakdown' | 'actions' | 'info';
}

export default function SalesScreen() {
  const { 
    todaySales, 
    getTodaySupplierSales, 
    getTodayFactorySales, 
    isFactorySalesClosed
  } = useSalesStore();
  const { getBagsInStock } = useProductionStore();

  const [supplierSales, setSupplierSales] = useState({ bags: 0, revenue: 0, trips: 0 });
  const [factorySales, setFactorySales] = useState({ bags: 0, revenue: 0, transactions: 0 });
  const [bagsInStock, setBagsInStock] = useState(getBagsInStock());

  // Refresh data periodically
  useEffect(() => {
    const updateData = () => {
      const supplierData = getTodaySupplierSales();
      const factoryData = getTodayFactorySales();
      setSupplierSales(supplierData);
      setFactorySales(factoryData);
      setBagsInStock(getBagsInStock());
    };

    // Initial update
    updateData();

    // Set up an interval to update data every 2 seconds
    const intervalId = setInterval(updateData, 2000);

    return () => clearInterval(intervalId);
  }, [getTodaySupplierSales, getTodayFactorySales, getBagsInStock]);

  const handleNewSale = () => {
    router.push('/(tabs)/(sales)/new');
  };

  const handleViewRecords = () => {
    router.push('/(tabs)/(sales)/records');
  };

  const handleViewHistory = () => {
    router.push('/(tabs)/(sales)/history');
  };

  const renderItem = ({ item }: { item: DashboardItem }) => {
    if (item.type === 'summary') {
      return (
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Today's Sales Summary</Text>
          <View style={styles.summaryGrid}>
            <DashboardCard
              title="Bags Sold"
              value={todaySales.bags.toString()}
              icon={<Package size={20} color={Colors.primary} />}
              subtitle="Bags dispatched today"
              valueColor={Colors.text}
            />
            <DashboardCard
              title="Leakages"
              value={todaySales.leakages.toString()}
              icon={<AlertTriangle size={20} color={Colors.warning} />}
              subtitle="Exchanged today"
            />
          </View>
        </View>
      );
    }

    if (item.type === 'stockInfo') {
      return (
        <View style={styles.stockInfoSection}>
          <View style={styles.stockInfoCard}>
            <View style={styles.stockInfoHeader}>
              <Package size={18} color={Colors.accent} />
              <Text style={styles.stockInfoTitle}>Bags Available in Stock</Text>
            </View>
            <Text style={styles.stockInfoValue}>{bagsInStock.total} bags</Text>
            <Text style={styles.stockInfoSubtitle}>
              {bagsInStock.production} from production • {bagsInStock.manual} manual entries
            </Text>
            {bagsInStock.total <= 50 && (
              <Text style={styles.lowStockWarning}>
                Low stock! Please produce more bags.
              </Text>
            )}
          </View>
        </View>
      );
    }

    if (item.type === 'breakdown') {
      return (
        <View style={styles.breakdownSection}>
          <Text style={styles.sectionTitle}>Sales Breakdown</Text>
          <View style={styles.breakdownGrid}>
            <View style={styles.breakdownCard}>
              <View style={styles.breakdownHeader}>
                <Text style={styles.breakdownTitle}>Supplier Sales</Text>
                <View style={styles.breakdownBadge}>
                  <Text style={styles.breakdownBadgeText}>{supplierSales.trips} trips</Text>
                </View>
              </View>
              <Text style={styles.breakdownValue}>{supplierSales.bags} bags</Text>
              <Text style={styles.breakdownRevenue}>₵{supplierSales.revenue.toFixed(2)}</Text>
              <Text style={styles.breakdownNote}>Revenue from bags taken</Text>
            </View>

            <View style={styles.breakdownCard}>
              <View style={styles.breakdownHeader}>
                <Text style={styles.breakdownTitle}>Factory Sales</Text>
                <View style={styles.breakdownBadge}>
                  <Text style={styles.breakdownBadgeText}>{factorySales.transactions} sales</Text>
                </View>
                {isFactorySalesClosed && (
                  <View style={styles.closedBadge}>
                    <Text style={styles.closedBadgeText}>Closed</Text>
                  </View>
                )}
              </View>
              <Text style={styles.breakdownValue}>{factorySales.bags} bags</Text>
              <Text style={styles.breakdownRevenue}>₵{factorySales.revenue.toFixed(2)}</Text>
              <Text style={styles.breakdownNote}>Direct sales revenue</Text>
            </View>
          </View>
        </View>
      );
    }

    if (item.type === 'actions') {
      return (
        <View style={styles.actionsSection}>
          <Button
            title="Enter New Sale"
            onPress={handleNewSale}
            leftIcon={<Plus size={20} color="#fff" />}
            style={styles.primaryButton}
            disabled={bagsInStock.total <= 0}
          />
          
          {bagsInStock.total <= 0 && (
            <Text style={styles.noStockWarning}>
              No bags available in stock. Please produce more bags before recording sales.
            </Text>
          )}
          
          <View style={styles.secondaryActions}>
            <TouchableOpacity style={styles.actionCard} onPress={handleViewRecords}>
              <View style={styles.actionIcon}>
                <Package size={20} color={Colors.primary} />
              </View>
              <Text style={styles.actionTitle}>Sale Records</Text>
              <Text style={styles.actionSubtitle}>View today's records</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={handleViewHistory}>
              <View style={styles.actionIcon}>
                <TrendingUp size={20} color={Colors.secondary} />
              </View>
              <Text style={styles.actionTitle}>Sale History</Text>
              <Text style={styles.actionSubtitle}>Past sales data</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (item.type === 'info') {
      return (
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Sales Revenue Calculation</Text>
            <View style={styles.infoPoints}>
              <Text style={styles.infoPoint}>• Revenue = Bags taken × Price per bag</Text>
              <Text style={styles.infoPoint}>• Leakages are tracked for inventory adjustments</Text>
              <Text style={styles.infoPoint}>• Final deductions applied when closing supplier sales</Text>
              <Text style={styles.infoPoint}>• Bags are automatically deducted from stock when sales are recorded</Text>
            </View>
          </View>
        </View>
      );
    }

    return null;
  };

  const data: DashboardItem[] = [
    { id: 'summary', type: 'summary' },
    { id: 'stockInfo', type: 'stockInfo' },
    { id: 'breakdown', type: 'breakdown' },
    { id: 'actions', type: 'actions' },
    { id: 'info', type: 'info' },
  ];

  return (
    <ScreenContainer>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  summarySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  stockInfoSection: {
    marginBottom: 24,
  },
  stockInfoCard: {
    backgroundColor: Colors.accent + '08',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.accent + '20',
  },
  stockInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  stockInfoTitle: {
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  stockInfoValue: {
    fontSize: Fonts.sizes.xl,
    fontWeight: '700',
    color: Colors.accent,
    marginBottom: 4,
  },
  stockInfoSubtitle: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
  },
  lowStockWarning: {
    fontSize: Fonts.sizes.sm,
    color: Colors.danger,
    fontWeight: '500',
    marginTop: 8,
  },
  breakdownSection: {
    marginBottom: 24,
  },
  breakdownGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  breakdownCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 140,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  breakdownTitle: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '500',
    color: Colors.textLight,
    flex: 1,
    marginRight: 8,
  },
  breakdownBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    flexShrink: 0,
  },
  breakdownBadgeText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '500',
    color: Colors.primary,
  },
  closedBadge: {
    backgroundColor: Colors.success + '20',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    flexShrink: 0,
    marginLeft: 8,
  },
  closedBadgeText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '500',
    color: Colors.success,
  },
  breakdownValue: {
    fontSize: Fonts.sizes.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
    lineHeight: 28,
  },
  breakdownRevenue: {
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: Colors.success,
    marginBottom: 4,
    lineHeight: 20,
  },
  breakdownNote: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  actionsSection: {
    gap: 16,
    marginBottom: 24,
  },
  primaryButton: {
    marginBottom: 8,
  },
  noStockWarning: {
    fontSize: Fonts.sizes.sm,
    color: Colors.danger,
    textAlign: 'center',
    marginBottom: 8,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    textAlign: 'center',
  },
  infoSection: {
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: Colors.primary + '10',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  infoTitle: {
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 12,
  },
  infoPoints: {
    gap: 6,
  },
  infoPoint: {
    fontSize: Fonts.sizes.sm,
    color: Colors.primary,
    lineHeight: 20,
  },
});