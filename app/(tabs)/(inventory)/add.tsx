import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Card from '@/components/Card';
import useInventoryStore from '@/store/inventory-store';

const materialTypes = [
  { label: 'Rolls', value: 'rolls' as const },
  { label: 'Packing Bags', value: 'packingBags' as const },
];

const rollTypes: Array<{
  label: string;
  value: 38 | 40 | 45 | 50;
}> = [
  { label: '38 microns', value: 38 },
  { label: '40 microns', value: 40 },
  { label: '45 microns', value: 45 },
  { label: '50 microns', value: 50 },
];

// Helper to calculate estimated bags based on micron type and weight
const calculateEstimatedBags = (micronType: number | null, weight: string) => {
  if (!micronType || !weight || isNaN(parseFloat(weight))) {
    return 0;
  }
  
  const weightNum = parseFloat(weight);
  const bagsPerKg = {
    38: 28, // average of 26-30
    40: 24, // average of 23-25
    45: 22, // average of 21-23
    50: 17, // average of 16-18
  }[micronType] || 24;

  return Math.floor(weightNum * bagsPerKg);
};

export default function AddInventoryScreen() {
  const router = useRouter();
  const { addInventoryItem } = useInventoryStore();
  
  const [selectedMaterials, setSelectedMaterials] = useState<Set<'rolls' | 'packingBags'>>(new Set());
  const [rollWeight, setRollWeight] = useState('');
  const [rollType, setRollType] = useState<38 | 40 | 45 | 50 | null>(null);
  const [packingBagsCount, setPackingBagsCount] = useState('');
  const [dateOfArrival, setDateOfArrival] = useState(new Date().toISOString().split('T')[0]);
  const [manufacturerName, setManufacturerName] = useState('');
  const [notes, setNotes] = useState('');
  const [hasReceipt, setHasReceipt] = useState(false);
  const [estimatedBags, setEstimatedBags] = useState(0);
  
  const [errors, setErrors] = useState({
    rolls: '',
    packingBags: '',
    rollType: '',
    dateOfArrival: '',
    manufacturerName: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update estimated bags when roll weight or type changes
  useEffect(() => {
    setEstimatedBags(calculateEstimatedBags(rollType, rollWeight));
  }, [rollWeight, rollType]);

  const toggleMaterialType = (type: 'rolls' | 'packingBags') => {
    const newSelected = new Set(selectedMaterials);
    if (newSelected.has(type)) {
      newSelected.delete(type);
      if (type === 'rolls') {
        setRollWeight('');
        setRollType(null);
      } else {
        setPackingBagsCount('');
      }
    } else {
      newSelected.add(type);
    }
    setSelectedMaterials(newSelected);
  };

  const resetForm = () => {
    setSelectedMaterials(new Set());
    setRollWeight('');
    setRollType(null);
    setPackingBagsCount('');
    setDateOfArrival(new Date().toISOString().split('T')[0]);
    setManufacturerName('');
    setNotes('');
    setHasReceipt(false);
    setErrors({
      rolls: '',
      packingBags: '',
      rollType: '',
      dateOfArrival: '',
      manufacturerName: '',
    });
  };

  const validateForm = () => {
    const newErrors = {
      rolls: '',
      packingBags: '',
      rollType: '',
      dateOfArrival: '',
      manufacturerName: '',
    };
    let isValid = true;

    if (selectedMaterials.size === 0) {
      Alert.alert('Error', 'Please select at least one material type.');
      return false;
    }

    if (selectedMaterials.has('rolls')) {
      if (!rollType) {
        newErrors.rollType = 'Please select a roll type';
        isValid = false;
      }
      
      const weight = parseFloat(rollWeight);
      if (!rollWeight || isNaN(weight) || weight <= 0) {
        newErrors.rolls = 'Please enter a valid weight in kg';
        isValid = false;
      }
    }

    if (selectedMaterials.has('packingBags')) {
      const count = parseInt(packingBagsCount);
      if (!packingBagsCount || isNaN(count) || count <= 0) {
        newErrors.packingBags = 'Please enter a valid number of bundles';
        isValid = false;
      }
    }

    if (!dateOfArrival) {
      newErrors.dateOfArrival = 'Please select a date of arrival';
      isValid = false;
    }

    if (!manufacturerName.trim()) {
      newErrors.manufacturerName = "Manufacturer's name is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const addedItems: string[] = [];

      if (selectedMaterials.has('rolls')) {
        const weight = parseFloat(rollWeight);
        addInventoryItem({
          type: 'rolls',
          quantity: weight,
          micronType: rollType!,
          manufacturerName: manufacturerName,
          receiptUrl: hasReceipt ? 'receipt-uploaded' : undefined,
          notes: notes || undefined,
        });
        addedItems.push(`${weight}kg of ${rollType} micron rolls`);
      }

      if (selectedMaterials.has('packingBags')) {
        const count = parseInt(packingBagsCount);
        addInventoryItem({
          type: 'packingBags',
          quantity: count,
          manufacturerName: manufacturerName,
          receiptUrl: hasReceipt ? 'receipt-uploaded' : undefined,
          notes: notes || undefined,
        });
        addedItems.push(`${count} bundles of packing bags`);
      }
      
      Alert.alert(
        'Success',
        `Added to inventory: ${addedItems.join(', ')}`,
        [
          {
            text: 'Add More',
            onPress: () => {
              resetForm();
              setIsSubmitting(false);
            },
            style: 'default',
          },
          {
            text: 'View Inventory',
            onPress: () => router.back(),
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('Add inventory error:', error);
      Alert.alert(
        'Error',
        'Failed to update inventory. Please try again.',
        [{ text: 'OK' }]
      );
      setIsSubmitting(false);
    }
  };

  const handleUploadReceipt = () => {
    Alert.alert(
      'Upload Receipt',
      'Receipt upload functionality would be implemented here.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Simulate Upload', 
          onPress: () => {
            setHasReceipt(true);
            Alert.alert('Success', 'Receipt uploaded successfully!');
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Select Materials to Update</Text>
          
          <View style={styles.materialTypeContainer}>
            {materialTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.materialTypeOption,
                  selectedMaterials.has(type.value) && styles.selectedMaterialType
                ]}
                onPress={() => toggleMaterialType(type.value)}
              >
                <Text style={[
                  styles.materialTypeLabel,
                  selectedMaterials.has(type.value) && styles.selectedMaterialTypeLabel
                ]}>
                  {type.label}
                </Text>
                {selectedMaterials.has(type.value) && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {selectedMaterials.size > 0 && (
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            
            {selectedMaterials.has('rolls') && (
              <View style={styles.quantitySection}>
                <Text style={styles.subsectionTitle}>Roll Details</Text>
                
                <Text style={styles.fieldLabel}>Roll Type</Text>
                <View style={styles.rollTypeContainer}>
                  {rollTypes.map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.rollTypeOption,
                        rollType === type.value && styles.selectedRollType
                      ]}
                      onPress={() => setRollType(type.value)}
                    >
                      <Text style={[
                        styles.rollTypeLabel,
                        rollType === type.value && styles.selectedRollTypeLabel
                      ]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.rollType ? <Text style={styles.errorText}>{errors.rollType}</Text> : null}
                
                <Input
                  label="Weight in Kg"
                  placeholder="Enter weight in kilograms"
                  value={rollWeight}
                  onChangeText={setRollWeight}
                  keyboardType="decimal-pad"
                  error={errors.rolls}
                  hint={rollWeight && rollType && estimatedBags > 0 ? `Can produce: ${estimatedBags} bags` : undefined}
                />
              </View>
            )}

            {selectedMaterials.has('packingBags') && (
              <View style={styles.quantitySection}>
                <Text style={styles.subsectionTitle}>Packing Bags Details</Text>
                <Input
                  label="Number of Bundles"
                  placeholder="Enter number of bundles"
                  value={packingBagsCount}
                  onChangeText={setPackingBagsCount}
                  keyboardType="number-pad"
                  error={errors.packingBags}
                  hint="1 bundle = 100 pieces"
                />
              </View>
            )}
          </Card>
        )}

        {selectedMaterials.size > 0 && (
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            
            <Input
              label="Date of Arrival"
              placeholder="YYYY-MM-DD"
              value={dateOfArrival}
              onChangeText={setDateOfArrival}
              error={errors.dateOfArrival}
              hint="Format: YYYY-MM-DD"
            />
            
            <Input
              label="Manufacturer's Name *"
              placeholder="Enter manufacturer name"
              value={manufacturerName}
              onChangeText={setManufacturerName}
              autoCapitalize="words"
              error={errors.manufacturerName}
              required
            />
            
            <View style={styles.receiptContainer}>
              <Text style={styles.fieldLabel}>Receipt (Optional)</Text>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={handleUploadReceipt}
              >
                <Text style={styles.uploadButtonText}>
                  {hasReceipt ? 'Receipt Uploaded' : 'Upload Receipt'}
                </Text>
              </TouchableOpacity>
              {hasReceipt && (
                <Text style={styles.receiptStatus}>✓ Receipt uploaded successfully</Text>
              )}
            </View>
            
            <Input
              label="Notes (Optional)"
              placeholder="Add any additional notes"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </Card>
        )}

        <Button
          title="Submit"
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={isSubmitting || selectedMaterials.size === 0}
          style={styles.submitButton}
        />
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
  sectionCard: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: Fonts.sizes.md,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 12,
  },
  materialTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  materialTypeOption: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    position: 'relative',
  },
  selectedMaterialType: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  materialTypeLabel: {
    fontSize: Fonts.sizes.md,
    color: Colors.text,
    textAlign: 'center',
  },
  selectedMaterialTypeLabel: {
    color: Colors.primary,
    fontWeight: '600',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    fontSize: Fonts.sizes.md,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  quantitySection: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  rollTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  rollTypeOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  selectedRollType: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  rollTypeLabel: {
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
  },
  selectedRollTypeLabel: {
    color: Colors.primary,
    fontWeight: '600',
  },
  receiptContainer: {
    marginBottom: 16,
  },
  uploadButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  uploadButtonText: {
    fontSize: Fonts.sizes.md,
    color: Colors.text,
  },
  receiptStatus: {
    fontSize: Fonts.sizes.sm,
    color: Colors.success,
    marginTop: 8,
  },
  submitButton: {
    marginTop: 16,
    backgroundColor: Colors.primary,
  },
  errorText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.danger,
    marginTop: 4,
    marginBottom: 8,
  },
});