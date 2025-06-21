import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Truck, Store, User } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import Button from '@/components/Button';
import Input from '@/components/Input';
import useSalesStore from '@/store/sales-store';
import useProductionStore from '@/store/production-store';
import useAuthStore from '@/store/auth-store';

type SaleType = 'supply' | 'factory';

export default function NewSaleScreen() {
  const router = useRouter();
  const { suppliers, addSale, getNextTripNumber, isFactorySalesClosed, setError } = useSalesStore();
  const { getBagsInStock } = useProductionStore();
  const { getEmployeesByDepartment } = useAuthStore();
  
  const [saleType, setSaleType] = useState<SaleType>('supply');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [bagsTaken, setBagsTaken] = useState('');
  const [pricePerBag, setPricePerBag] = useState('2.00');
  const [leakages, setLeakages] = useState('0');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [employeeSuppliers, setEmployeeSuppliers] = useState<{name: string, id: string}[]>([]);

  const bagsInStock = getBagsInStock();

  // Get employees from sales department to use as suppliers
  useEffect(() => {
    // Get employees from sales department
    const salesEmployees = getEmployeesByDepartment('sales');
    
    // Map employees to a format suitable for suppliers
    const mappedEmployees = salesEmployees.map(employee => ({
      name: employee.fullName,
      id: employee.id
    }));
    
    setEmployeeSuppliers(mappedEmployees);
  }, [getEmployeesByDepartment]);

  // Combine predefined suppliers with employee suppliers
  const allSuppliers = [
    ...suppliers.map(supplier => ({ name: supplier, id: supplier })),
    ...employeeSuppliers
  ];

  const handleSave = async () => {
    // Clear any previous errors
    setError(null);
    
    // Validation
    if (!bagsTaken || parseInt(bagsTaken) <= 0) {
      Alert.alert('Error', 'Please enter a valid number of bags taken');
      return;
    }

    if (!pricePerBag || parseFloat(pricePerBag) <= 0) {
      Alert.alert('Error', 'Please enter a valid price per bag');
      return;
    }

    if (saleType === 'supply' && !selectedSupplier) {
      Alert.alert('Error', 'Please select a supplier');
      return;
    }

    if (saleType === 'factory' && !customerName.trim()) {
      Alert.alert('Error', 'Please enter customer name');
      return;
    }

    if (saleType === 'factory' && isFactorySalesClosed) {
      Alert.alert('Error', 'Factory sales are closed for today');
      return;
    }

    // Check stock availability
    const requestedBags = parseInt(bagsTaken);
    if (requestedBags > bagsInStock.total) {
      Alert.alert(
        'Insufficient Stock', 
        `Not enough bags in stock. Only ${bagsInStock.total} bags available.`
      );
      return;
    }

    setIsLoading(true);

    try {
      const saleData = {
        type: saleType,
        bagsTaken: parseInt(bagsTaken),
        pricePerBag: parseFloat(pricePerBag),
        leakages: parseInt(leakages) || 0,
        notes: notes.trim(),
        ...(saleType === 'supply' 
          ? { 
              supplierName: selectedSupplier,
              tripNumber: getNextTripNumber(selectedSupplier)
            }
          : { customerName: customerName.trim() }
        )
      };

      addSale(saleData);

      Alert.alert(
        'Success', 
        `${saleType === 'supply' ? 'Supply' : 'Factory'} sale recorded successfully`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert(
        'Error', 
        error instanceof Error ? error.message : 'Failed to record sale'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderSupplierSelection = () => (
    <View style={styles.supplierSection}>
      <Text style={styles.sectionLabel}>Select Supplier</Text>
      <View style={styles.supplierGrid}>
        {allSuppliers.map((supplier) => (
          <TouchableOpacity
            key={supplier.id}
            style={[
              styles.supplierCard,
              selectedSupplier === supplier.name && styles.selectedSupplierCard
            ]}
            onPress={() => setSelectedSupplier(supplier.name)}
          >
            <View style={styles.supplierIconContainer}>
              {employeeSuppliers.some(emp => emp.id === supplier.id) ? (
                <User size={16} color={selectedSupplier === supplier.name ? Colors.primary : Colors.textLight} />
              ) : (
                <Truck size={16} color={selectedSupplier === supplier.name ? Colors.primary : Colors.textLight} />
              )}
            </View>
            <Text 
              style={[
                styles.supplierText,
                selectedSupplier === supplier.name && styles.selectedSupplierText
              ]}
              numberOfLines={1}
            >
              {supplier.name}
            </Text>
            {selectedSupplier === supplier.name && (
              <Text style={styles.tripNumberText}>
                Trip #{getNextTripNumber(supplier.name)}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'New Sale',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
        }} 
      />
      <StatusBar style="dark" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stock Information */}
        <View style={styles.stockInfo}>
          <Text style={styles.stockLabel}>Bags Available in Stock</Text>
          <Text style={styles.stockValue}>{bagsInStock.total} bags</Text>
          {bagsInStock.total <= 50 && (
            <Text style={styles.lowStockWarning}>
              Low stock warning! Consider producing more bags.
            </Text>
          )}
        </View>

        <View style={styles.typeSection}>
          <Text style={styles.sectionLabel}>Sale Type</Text>
          <View style={styles.typeButtons}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                saleType === 'supply' && styles.activeTypeButton
              ]}
              onPress={() => setSaleType('supply')}
            >
              <Truck size={20} color={saleType === 'supply' ? '#fff' : Colors.primary} />
              <Text style={[
                styles.typeButtonText,
                saleType === 'supply' && styles.activeTypeButtonText
              ]}>
                Supply Sale
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                saleType === 'factory' && styles.activeTypeButton,
                isFactorySalesClosed && styles.disabledTypeButton
              ]}
              onPress={() => !isFactorySalesClosed && setSaleType('factory')}
              disabled={isFactorySalesClosed}
            >
              <Store size={20} color={
                isFactorySalesClosed 
                  ? Colors.textLight 
                  : saleType === 'factory' ? '#fff' : Colors.secondary
              } />
              <Text style={[
                styles.typeButtonText,
                saleType === 'factory' && styles.activeTypeButtonText,
                isFactorySalesClosed && styles.disabledTypeButtonText
              ]}>
                Factory Sale
              </Text>
              {isFactorySalesClosed && (
                <Text style={styles.closedText}>Closed</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {saleType === 'supply' && renderSupplierSelection()}

        {saleType === 'factory' && (
          <Input
            label="Customer Name"
            value={customerName}
            onChangeText={setCustomerName}
            placeholder="Enter customer name"
            required
          />
        )}

        <View style={styles.formSection}>
          <Input
            label="Bags Taken"
            value={bagsTaken}
            onChangeText={setBagsTaken}
            placeholder="Enter number of bags"
            keyboardType="numeric"
            required
          />

          <Input
            label="Price per Bag (₵)"
            value={pricePerBag}
            onChangeText={setPricePerBag}
            placeholder="2.00"
            keyboardType="numeric"
            required
          />

          <Input
            label="Leakages Handled"
            value={leakages}
            onChangeText={setLeakages}
            placeholder="0"
            keyboardType="numeric"
            hint="Number of damaged bags exchanged"
          />

          <Input
            label="Notes (Optional)"
            value={notes}
            onChangeText={setNotes}
            placeholder="Additional notes"
            multiline
            numberOfLines={3}
          />
        </View>

        {bagsTaken && pricePerBag && (
          <View style={styles.revenuePreview}>
            <Text style={styles.revenueLabel}>Expected Revenue</Text>
            <Text style={styles.revenueValue}>
              ₵{(parseInt(bagsTaken) * parseFloat(pricePerBag)).toFixed(2)}
            </Text>
            <Text style={styles.revenueCalculation}>
              {bagsTaken} bags × ₵{pricePerBag} each
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={`Record ${saleType === 'supply' ? 'Supply' : 'Factory'} Sale`}
          onPress={handleSave}
          loading={isLoading}
          disabled={isLoading || bagsInStock.total <= 0}
          style={styles.saveButton}
        />
        {bagsInStock.total <= 0 && (
          <Text style={styles.noStockText}>
            No bags available in stock. Please produce more bags first.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stockInfo: {
    backgroundColor: Colors.info + '10',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.info + '20',
  },
  stockLabel: {
    fontSize: Fonts.sizes.sm,
    color: Colors.info,
    marginBottom: 4,
  },
  stockValue: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.bold,
    color: Colors.info,
    marginBottom: 4,
  },
  lowStockWarning: {
    fontSize: Fonts.sizes.sm,
    color: Colors.danger,
    fontWeight: Fonts.weights.medium,
  },
  typeSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semibold,
    color: Colors.text,
    marginBottom: 12,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  activeTypeButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  disabledTypeButton: {
    backgroundColor: Colors.textLight + '20',
    borderColor: Colors.textLight + '40',
  },
  typeButtonText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.semibold,
    color: Colors.text,
    textAlign: 'center',
  },
  activeTypeButtonText: {
    color: '#fff',
  },
  disabledTypeButtonText: {
    color: Colors.textLight,
  },
  closedText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    marginTop: 2,
  },
  supplierSection: {
    marginBottom: 24,
  },
  supplierGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  supplierCard: {
    width: '23%', // Reduced size to fit more cards per row
    padding: 8, // Reduced padding
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedSupplierCard: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  supplierIconContainer: {
    marginBottom: 4, // Reduced from 6 to 4
    width: 24, // Reduced from 28 to 24
    height: 24, // Reduced from 28 to 24
    borderRadius: 12,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  supplierText: {
    fontSize: Fonts.sizes.xs, // Keep as xs for smaller text
    fontWeight: Fonts.weights.medium,
    color: Colors.text,
    textAlign: 'center',
    width: '100%', // Ensure text is constrained to card width
  },
  selectedSupplierText: {
    color: Colors.primary,
    fontWeight: Fonts.weights.semibold,
  },
  tripNumberText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.primary,
    marginTop: 2, // Reduced from 4 to 2
    fontWeight: Fonts.weights.medium,
  },
  formSection: {
    gap: 16,
    marginBottom: 24,
  },
  revenuePreview: {
    backgroundColor: Colors.success + '10',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  revenueLabel: {
    fontSize: Fonts.sizes.sm,
    color: Colors.success,
    marginBottom: 4,
  },
  revenueValue: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.bold,
    color: Colors.success,
    marginBottom: 4,
  },
  revenueCalculation: {
    fontSize: Fonts.sizes.sm,
    color: Colors.success,
  },
  footer: {
    padding: 20,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  saveButton: {
    marginTop: 0,
  },
  noStockText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.danger,
    textAlign: 'center',
    marginTop: 12,
  },
});