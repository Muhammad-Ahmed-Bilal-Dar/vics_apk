import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import SplashScreen from './screens/SplashScreen';

// This is the entry point of the app that shows the splash screen
export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    // Navigate to the main index page after 4 seconds
    const timeout = setTimeout(() => {
      router.replace('/');
    }, 4000);

    return () => clearTimeout(timeout);
  }, []);

  return <SplashScreen />;
} 