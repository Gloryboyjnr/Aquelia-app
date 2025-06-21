import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, FlatList } from 'react-native';
import { Truck, Store, Package, AlertTriangle, X, FileText, BarChart } from 'lucide-react-native';
import ScreenContainer from '@/components/ScreenContainer';
import Input from '@/components/Input';
import useSalesStore from '@/store/sales-store';
import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';

type RecordType = 'supplier' | 'factory';

// Define types for supplier and trip data
interface Trip {
  id: string;
  date: string;
  bagsTaken: number;
  leakages: number;
  revenue: number;
  pricePerBag: number;
  bagsReturned?: number;
  notes?: string;
  tripNumber?: number;
}

interface Supplier {
  name: string;
  trips: Trip[];
  totalBags: number;
  totalRevenue: number;
  totalLeakages: number;
  isClosed: boolean;
}

// Define type for factory sale
interface FactorySale {
  id: string;
  date: string;
  bagsTaken: number;
  leakages: number;
  revenue: number;
  pricePerBag: number;
  notes?: string;
}

export default function SaleRecordsScreen() {
  const { 
    getTodaySupplierRecords, 
    getTodayFactoryRecords, 
    closeSalesForSupplier, 
    closeFactorySales, 
    getTodayFactorySales,
    isFactorySalesClosed
  } = useSalesStore();
  
  const [activeTab, setActiveTab] = useState<RecordType>('supplier');
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showFactorySummaryModal, setShowFactorySummaryModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [remainingBags, setRemainingBags] = useState('0');
  const [finalTripLeakages, setFinalTripLeakages] = useState('0');
  
  const supplierRecords = getTodaySupplierRecords();
  const factoryRecords = getTodayFactoryRecords();
  const factorySummary = getTodayFactorySales();

  const handleCloseSupplierSales = (supplierName: string) => {
    const supplier = supplierRecords.find(s => s.name === supplierName);
    
    if (!supplier) {
      Alert.alert('Error', 'Supplier not found');
      return;
    }

    if (supplier.trips.length === 0) {
      Alert.alert('Error', 'No trips found for this supplier');
      return;
    }
    
    // Check if supplier is already closed
    if (supplier.isClosed) {
      Alert.alert('Already Closed', 'Sales for this supplier have already been closed for today.');
      return;
    }

    setSelectedSupplier(supplierName);
    setRemainingBags('0');
    setFinalTripLeakages('0');
    setShowCloseModal(true);
  };

  const confirmCloseSales = (supplierName: string, remainingBagsNum: number, finalTripLeakagesNum: number) => {
    const supplier = supplierRecords.find(s => s.name === supplierName);
    // Sort trips in ascending order by trip number (earliest first)
    const sortedTrips = supplier?.trips.sort((a: Trip, b: Trip) => (a.tripNumber || 0) - (b.tripNumber || 0)) || [];
    // Get the final trip (last in sorted array)
    const finalTrip = sortedTrips.length > 0 ? sortedTrips[sortedTrips.length - 1] : null;
    
    if (!finalTrip) {
      Alert.alert('Error', 'Final trip not found');
      return;
    }

    const totalDeductions = (remainingBagsNum + finalTripLeakagesNum) * finalTrip.pricePerBag;

    const message = totalDeductions > 0 
      ? `Close all sales for ${supplierName}?

This will terminate all trips for this supplier today.

Final trip deductions:
• Remaining bags: ${remainingBagsNum} bags
• Final trip leakages: ${finalTripLeakagesNum} bags

Total deduction from final trip: ₵${totalDeductions.toFixed(2)}`
      : `Close all sales for ${supplierName}?

This will terminate all trips for this supplier today.
No deductions will be applied to the final trip.`;

    Alert.alert(
      'Confirm Close Sales',
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Close', 
          style: 'destructive',
          onPress: () => {
            try {
              closeSalesForSupplier(supplierName, remainingBagsNum, finalTripLeakagesNum);
              Alert.alert('Success', `All sales closed for ${supplierName}${totalDeductions > 0 ? `. ₵${totalDeductions.toFixed(2)} deducted from final trip revenue.` : ''}`);
              setShowCloseModal(false);
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to close sales');
            }
          }
        }
      ]
    );
  };

  const handleCloseFactorySales = () => {
    Alert.alert(
      'Close Factory Sales',
      'Are you sure you want to close all factory sales for today? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Close', 
          style: 'destructive',
          onPress: () => {
            try {
              const result = closeFactorySales();
              setShowFactorySummaryModal(true);
            } catch (error) {
              console.error('Error closing factory sales:', error);
              Alert.alert('Error', 'Failed to close factory sales. Please try again.');
            }
          }
        }
      ]
    );
  };

  const renderCloseModal = () => {
    if (!showCloseModal) return null;

    const supplier = supplierRecords.find(s => s.name === selectedSupplier);
    // Sort trips in ascending order by trip number (earliest first)
    const sortedTrips = supplier?.trips.sort((a: Trip, b: Trip) => (a.tripNumber || 0) - (b.tripNumber || 0)) || [];
    // Get the final trip (last in sorted array)
    const finalTrip = sortedTrips.length > 0 ? sortedTrips[sortedTrips.length - 1] : null;

    return (
      <Modal
        visible={showCloseModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCloseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Close Sales for {selectedSupplier}</Text>
            
            <Text style={styles.modalSubtitle}>This will terminate all trips for this supplier today.</Text>
            
            {finalTrip && (
              <View style={styles.finalTripInfo}>
                <Text style={styles.finalTripTitle}>Final Trip #{finalTrip.tripNumber || 'N/A'}</Text>
                <Text style={styles.finalTripDetails}>
                  {finalTrip.bagsTaken} bags taken • {finalTrip.leakages} leakages handled
                </Text>
                <Text style={styles.finalTripRevenue}>
                  Current revenue: ₵{finalTrip.revenue.toFixed(2)}
                </Text>
              </View>
            )}
            
            <Text style={styles.modalSubtitle}>Enter any remaining bags and additional leakages from the final trip:</Text>
            
            <Input
              label="Remaining Bags from Final Trip"
              value={remainingBags}
              onChangeText={setRemainingBags}
              keyboardType="numeric"
              placeholder="0"
              hint="Unsold bags from the final trip only"
            />

            <Input
              label="Additional Leakages from Final Trip"
              value={finalTripLeakages}
              onChangeText={setFinalTripLeakages}
              keyboardType="numeric"
              placeholder="0"
              hint="Additional leakages discovered from the final trip only"
            />

            <View style={styles.deductionPreview}>
              <Text style={styles.deductionText}>
                Final Trip Deduction: ₵{(
                  (parseInt(remainingBags) || 0) + (parseInt(finalTripLeakages) || 0)
                ) * (finalTrip?.pricePerBag || 2.00)}
              </Text>
              <Text style={styles.deductionSubtext}>
                ({parseInt(remainingBags) || 0} remaining + {parseInt(finalTripLeakages) || 0} additional leakages) × ₵{finalTrip?.pricePerBag.toFixed(2) || '2.00'}
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setShowCloseModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]} 
                onPress={() => confirmCloseSales(
                  selectedSupplier, 
                  parseInt(remainingBags) || 0, 
                  parseInt(finalTripLeakages) || 0
                )}
              >
                <Text style={styles.confirmButtonText}>Close Sales</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderFactorySummaryModal = () => {
    if (!showFactorySummaryModal) return null;

    return (
      <Modal
        visible={showFactorySummaryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFactorySummaryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Factory Sales Summary</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowFactorySummaryModal(false)}
              >
                <X size={24} color={Colors.textLight} />
              </TouchableOpacity>
            </View>

            <View style={styles.summaryContainer}>
              <View style={styles.summaryIconContainer}>
                <BarChart size={48} color={Colors.primary} />
              </View>
              
              <Text style={styles.summaryHeading}>Today's Factory Sales</Text>
              
              <View style={styles.summaryStats}>
                <View style={styles.summaryStat}>
                  <Text style={styles.summaryStatLabel}>Total Bags Sold</Text>
                  <Text style={styles.summaryStatValue}>{factorySummary.bags}</Text>
                </View>
                
                <View style={styles.summaryStat}>
                  <Text style={styles.summaryStatLabel}>Total Revenue</Text>
                  <Text style={styles.summaryStatValue}>₵{factorySummary.revenue.toFixed(2)}</Text>
                </View>
                
                <View style={styles.summaryStat}>
                  <Text style={styles.summaryStatLabel}>Total Transactions</Text>
                  <Text style={styles.summaryStatValue}>{factorySummary.transactions}</Text>
                </View>
              </View>
              
              <View style={styles.summaryMessage}>
                <Text style={styles.summaryMessageText}>
                  All factory sales have been closed for today. You can continue to view the records, but no new sales can be added.
                </Text>
              </View>
              
              <TouchableOpacity
                style={styles.summaryCloseButton}
                onPress={() => setShowFactorySummaryModal(false)}
              >
                <Text style={styles.summaryCloseButtonText}>Close Summary</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderSupplierItem = ({ item }: { item: Supplier }) => {
    return (
      <View key={item.name} style={styles.supplierCard}>
        <View style={styles.supplierHeader}>
          <View style={styles.supplierInfo}>
            <Text style={styles.supplierName}>{item.name}</Text>
            <Text style={styles.supplierStats}>
              {item.trips.length} trips • {item.totalBags} bags • ₵{item.totalRevenue.toFixed(2)}
            </Text>
            {item.totalLeakages > 0 && (
              <Text style={styles.leakagesWarning}>
                Total leakages: {item.totalLeakages} bags
              </Text>
            )}
          </View>
          {!item.isClosed ? (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => handleCloseSupplierSales(item.name)}
            >
              <X size={20} color={Colors.danger} />
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.closedBadge}>
              <Text style={styles.closedBadgeText}>Closed</Text>
            </View>
          )}
        </View>

        <FlatList
          data={item.trips.sort((a: Trip, b: Trip) => (a.tripNumber || 0) - (b.tripNumber || 0))}
          keyExtractor={(trip) => trip.id}
          scrollEnabled={false}
          renderItem={({ item: trip }) => (
            <View style={styles.tripCard}>
              <View style={styles.tripHeader}>
                <Text style={styles.tripNumber}>Trip #{trip.tripNumber || 'N/A'}</Text>
                <Text style={styles.tripTime}>
                  {new Date(trip.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              
              <View style={styles.tripDetails}>
                <View style={styles.tripStat}>
                  <Package size={16} color={Colors.primary} />
                  <Text style={styles.tripStatText}>{trip.bagsTaken} new bags</Text>
                </View>
                
                {trip.leakages > 0 && (
                  <View style={styles.tripStat}>
                    <AlertTriangle size={16} color={Colors.warning} />
                    <Text style={styles.tripStatText}>{trip.leakages} leakages handled</Text>
                  </View>
                )}
                
                <View style={styles.tripStat}>
                  <Text style={styles.tripStatText}>₵{trip.revenue.toFixed(2)}</Text>
                </View>

                {(trip.bagsReturned !== undefined && trip.bagsReturned > 0) && (
                  <View style={styles.tripStat}>
                    <AlertTriangle size={16} color={Colors.danger} />
                    <Text style={styles.tripStatText}>{trip.bagsReturned} remaining bags deducted</Text>
                  </View>
                )}

                {trip.notes && (
                  <View style={styles.tripNotes}>
                    <Text style={styles.tripNotesText}>{trip.notes}</Text>
                  </View>
                )}
              </View>
            </View>
          )}
          style={styles.tripsContainer}
        />

        <View style={styles.supplierSummary}>
          <Text style={styles.summaryText}>
            Total Revenue: ₵{item.totalRevenue.toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };

  const renderEmptySupplierList = () => (
    <View style={styles.emptyState}>
      <Truck size={48} color={Colors.textLight} />
      <Text style={styles.emptyText}>No supplier sales recorded today</Text>
    </View>
  );

  const renderFactoryItem = ({ item }: { item: FactorySale }) => (
    <View key={item.id} style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <Text style={styles.transactionTime}>
          {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
        <Text style={styles.transactionRevenue}>₵{item.revenue.toFixed(2)}</Text>
      </View>
      
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionDetail}>
          {item.bagsTaken} bags @ ₵{item.pricePerBag.toFixed(2)} each
        </Text>
        {item.leakages > 0 && (
          <Text style={styles.transactionLeakage}>
            {item.leakages} leakages handled
          </Text>
        )}
        {item.notes && (
          <View style={styles.transactionNotes}>
            <FileText size={14} color={Colors.textLight} />
            <Text style={styles.transactionNotesText}>{item.notes}</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderEmptyFactoryList = () => (
    <View style={styles.emptyState}>
      <Store size={48} color={Colors.textLight} />
      <Text style={styles.emptyText}>No factory sales recorded today</Text>
    </View>
  );

  const renderFactorySummaryHeader = () => {
    const totalBags = factoryRecords.reduce((sum, sale) => sum + sale.bagsTaken, 0);
    const totalRevenue = factoryRecords.reduce((sum, sale) => sum + sale.revenue, 0);
    const totalLeakages = factoryRecords.reduce((sum, sale) => sum + sale.leakages, 0);

    return (
      <View style={styles.factorySummaryCard}>
        <View style={styles.factoryHeader}>
          <Text style={styles.factoryTitle}>Factory Sales Summary</Text>
          {!isFactorySalesClosed ? (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCloseFactorySales}
            >
              <X size={20} color={Colors.danger} />
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.closedBadge}>
              <Text style={styles.closedBadgeText}>Closed</Text>
            </View>
          )}
        </View>
        
        <View style={styles.factoryStats}>
          <View style={styles.factoryStat}>
            <Package size={20} color={Colors.primary} />
            <Text style={styles.factoryStatValue}>{totalBags}</Text>
            <Text style={styles.factoryStatLabel}>Bags Sold</Text>
          </View>
          
          <View style={styles.factoryStat}>
            <Text style={styles.factoryStatValue}>₵{totalRevenue.toFixed(2)}</Text>
            <Text style={styles.factoryStatLabel}>Revenue</Text>
          </View>
          
          <View style={styles.factoryStat}>
            <AlertTriangle size={20} color={Colors.warning} />
            <Text style={styles.factoryStatValue}>{totalLeakages}</Text>
            <Text style={styles.factoryStatLabel}>Leakages</Text>
          </View>
        </View>

        {isFactorySalesClosed && (
          <View style={styles.closedMessage}>
            <Text style={styles.closedMessageText}>
              Factory sales have been closed for today. No new sales can be added until tomorrow.
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderFactoryListHeader = () => (
    <>
      {renderFactorySummaryHeader()}
      <Text style={styles.transactionsTitle}>Individual Transactions</Text>
    </>
  );

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'supplier' && styles.activeTab]}
            onPress={() => setActiveTab('supplier')}
          >
            <Truck size={20} color={activeTab === 'supplier' ? Colors.primary : Colors.textLight} />
            <Text style={[styles.tabText, activeTab === 'supplier' && styles.activeTabText]}>
              Supplier Sales
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'factory' && styles.activeTab]}
            onPress={() => setActiveTab('factory')}
          >
            <Store size={20} color={activeTab === 'factory' ? Colors.primary : Colors.textLight} />
            <Text style={[styles.tabText, activeTab === 'factory' && styles.activeTabText]}>
              Factory Sales
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'supplier' ? (
          <FlatList
            data={supplierRecords}
            keyExtractor={(item) => item.name}
            renderItem={renderSupplierItem}
            ListEmptyComponent={renderEmptySupplierList}
            contentContainerStyle={styles.recordsContainer}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <FlatList
            data={factoryRecords}
            keyExtractor={(item) => item.id}
            renderItem={renderFactoryItem}
            ListEmptyComponent={renderEmptyFactoryList}
            ListHeaderComponent={factoryRecords.length > 0 ? renderFactoryListHeader : null}
            contentContainerStyle={styles.recordsContainer}
            showsVerticalScrollIndicator={false}
          />
        )}

        {renderCloseModal()}
        {renderFactorySummaryModal()}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: Colors.background,
  },
  tabText: {
    fontSize: Fonts.sizes.md,
    fontWeight: '500',
    color: Colors.textLight,
  },
  activeTabText: {
    color: Colors.primary,
  },
  recordsContainer: {
    flexGrow: 1,
    paddingBottom: 20,
    gap: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textLight,
  },
  supplierCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  supplierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  supplierInfo: {
    flex: 1,
  },
  supplierName: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  supplierStats: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    marginBottom: 4,
  },
  leakagesWarning: {
    fontSize: Fonts.sizes.sm,
    color: Colors.warning,
    fontWeight: '500',
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.danger + '20',
  },
  closeButtonText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '500',
    color: Colors.danger,
  },
  closedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.success + '20',
  },
  closedBadgeText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
    color: Colors.success,
  },
  tripsContainer: {
    marginBottom: 16,
  },
  tripCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripNumber: {
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  tripTime: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
  },
  tripDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tripStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tripStatText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
  },
  tripNotes: {
    width: '100%',
    marginTop: 8,
    padding: 8,
    backgroundColor: Colors.primary + '10',
    borderRadius: 6,
  },
  tripNotesText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.primary,
    fontStyle: 'italic',
  },
  supplierSummary: {
    backgroundColor: Colors.primary + '10',
    padding: 12,
    borderRadius: 8,
  },
  summaryText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.primary,
    textAlign: 'center',
  },
  factorySummaryCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  factoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  factoryTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  closedMessage: {
    marginTop: 16,
    padding: 12,
    backgroundColor: Colors.success + '10',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.success + '20',
  },
  closedMessageText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.success,
    textAlign: 'center',
  },
  factoryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  factoryStat: {
    alignItems: 'center',
    gap: 8,
  },
  factoryStatValue: {
    fontSize: Fonts.sizes.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  factoryStatLabel: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
  },
  transactionsTitle: {
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  transactionCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionTime: {
    fontSize: Fonts.sizes.md,
    fontWeight: '500',
    color: Colors.text,
  },
  transactionRevenue: {
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: Colors.success,
  },
  transactionDetails: {
    gap: 4,
  },
  transactionDetail: {
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
  },
  transactionLeakage: {
    fontSize: Fonts.sizes.sm,
    color: Colors.danger,
  },
  transactionNotes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  transactionNotesText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    margin: 20,
    maxWidth: 400,
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: Fonts.sizes.md,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 12,
  },
  finalTripInfo: {
    backgroundColor: Colors.primary + '10',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  finalTripTitle: {
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'center',
  },
  finalTripDetails: {
    fontSize: Fonts.sizes.sm,
    color: Colors.primary,
    textAlign: 'center',
    marginTop: 4,
  },
  finalTripRevenue: {
    fontSize: Fonts.sizes.sm,
    color: Colors.primary,
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
  deductionPreview: {
    backgroundColor: Colors.danger + '20',
    padding: 12,
    borderRadius: 8,
    marginVertical: 16,
  },
  deductionText: {
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: Colors.danger,
    textAlign: 'center',
  },
  deductionSubtext: {
    fontSize: Fonts.sizes.sm,
    color: Colors.danger,
    textAlign: 'center',
    marginTop: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.textLight + '20',
  },
  confirmButton: {
    backgroundColor: Colors.danger,
  },
  cancelButtonText: {
    fontSize: Fonts.sizes.md,
    fontWeight: '500',
    color: Colors.textLight,
  },
  confirmButtonText: {
    fontSize: Fonts.sizes.md,
    fontWeight: '500',
    color: '#fff',
  },
  // Factory summary modal styles
  summaryContainer: {
    alignItems: 'center',
  },
  summaryIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryHeading: {
    fontSize: Fonts.sizes.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  summaryStats: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  summaryStat: {
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryStatLabel: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    marginBottom: 4,
  },
  summaryStatValue: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  summaryMessage: {
    backgroundColor: Colors.success + '10',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.success + '30',
  },
  summaryMessageText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.success,
    textAlign: 'center',
    lineHeight: 20,
  },
  summaryCloseButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  summaryCloseButtonText: {
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: '#fff',
  },
});