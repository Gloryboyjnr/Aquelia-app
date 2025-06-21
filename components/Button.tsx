import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Platform,
  View
} from 'react-native';
import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  leftIcon,
  rightIcon
}: ButtonProps) {
  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryButton;
      case 'secondary':
        return styles.secondaryButton;
      case 'outline':
        return styles.outlineButton;
      case 'text':
        return styles.textButton;
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryText;
      case 'secondary':
        return styles.secondaryText;
      case 'outline':
        return styles.outlineText;
      case 'text':
        return styles.textButtonText;
      default:
        return styles.primaryText;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.smallButton;
      case 'medium':
        return styles.mediumButton;
      case 'large':
        return styles.largeButton;
      default:
        return styles.mediumButton;
    }
  };

  const getTextSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.smallText;
      case 'medium':
        return styles.mediumText;
      case 'large':
        return styles.largeText;
      default:
        return styles.mediumText;
    }
  };

  const getLoadingColor = () => {
    if (variant === 'outline' || variant === 'text') {
      return Colors.primary;
    }
    return Colors.white;
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        getSizeStyle(),
        disabled && styles.disabledButton,
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          color={getLoadingColor()} 
          size="small" 
        />
      ) : (
        <View style={styles.contentContainer}>
          {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
          <Text 
            style={[
              styles.text, 
              getTextStyle(), 
              getTextSizeStyle(),
              disabled && styles.disabledText,
              textStyle
            ]}
          >
            {title}
          </Text>
          {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: Platform.OS === 'android' ? 48 : 44
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  leftIconContainer: {
    marginRight: 8
  },
  rightIconContainer: {
    marginLeft: 8
  },
  primaryButton: {
    backgroundColor: Colors.primary
  },
  secondaryButton: {
    backgroundColor: Colors.secondary
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary
  },
  textButton: {
    backgroundColor: 'transparent'
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 16
  },
  mediumButton: {
    paddingVertical: 12,
    paddingHorizontal: 24
  },
  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 32
  },
  text: {
    fontWeight: '600',
    textAlign: 'center'
  },
  primaryText: {
    color: Colors.white
  },
  secondaryText: {
    color: Colors.white
  },
  outlineText: {
    color: Colors.primary
  },
  textButtonText: {
    color: Colors.primary
  },
  smallText: {
    fontSize: Fonts.sizes.sm
  },
  mediumText: {
    fontSize: Fonts.sizes.md
  },
  largeText: {
    fontSize: Fonts.sizes.lg
  },
  disabledButton: {
    backgroundColor: Colors.border,
    borderColor: Colors.border,
    opacity: 0.7
  },
  disabledText: {
    color: Colors.textLight
  }
});