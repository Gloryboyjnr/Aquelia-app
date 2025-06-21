import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Colors from '@/constants/colors';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  elevation?: number;
}

export default function Card({ children, style, elevation = 2 }: CardProps) {
  return (
    <View 
      style={[
        styles.card, 
        { 
          shadowOpacity: 0.1 * elevation,
          elevation: elevation,
        },
        style
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
});