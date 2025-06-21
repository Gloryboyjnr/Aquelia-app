import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  containerStyle?: ViewStyle;
  leftIcon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  required = false,
  containerStyle,
  style,
  leftIcon,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}
      <View style={[
        styles.inputContainer,
        error ? styles.inputContainerError : null
      ]}>
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
        <TextInput
          style={[
            styles.input,
            props.multiline ? styles.multilineInput : null,
            leftIcon ? styles.inputWithIcon : null,
            style,
          ]}
          placeholderTextColor={Colors.textLight}
          {...props}
        />
      </View>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  required: {
    color: Colors.danger,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    minHeight: 48,
  },
  inputContainerError: {
    borderColor: Colors.danger,
    backgroundColor: Colors.danger + '05',
  },
  iconContainer: {
    paddingLeft: 12,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: Fonts.sizes.md,
    color: Colors.text,
  },
  inputWithIcon: {
    paddingLeft: 8,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.danger,
    marginTop: 4,
    fontWeight: '500',
  },
  hintText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    marginTop: 4,
  },
});

export default Input;