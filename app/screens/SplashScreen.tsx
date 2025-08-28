import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, Platform, StyleSheet, Text, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [bgImageError, setBgImageError] = useState(false);
  const [logoImageError, setLogoImageError] = useState(false);

  useEffect(() => {
    // Fade in the background first
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // After a short delay, animate the logo
    setTimeout(() => {
      // Animate the logo with a sequence
      Animated.sequence([
        // First, fade in with scale
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
        ]),
        
        // Then, slight bounce effect
        Animated.spring(scaleAnim, {
          toValue: 1.05,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        
        // Return to normal size
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }, 500);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* Background - Either image or fallback color */}
      {!bgImageError ? (
        <Animated.Image
          source={require('../../assets/images/splashwithnespak.png')}
          style={[
            styles.backgroundImage,
            {
              opacity: opacityAnim,
            },
          ]}
          resizeMode="cover"
          onError={() => setBgImageError(true)}
        />
      ) : (
        <Animated.View 
          style={[
            styles.fallbackBackground,
            { opacity: opacityAnim }
          ]} 
        />
      )}
      
      {/* Animated Logo or Fallback Text */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {!logoImageError ? (
          <Image
            source={require('../assets/ad.png')}
            style={styles.logoImage}
            resizeMode="contain"
            onError={() => setLogoImageError(true)}
          />
        ) : (
          <View style={styles.fallbackLogo}>
            <Text style={styles.fallbackText}>VICS</Text>
            <Text style={styles.fallbackSubtext}>Vehicle Inspection & Certification System</Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00441B', // Fallback color matching green theme
  },
  backgroundImage: {
    position: 'absolute',
    width,
    height,
    top: 0,
    left: 0,
  },
  fallbackBackground: {
    position: 'absolute',
    width,
    height,
    top: 0,
    left: 0,
    backgroundColor: '#00441B',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  logoImage: {
    width: width * 0.8,
    height: height * 0.4,
  },
  fallbackLogo: {
    width: width * 0.8,
    height: height * 0.4,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  fallbackText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#00441B',
    marginBottom: 10,
  },
  fallbackSubtext: {
    fontSize: 16,
    color: '#00441B',
    textAlign: 'center',
  },
}); 