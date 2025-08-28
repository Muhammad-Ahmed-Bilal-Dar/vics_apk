import { Feather } from '@expo/vector-icons';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Colors } from '../theme/theme';

// Define styles
const styles = StyleSheet.create({
  shadow: {
    shadowColor: Colors.common.black,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8, // For Android
  },
  container: {
    top: -22,
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    height: 70,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary.main, // Using the main green color from our palette
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  }
});

/**
 * Custom Tab Button component for navigation
 * Used for special tab buttons like the center action button
 */
const CustomTabButton: React.FC<BottomTabBarButtonProps> = ({ 
  accessibilityState, 
  onPress, 
  children 
}) => {
  return (
    <View style={styles.container} pointerEvents="box-none">
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8} // Add a slight opacity change on press
      >
        <View style={[styles.button, styles.shadow]}>
          <Feather name="clipboard" size={28} color={Colors.common.white} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default CustomTabButton; 