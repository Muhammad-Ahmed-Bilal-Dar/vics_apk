import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Alert, BackHandler, Dimensions, Image, Platform, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { Colors, Spacing } from '../theme/theme';

// Define types for the service items
type ServiceItem = {
  route: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
};

const BUTTONS_URDU = [
  { label: ' اپوائنٹمنٹ حاصل کریں', nav: '/appointment', icon: require('../../assets/images/New_license.png') },
  { label: 'معائنہ کی تاریخ', nav: '/screens/history', icon: require('../../assets/images/inspection_history.png') },
  { label: 'ای-سرٹیفکیٹ', nav: '/screens/MyCertificates', icon: require('../../assets/images/E_certification.png') },
  { label: 'فٹنس ویریفکیشن سرٹیفکیٹ', nav: '/screens/CertificationScreen', icon: require('../../assets/images/Vehicle_license_verification.png') },
];
const BUTTONS_EN = [
  { label: 'Get Appointment', nav: '/appointment', icon: require('../../assets/images/New_license.png') },
  { label: 'Inspection History', nav: '/screens/history', icon: require('../../assets/images/inspection_history.png') },
  { label: 'E-Certificate', nav: '/screens/MyCertificates', icon: require('../../assets/images/E_certification.png') },
  { label: 'Fitness Verification Certificate', nav: '/screens/CertificationScreen', icon: require('../../assets/images/Vehicle_license_verification.png') },
];
const screenWidth = Dimensions.get('window').width;
const gridButtonWidth = (screenWidth - 40) / 2; // Reduce margin to allow larger buttons

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const theme = useTheme();
  const router = useRouter();
  const [isUrdu, setIsUrdu] = useState(true);

  // Get the user's initials for the avatar
  const getUserInitials = () => {
    if (!user?.name) return 'MA';
    const names = user.name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  // Service items with proper typing
  const serviceItems: ServiceItem[] = [
    {
      route: '/screens/CertificationScreen',
      icon: 'document-text-outline',
      label: 'View Certification',
    },
    {
      route: '/screens/BookingsScreen',
      icon: 'calendar-outline',
      label: 'Bookings',
    },
    {
      route: '/screens/GuideScreen',
      icon: 'help-circle-outline',
      label: 'Guide',
    },
  ];

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'android' && user) {
        const onBackPress = () => {
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
                    router.replace('/');
                  } catch (error) {
                    Alert.alert('Error', 'There was a problem logging you out. Please try again.');
                  }
                },
              },
            ],
            { cancelable: true }
          );
          return true;
        };
        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => subscription.remove();
      }
    }, [user, signOut, router])
  );

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <StatusBar style="auto" />
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={[Colors.primary.default, Colors.primary.light]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.header}
        >
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{getUserInitials()}</Text>
              </View>
              
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user?.name || 'Muhammad'}</Text>
                <View style={styles.loyaltyPoints}>
                  <Ionicons name="call" size={20} color="#FFD700" />
                  <Text style={styles.loyaltyText}>03234673497</Text>
                </View>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={() => Alert.alert('Notifications', 'No new notifications.')}
              activeOpacity={0.7}
            >
              <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
              {/* <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>3</Text>
              </View> */}
            </TouchableOpacity>
          </View>
        </LinearGradient>
        <View style={styles.headerCurve} />
      </View>
      
      <View style={styles.translateButtonRowBottom}>
          <TouchableOpacity
            style={styles.translateButton}
            onPress={() => setIsUrdu((prev) => !prev)}
            activeOpacity={0.7}
            accessibilityLabel="Translate grid labels"
          >
            <Text style={styles.translateButtonTextBottom}>{isUrdu ? 'اردو' : 'English'}</Text>
            <Ionicons name="chevron-down" size={18} color="#40cf45" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.serviceCardsContainer}>
          <View style={styles.serviceButtonsRow}>
            {/* ... service cards code ... */}
          </View>
        </View>
        <View style={styles.gridContainer}>
          {(isUrdu ? BUTTONS_URDU : BUTTONS_EN).reduce<Array<{label: string, nav: string, icon: any}>[]>((rows, btn, idx, arr) => {
            if (idx % 2 === 0) rows.push(arr.slice(idx, idx + 2));
            return rows;
          }, []).map((row, rowIdx) => (
            <View style={styles.gridRow} key={rowIdx}>
              {row.map((btn, btnIdx) => (
                <Pressable
                  key={btn.label}
                  onPress={() => router.push(btn.nav as any)}
                  style={({ pressed }) => [
                    styles.gridButton,
                    row.length === 1 ? { width: screenWidth - 40 } : { width: gridButtonWidth },
                    pressed && styles.gridButtonPressed,
                  ]}
                >
                  <View style={styles.gridIconContainer}>
                    <Image source={btn.icon} style={styles.gridIcon} resizeMode="contain" />
                  </View>
                  <Text style={isUrdu ? styles.gridButtonText : styles.gridButtonTextEn}>{btn.label}</Text>
                </Pressable>
              ))}
            </View>
          ))}
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerContainer: {
    position: 'relative',
  },
  header: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.l,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerCurve: {
    position: 'absolute',
    bottom: -20,
    left: -2,
    right: -2,
    height: 40,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 0,
    paddingBottom: 80, // Additional padding for bottom navigation
  },
  
  gridContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  gridButton: {
    backgroundColor: '#e6f2e7',
    borderRadius: 28,
    height: 130,
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    transform: [{ scale: 1 }],
  },
  gridButtonPressed: {
    backgroundColor: '#0cad17',
    shadowOpacity: 0.35,
    transform: [{ scale: 0.97 }],
  },
  gridButtonText: {
    color: '#222',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'NotoNastaliqUrdu', // If available, otherwise default
  },
  gridButtonTextEn: {
    color: '#222',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  
  // User profile styles
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.card.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  loyaltyPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  loyaltyText: {
    fontSize: 16,
    color: 'white',
    marginLeft: 8,
    marginRight: 8,
  },
  serviceCardsContainer: {
    marginBottom: 3,
    marginTop: 0,
  },
  serviceButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 18,
  },
  translateButtonRowBottom: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '95%',
    marginBottom: 8,
    zIndex: 20,
    
  },
  translateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 0,
    zIndex: 21,
  },
  translateButtonTextBottom: {
    color: '#40cf45',
    fontWeight: 'bold',
    fontSize: 20,
    fontFamily: 'NotoNastaliqUrdu',
  },
  gridIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  gridIcon: {
    width: 54,
    height: 54,
  },
}); 