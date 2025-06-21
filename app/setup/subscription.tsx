import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import SubscriptionCard from '@/components/SubscriptionCard';
import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import { subscriptionPlans } from '@/mocks/subscription-plans';
import useSubscriptionStore from '@/store/subscription-store';

export default function SubscriptionScreen() {
  const router = useRouter();
  const { setSelectedPlan } = useSubscriptionStore();
  
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  
  const handleSelectPlan = (planId: string) => {
    const plan = subscriptionPlans.find(p => p.id === planId);
    if (!plan || !plan.available || plan.incoming) return;
    
    setSelectedPlanId(planId);
    setSelectedPlan(planId as 'basic' | 'pro');
    
    // Only navigate to payment if it's the basic plan and available
    if (planId === 'basic' && plan.available && !plan.incoming) {
      router.push('/setup/payment');
    }
  };

  const handleBack = () => {
    router.replace('/setup/company');
  };

  const renderPlanCard = ({ item }: { item: typeof subscriptionPlans[0] }) => (
    <SubscriptionCard
      key={item.id}
      title={item.name}
      price={item.price}
      features={item.features.map(feature => ({
        title: feature,
        included: true
      }))}
      isSelected={selectedPlanId === item.id && item.available && !item.incoming}
      onSelect={() => handleSelectPlan(item.id)}
      isPrimary={item.isPopular}
      currencySymbol="₵"
      available={item.available}
      incoming={item.incoming}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBack}
        >
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose a Plan</Text>
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Select Your Subscription</Text>
        <Text style={styles.subtitle}>
          Choose the plan that best fits your business needs
        </Text>
        
        <FlatList
          data={subscriptionPlans}
          renderItem={renderPlanCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.plansContainer}
          ListFooterComponent={
            <View style={styles.guaranteeContainer}>
              <Text style={styles.guaranteeText}>
                10-day cancellation guarantee. Cancel within 10 days for a full refund.
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border
  },
  backButton: {
    padding: 8
  },
  headerTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.semibold,
    color: Colors.text
  },
  placeholder: {
    width: 40
  },
  content: {
    flex: 1,
    padding: 16
  },
  title: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: Fonts.weights.bold,
    color: Colors.text,
    marginBottom: 8
  },
  subtitle: {
    fontSize: Fonts.sizes.md,
    color: Colors.textLight,
    marginBottom: 24
  },
  plansContainer: {
    paddingBottom: 24
  },
  guaranteeContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24
  },
  guaranteeText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    textAlign: 'center'
  }
});