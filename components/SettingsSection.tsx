import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';

interface SettingsSectionProps {
  title: string;
  children: ReactNode;
}

export default function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: Colors.textLight,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  content: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
});