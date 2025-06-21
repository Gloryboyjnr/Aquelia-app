import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import Card from '@/components/Card';
import Button from '@/components/Button';
import useInventoryStore from '@/store/inventory-store';

export default function InventoryScreen() {
  const router = useRouter();
  const { rolls, packingBags, lastUpdated } = useInventoryStore();

  const handleUpdateInventory = () => {
    router.push('/(tabs)/(inventory)/add');
  };

  const handleViewHistory = () => {
    router.push('/(tabs)/(inventory)/history');
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Never';
    const date = new Date(lastUpdated);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Inventory Summary</Text>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Rolls</Text>
            <Text style={styles.summaryValue}>{rolls.total} kg</Text>
            <Text style={styles.summarySubtext}>
              {rolls.micronType} microns
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Packing Bags</Text>
            <Text style={styles.summaryValue}>{packingBags.total} bundles</Text>
            <Text style={styles.summarySubtext}>
              {packingBags.total * 100} pieces total
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Estimated Production Capacity</Text>
            <Text style={[styles.summaryValue, { color: Colors.success }]}>
              {rolls.estimatedBags}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.lastUpdatedContainer}>
            <Text style={styles.lastUpdatedLabel}>Last Updated:</Text>
            <Text style={styles.lastUpdatedValue}>{formatLastUpdated()}</Text>
          </View>
        </Card>

        <View style={styles.actionsContainer}>
          <Button
            title="Update Inventory"
            onPress={handleUpdateInventory}
            style={styles.primaryButton}
          />
          
          <Button
            title="Inventory History"
            onPress={handleViewHistory}
            variant="outline"
            style={styles.secondaryButton}
          />
        </View>
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
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: Fonts.sizes.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 20,
  },
  summaryItem: {
    paddingVertical: 12,
  },
  summaryLabel: {
    fontSize: Fonts.sizes.md,
    color: Colors.textLight,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: Fonts.sizes.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  summarySubtext: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  lastUpdatedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginTop: 8,
  },
  lastUpdatedLabel: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
  },
  lastUpdatedValue: {
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
    fontWeight: '500',
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    borderColor: Colors.primary,
  },
});