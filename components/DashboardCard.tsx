import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';

interface DashboardCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  valueColor?: string;
}

export default function DashboardCard({
  title,
  value,
  subtitle,
  icon,
  rightIcon,
  style,
  valueColor = Colors.text,
}: DashboardCardProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={styles.title}>{title}</Text>
        </View>
        {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
      </View>
      
      <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
      
      {subtitle && (
        <Text style={styles.subtitle}>{subtitle}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: 8,
  },
  rightIconContainer: {
    marginLeft: 8,
  },
  title: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '500',
    color: Colors.textLight,
    flex: 1,
  },
  value: {
    fontSize: Fonts.sizes.xl,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    lineHeight: 18,
  },
});