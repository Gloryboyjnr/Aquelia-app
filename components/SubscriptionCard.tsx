import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check, Clock, Star } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface Feature {
  title: string;
  included: boolean;
}

interface SubscriptionCardProps {
  title: string;
  price: string | number;
  features: Feature[];
  isSelected: boolean;
  onSelect: () => void;
  isPrimary?: boolean;
  currencySymbol?: string;
  available?: boolean;
  incoming?: boolean;
}

const SubscriptionCard = ({
  title,
  price,
  features,
  isSelected,
  onSelect,
  isPrimary = false,
  currencySymbol = '₵',
  available = true,
  incoming = false
}: SubscriptionCardProps) => {
  const handlePress = () => {
    if (available && !incoming) {
      onSelect();
    }
  };

  const isDisabled = !available || incoming;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.selectedContainer,
        isDisabled && styles.disabledContainer,
        incoming && styles.incomingContainer
      ]}
      onPress={handlePress}
      activeOpacity={isDisabled ? 1 : 0.8}
      disabled={isDisabled}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[
            styles.title,
            isSelected && styles.selectedText,
            isDisabled && styles.disabledText
          ]}>
            {title}
          </Text>
          {incoming && (
            <View style={styles.incomingBadge}>
              <Star size={14} color={Colors.warning} />
              <Text style={styles.incomingText}>Coming Soon</Text>
            </View>
          )}
          {!available && !incoming && (
            <View style={styles.comingSoonBadge}>
              <Clock size={14} color={Colors.textLight} />
              <Text style={styles.comingSoonText}>Coming Soon</Text>
            </View>
          )}
        </View>
        <Text style={[
          styles.price,
          isSelected && styles.selectedText,
          isDisabled && styles.disabledText
        ]}>
          {typeof price === 'string' ? 
            (price === '-' ? price : `${currencySymbol}${price}/month`) : 
            `${currencySymbol}${price}/month`}
        </Text>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.featuresContainer}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Check 
              size={18} 
              color={isDisabled ? Colors.textLight : Colors.primary} 
              style={styles.checkIcon}
            />
            <Text style={[
              styles.featureText,
              isSelected && styles.selectedText,
              isDisabled && styles.disabledText
            ]}>
              {feature.title}
            </Text>
          </View>
        ))}
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.selectButton,
            isSelected && styles.selectedButton,
            isDisabled && styles.disabledButton,
            incoming && styles.incomingButton
          ]}
          onPress={handlePress}
          disabled={isDisabled}
        >
          <Text style={[
            styles.buttonText,
            isSelected && styles.selectedButtonText,
            isDisabled && styles.disabledButtonText,
            incoming && styles.incomingButtonText
          ]}>
            {incoming ? 'Coming Soon' : !available ? 'Coming Soon' : isSelected ? 'Selected' : 'Select Plan'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  selectedContainer: {
    borderColor: Colors.primary,
    backgroundColor: Colors.card,
  },
  disabledContainer: {
    opacity: 0.7,
    borderColor: Colors.border,
  },
  incomingContainer: {
    borderColor: Colors.warning,
    backgroundColor: Colors.card,
  },
  header: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  comingSoonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  comingSoonText: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 4,
    fontWeight: '500',
  },
  incomingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  incomingText: {
    fontSize: 12,
    color: Colors.warning,
    marginLeft: 4,
    fontWeight: '600',
  },
  price: {
    fontSize: 19,
    fontWeight: '800',
    color: Colors.text,
  },
  selectedText: {
    color: Colors.text,
  },
  disabledText: {
    color: Colors.textLight,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkIcon: {
    marginRight: 10,
  },
  featureText: {
    fontSize: 15,
    color: Colors.text,
    flex: 1,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  selectButton: {
    backgroundColor: Colors.background,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    width: '100%',
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  disabledButton: {
    backgroundColor: Colors.background,
    borderColor: Colors.border,
  },
  incomingButton: {
    backgroundColor: '#FFF8E1',
    borderColor: Colors.warning,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  selectedButtonText: {
    color: Colors.white,
  },
  disabledButtonText: {
    color: Colors.textLight,
  },
  incomingButtonText: {
    color: Colors.warning,
  },
});

export default SubscriptionCard;