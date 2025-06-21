import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calculator, User, Package, Settings, Users, ChevronDown } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Card from '@/components/Card';
import useProductionStore from '@/store/production-store';
import useInventoryStore from '@/store/inventory-store';
import useAuthStore from '@/store/auth-store';

export default function NewProductionScreen() {
  const router = useRouter();
  const { addProductionRecord, getBagsInStock } = useProductionStore();
  const { rolls, packingBags } = useInventoryStore();
  const { getEmployeesByRole } = useAuthStore();
  
  const [producerName, setProducerName] = useState('');
  const [bundles, setBundles] = useState('');
  const [machineNumber, setMachineNumber] = useState('');
  const [calculatedBags, setCalculatedBags] = useState(0);
  const [requiredRolls, setRequiredRolls] = useState(0);
  const [showProducerList, setShowProducerList] = useState(true); // Show producer list by default
  const [errors, setErrors] = useState({
    producerName: '',
    bundles: '',
    machineNumber: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get all producers from employees
  const producers = getEmployeesByRole('producer') || [];

  // Auto-calculate bags and required materials when bundles change
  useEffect(() => {
    const bundlesNum = parseInt(bundles) || 0;
    const bags = bundlesNum * 100;
    setCalculatedBags(bags);

    // Calculate required rolls based on micron type
    const bagsPerKg = {
      38: 28,
      40: 24,
      45: 22,
      50: 17,
    }[rolls?.micronType || 40] || 24;

    const rollsNeeded = Math.ceil(bags / bagsPerKg);
    setRequiredRolls(rollsNeeded);
  }, [bundles, rolls?.micronType]);

  const validateForm = () => {
    const newErrors = {
      producerName: '',
      bundles: '',
      machineNumber: '',
    };
    let isValid = true;

    if (!producerName.trim()) {
      newErrors.producerName = 'Producer name is required';
      isValid = false;
    }

    const bundlesNum = parseInt(bundles);
    if (!bundles || isNaN(bundlesNum) || bundlesNum <= 0) {
      newErrors.bundles = 'Enter a valid number of bundles';
      isValid = false;
    } else if (bundlesNum > (packingBags?.total || 0)) {
      newErrors.bundles = `Not enough packing bags. Available: ${packingBags?.total || 0} bundles`;
      isValid = false;
    } else if (requiredRolls > (rolls?.total || 0)) {
      newErrors.bundles = `Not enough rolls. Need ${requiredRolls}kg, have ${rolls?.total || 0}kg`;
      isValid = false;
    }

    const machineNum = parseInt(machineNumber);
    if (!machineNumber || isNaN(machineNum) || machineNum <= 0) {
      newErrors.machineNumber = 'Enter a valid machine number';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const bundlesNum = parseInt(bundles);
      addProductionRecord({
        producerName: producerName.trim(),
        bundlesProduced: bundlesNum,
        bagsProduced: calculatedBags,
        machineNumber: parseInt(machineNumber),
        rawMaterialUsed: requiredRolls
      });

      // Get updated bags in stock after production
      const updatedBagsInStock = getBagsInStock();
      
      Alert.alert(
        'Production Assigned Successfully',
        `${producerName} has been assigned to produce ${bundlesNum} bundles (${calculatedBags} bags) on Machine ${machineNumber}.

Bags have been added to stock and today's production.

Current bags in stock: ${updatedBagsInStock.total}`,
        [
          {
            text: 'Assign Another',
            onPress: () => {
              setProducerName('');
              setBundles('');
              setMachineNumber('');
              setIsSubmitting(false);
            },
            style: 'default',
          },
          {
            text: 'View Production',
            onPress: () => router.back(),
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('Production assignment error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleSelectProducer = (producer: any) => {
    setProducerName(producer.fullName);
    setShowProducerList(false);
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const canProduce = requiredRolls <= (rolls?.total || 0) && parseInt(bundles || '0') <= (packingBags?.total || 0);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Date Header */}
        <Card style={styles.dateCard}>
          <Text style={styles.dateLabel}>Production Date</Text>
          <Text style={styles.dateValue}>{getCurrentDate()}</Text>
        </Card>

        {/* Producer Information */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <User size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Producer Information</Text>
          </View>

          {/* Producer Selection */}
          <View style={styles.producerContainer}>
            <Text style={styles.fieldLabel}>Producer Name</Text>
            
            {producers.length > 0 && (
              <TouchableOpacity
                style={styles.producerDropdown}
                onPress={() => setShowProducerList(!showProducerList)}
              >
                <Users size={16} color={Colors.primary} />
                <Text style={styles.producerDropdownText}>
                  {showProducerList ? 'Hide producer list' : 'Show producer list'}
                </Text>
                <ChevronDown size={16} color={Colors.textLight} />
              </TouchableOpacity>
            )}

            {showProducerList && producers.length > 0 && (
              <View style={styles.producerList}>
                <FlatList
                  data={producers}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.producerItem}
                      onPress={() => handleSelectProducer(item)}
                    >
                      <View style={styles.producerInfo}>
                        <Text style={styles.producerName}>{item.fullName}</Text>
                        <Text style={styles.producerPhone}>{item.phoneNumber}</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  scrollEnabled={producers.length > 3}
                  style={producers.length > 3 ? styles.scrollableProducerList : undefined}
                />
              </View>
            )}

            <Input
              placeholder="Enter producer's full name or select from list"
              value={producerName}
              onChangeText={setProducerName}
              error={errors.producerName}
              autoCapitalize="words"
              containerStyle={{ marginTop: 0 }}
            />
          </View>

          <Input
            label="Machine Number"
            placeholder="Enter machine number to be used"
            value={machineNumber}
            onChangeText={setMachineNumber}
            keyboardType="number-pad"
            error={errors.machineNumber}
          />
        </Card>

        {/* Production Details */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Package size={20} color={Colors.secondary} />
            <Text style={styles.sectionTitle}>Production Details</Text>
          </View>

          <Input
            label="Bundles to Produce"
            placeholder="Enter number of bundles"
            value={bundles}
            onChangeText={setBundles}
            keyboardType="number-pad"
            error={errors.bundles}
            hint={`Available: ${packingBags?.total || 0} bundles`}
          />

          {bundles && parseInt(bundles) > 0 && (
            <View style={styles.calculationContainer}>
              <View style={styles.calculationHeader}>
                <Calculator size={16} color={Colors.primary} />
                <Text style={styles.calculationTitle}>Auto-Calculated Values</Text>
              </View>

              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>Bags to be Produced:</Text>
                <Text style={styles.calculationValue}>{calculatedBags} bags</Text>
              </View>

              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>Rolls Required:</Text>
                <Text style={[
                  styles.calculationValue,
                  { color: requiredRolls <= (rolls?.total || 0) ? Colors.success : Colors.danger }
                ]}>
                  {requiredRolls}kg ({rolls?.micronType || 40} microns)
                </Text>
              </View>

              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>Packing Bags Required:</Text>
                <Text style={[
                  styles.calculationValue,
                  { color: parseInt(bundles) <= (packingBags?.total || 0) ? Colors.success : Colors.danger }
                ]}>
                  {bundles} bundles
                </Text>
              </View>

              <View style={styles.stockNote}>
                <Text style={styles.stockNoteText}>
                  ✓ Bags will be automatically added to stock upon production assignment
                </Text>
              </View>
            </View>
          )}
        </Card>

        {/* Material Availability Check */}
        <Card style={[
          styles.availabilityCard,
          { borderColor: canProduce ? Colors.success : Colors.danger }
        ]}>
          <View style={styles.availabilityHeader}>
            <Settings size={20} color={canProduce ? Colors.success : Colors.danger} />
            <Text style={[
              styles.availabilityTitle,
              { color: canProduce ? Colors.success : Colors.danger }
            ]}>
              Material Availability
            </Text>
          </View>

          <View style={styles.availabilityDetails}>
            <View style={styles.availabilityRow}>
              <Text style={styles.availabilityLabel}>Current Rolls:</Text>
              <Text style={styles.availabilityValue}>{rolls?.total || 0}kg</Text>
            </View>

            <View style={styles.availabilityRow}>
              <Text style={styles.availabilityLabel}>Current Packing Bags:</Text>
              <Text style={styles.availabilityValue}>{packingBags?.total || 0} bundles</Text>
            </View>

            <View style={styles.availabilityRow}>
              <Text style={styles.availabilityLabel}>Status:</Text>
              <Text style={[
                styles.availabilityStatus,
                { color: canProduce ? Colors.success : Colors.danger }
              ]}>
                {canProduce ? '✓ Sufficient Materials' : '✗ Insufficient Materials'}
              </Text>
            </View>
          </View>
        </Card>

        <Button
          title="Assign Production"
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={isSubmitting || !canProduce || !bundles || !producerName || !machineNumber}
          style={[
            styles.submitButton,
            { backgroundColor: canProduce ? Colors.primary : Colors.textLight }
          ]}
        />

        {!canProduce && bundles && (
          <View style={styles.insufficientMaterialsContainer}>
            <Text style={styles.insufficientMaterialsText}>
              Cannot proceed with production due to insufficient materials. Please update your inventory first.
            </Text>
            <Button
              title="Update Inventory"
              onPress={() => router.push('/(tabs)/(inventory)/add')}
              variant="outline"
              style={styles.updateInventoryButton}
            />
          </View>
        )}
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
  dateCard: {
    marginBottom: 16,
    alignItems: 'center',
    padding: 20,
  },
  dateLabel: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  sectionCard: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  producerContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  producerDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: Colors.primary + '10',
    borderRadius: 8,
    marginBottom: 12,
  },
  producerDropdownText: {
    flex: 1,
    fontSize: Fonts.sizes.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
  producerList: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  scrollableProducerList: {
    maxHeight: 200,
  },
  producerItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  producerInfo: {
    gap: 2,
  },
  producerName: {
    fontSize: Fonts.sizes.md,
    fontWeight: '500',
    color: Colors.text,
  },
  producerPhone: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
  },
  calculationContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: Colors.primary + '05',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },
  calculationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  calculationTitle: {
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: Colors.primary,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  calculationLabel: {
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
  },
  calculationValue: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
    color: Colors.text,
  },
  stockNote: {
    marginTop: 12,
    padding: 8,
    backgroundColor: Colors.success + '10',
    borderRadius: 6,
  },
  stockNoteText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.success,
    fontWeight: '500',
  },
  availabilityCard: {
    marginBottom: 24,
    borderWidth: 2,
  },
  availabilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  availabilityTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '600',
  },
  availabilityDetails: {
    gap: 8,
  },
  availabilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availabilityLabel: {
    fontSize: Fonts.sizes.md,
    color: Colors.textLight,
  },
  availabilityValue: {
    fontSize: Fonts.sizes.md,
    fontWeight: '500',
    color: Colors.text,
  },
  availabilityStatus: {
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
  },
  submitButton: {
    marginBottom: 16,
  },
  insufficientMaterialsContainer: {
    alignItems: 'center',
    padding: 16,
  },
  insufficientMaterialsText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  updateInventoryButton: {
    borderColor: Colors.primary,
  },
});