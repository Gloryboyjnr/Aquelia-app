import React, { ReactNode } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  ViewStyle,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';

interface ScreenContainerProps {
  children: ReactNode;
  scrollable?: boolean;
  keyboardAvoiding?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  backgroundColor?: string;
  disableScrollView?: boolean; // Added prop to disable ScrollView
}

export default function ScreenContainer({
  children,
  scrollable = true,
  keyboardAvoiding = true,
  style,
  contentContainerStyle,
  backgroundColor = Colors.background,
  disableScrollView = false, // Default to false to maintain backward compatibility
}: ScreenContainerProps) {
  // Create content with or without ScrollView
  const renderContent = () => {
    // If disableScrollView is true or scrollable is false, don't use ScrollView
    if (disableScrollView || !scrollable) {
      return (
        <View style={[styles.contentContainer, contentContainerStyle]}>
          {children}
        </View>
      );
    } else {
      return (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      );
    }
  };

  // For iOS, use KeyboardAvoidingView with padding behavior
  if (keyboardAvoiding && Platform.OS === 'ios') {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor }]} edges={['top']}>
        <StatusBar 
          backgroundColor={backgroundColor} 
          barStyle="dark-content" 
        />
        <KeyboardAvoidingView 
          style={[styles.container, style]} 
          behavior="padding"
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
          {renderContent()}
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // For Android and when keyboard avoiding is not needed
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]} edges={['top']}>
      <StatusBar 
        backgroundColor={backgroundColor} 
        barStyle="dark-content" 
      />
      <View style={[styles.container, style]}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    padding: 20,
  },
});