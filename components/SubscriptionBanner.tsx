import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowUpRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';

interface SubscriptionBannerProps {
  plan: 'basic' | 'pro';
  expiryDate?: string;
  onUpgrade?: () => void;
}

export default function SubscriptionBanner({
  plan,
  expiryDate,
  onUpgrade,
}: SubscriptionBannerProps) {
  const isPro = plan === 'pro';
  const formattedDate = expiryDate 
    ? new Date(expiryDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Not available';

  return (
    <View
      style={[
        styles.container,
        isPro ? styles.proPlanContainer : styles.basicPlanContainer,
      ]}
    >
      <View style={styles.content}>
        <View>
          <Text style={styles.planName}>
            {isPro ? 'Pro Plan' : 'Basic Plan'}
          </Text>
          {expiryDate && (
            <Text style={styles.expiryText}>
              Expires on {formattedDate}
            </Text>
          )}
        </View>
        {!isPro && onUpgrade && (
          <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
            <Text style={styles.upgradeText}>Upgrade</Text>
            <ArrowUpRight size={16} color={Colors.card} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 24,
    padding: 16,
  },
  basicPlanContainer: {
    backgroundColor: Colors.primary,
  },
  proPlanContainer: {
    backgroundColor: Colors.secondary,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '700',
    color: Colors.card,
    marginBottom: 4,
  },
  expiryText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.card,
    opacity: 0.8,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  upgradeText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
    color: Colors.card,
    marginRight: 4,
  },
});