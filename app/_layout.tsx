import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { enGB, registerTranslation } from 'react-native-paper-dates';
import 'react-native-reanimated';
import { AuthProvider } from './context/AuthContext';
import theme from './theme/theme';

// Register translations for the date picker
registerTranslation('en-GB', enGB);

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  // Create theme based on color scheme
  const paperTheme = colorScheme === 'dark' 
    ? { ...MD3DarkTheme, colors: { ...MD3DarkTheme.colors, ...theme.Colors.dark } } 
    : { ...MD3LightTheme, colors: { ...MD3LightTheme.colors, ...theme.Colors.light } };
    
  const navigationTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <PaperProvider theme={paperTheme}>
      <ThemeProvider value={navigationTheme}>
        <AuthProvider>
          <StatusBar style="auto" />
          <Stack>
            <Stack.Screen name="splash" options={{ headerShown: false }} />
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" options={{ headerShown: false }} />
            <Stack.Screen name="screens/history" options={{ headerShown: false }} />
            <Stack.Screen name="screens/BookingsScreen" options={{ headerShown: false }} />
            <Stack.Screen name="screens/AccountSettingsScreen" options={{ headerShown: false }} />
            <Stack.Screen name="screens/MyCertificates" options={{ headerShown: false }} />
            <Stack.Screen name="screens/CertificationScreen" options={{ headerShown: false }} />
            <Stack.Screen name="choose-vendor-type" options={{ headerShown: false, title: 'Choose Service Provider Type' }} />
            <Stack.Screen name="distributor" options={{ headerShown: false }} />
            <Stack.Screen name="station-registration" options={{ headerShown: false }} />
            <Stack.Screen name="screens/epay" options={{ headerShown: false, title: 'ePay Payment' }} />
          </Stack>
        </AuthProvider>
      </ThemeProvider>
    </PaperProvider>
  );
}
