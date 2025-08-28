import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme/theme';

// Define a type for Feather icon names
type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

interface MenuItem {
  id: string;
  title: string;
  icon: FeatherIconName;
  onPress: () => void;
  badge?: number;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  
  // Mock user profile data - this would come from your app's state or context
  const userProfile = {
    name: 'Ahmed',
    email: 'ahmed@gmail.com',
    phone: '+92 300 1234567',
    role: 'user',
    photo: null, // This would be an image URL in a real app
  };
  
  const menuItems: MenuItem[] = [
    
    {
      id: 'account',
      title: 'Account Settings',
      icon: 'user',
      onPress: () => {
        // Navigate to account settings screen
        router.push('/screens/AccountSettingsScreen');
      },
    },
    {
      id: 'history',
      title: 'Inspection History',
      icon: 'clock',
      onPress: () => {
        // Navigate to history screen
        router.push('/screens/history');
      },
    },
    {
      id: 'booking',
      title: 'Booking',
      icon: 'calendar',
      onPress: () => {
        router.push('/screens/BookingsScreen');
      },
    },
    {
      id: 'payments',
      title: 'Payments',
      icon: 'credit-card',
      onPress: () => {
        router.push('/payment');
      },
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      icon: 'shield',
      onPress: () => {
        // Navigate to security settings
        Alert.alert("Security & Privacy", "This would open security settings.");
      },
    },
    {
      id: 'appearance',
      title: 'Appearance',
      icon: 'eye',
      onPress: () => {
        // Navigate to appearance settings
        Alert.alert("Appearance", "This would open appearance settings.");
      },
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: 'help-circle',
      onPress: () => {
        // Navigate to help & support
        Alert.alert("Help & Support", "This would open help and support options.");
      },
    },
    {
      id: 'about',
      title: 'About',
      icon: 'info',
      onPress: () => {
        // Navigate to about page
        Alert.alert("About", "Vehicle Inspection & Certification System\nVersion 1.0.0");
      },
    },
  ];
  
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              await signOut();
              router.replace('/'); // Reset stack to landing page
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'There was a problem logging you out. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={styles.avatarContainer}>
            {userProfile.photo ? (
              <Image source={{ uri: userProfile.photo }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {userProfile.name.split(' ').map(n => n[0]).join('')}
                </Text>
              </View>
            )}
            <TouchableOpacity style={styles.editAvatarButton}>
              <Feather name="camera" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{userProfile.name}</Text>
          <Text style={styles.profileEmail}>{userProfile.email}</Text>
          <Text style={styles.profileRole}>{userProfile.role}</Text>
        </View>
      </View>
      
      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.onPress}>
            <View style={styles.menuIconContainer}>
              <Feather name={item.icon} size={22} color={Colors.primary.main} />
            </View>
            <Text style={styles.menuTitle}>{item.title}</Text>
            {item.badge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            )}
            <Feather name="chevron-right" size={20} color={Colors.light.text.tertiary} />
          </TouchableOpacity>
        ))}
      </View>
      
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Feather name="log-out" size={20} color={Colors.status.error.main} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
      
      <Text style={styles.versionText}>Version 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    backgroundColor: Colors.light.card.light,
    padding: 14,
    paddingBottom: 2,
  },
  profileInfo: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary.dark,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text.primary,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.light.text.secondary,
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    color: Colors.primary.main,
    fontWeight: '500',
  },
  menuContainer: {
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.divider,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.card.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 16,
    color: Colors.light.text.primary,
    flex: 1,
  },
  badge: {
    backgroundColor: Colors.status.error.main,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: Colors.status.error.lighter,
    borderRadius: 8,
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    color: Colors.status.error.main,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 30,
    fontSize: 12,
    color: Colors.light.text.tertiary,
  },
}); 