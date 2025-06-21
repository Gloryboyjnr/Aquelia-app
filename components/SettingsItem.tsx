import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight, Lock } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';

interface SettingsItemProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  onPress: () => void;
  isPremium?: boolean;
  isLast?: boolean;
}

const SettingsItem: React.FC<SettingsItemProps> = ({
  title,
  subtitle,
  icon,
  onPress,
  isPremium = false,
  isLast = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        !isLast && styles.borderBottom,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>{icon}</View>
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {isPremium && (
            <View style={styles.premiumBadge}>
              <Lock size={12} color={Colors.white} />
              <Text style={styles.premiumText}>PRO</Text>
            </View>
          )}
        </View>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <ChevronRight size={20} color={Colors.textLight} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semibold,
    color: Colors.text,
    marginRight: 8,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  premiumText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.bold,
    color: Colors.white,
    marginLeft: 2,
  },
  subtitle: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
  },
});

export default SettingsItem;