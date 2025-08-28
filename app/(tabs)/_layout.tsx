import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import CustomTabButton from '../components/CustomTabButton';
import { Colors } from '../theme/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary.main,
        tabBarInactiveTintColor: Colors.gray["500"],
        headerShown: true,
        headerStyle: {
          height: 100, // Increased height to start below status bar
          shadowColor: Colors.common.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 5,
          // backgroundColor: () => (<LinearGradient colors={['#000000', '#000000']} />),
          // alignItems:'center',
        },
        headerBackground: () => (<LinearGradient colors={[Colors.primary.default, Colors.primary.light]}  
          style={{ flex: 1 }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />),
        headerTitleStyle: {
          // color: Colors.light.text.primary,
          fontSize: 24,
          paddingLeft: 20,
          fontWeight: '800',
          textAlign: 'center',
          color:"white",
          // alignItems:'center',
        },
        tabBarStyle: {
          position: 'absolute',
          bottom: 2,
          left: 20,
          right: 20,
          elevation: 0,
          backgroundColor: Colors.light.card.light,
          borderRadius: 15,
          height: 60,
          shadowColor: Colors.common.black,
          shadowOffset: {
            width: 0,
            height: 10,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.5,
        },
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          paddingBottom: 2,
        },
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          headerTitle: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <Feather name="home" size={24} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="location"
        options={{
          title: 'Location',
          headerTitle: 'Inspection Centers',
          tabBarIcon: ({ color, focused }) => (
            <Feather name="map" size={24} color={color} />
          ),
          // headerShown: false,
        }}
      />
      <Tabs.Screen
        name="appointment"
        options={{
          title: 'Inspection',
          headerTitle: 'Book Appointment',
          tabBarIcon: ({ color }) => (
            <Feather name="clipboard" size={24} color={color} />
          ),
          tabBarButton: (props) => (
            <CustomTabButton {...props} />
          ),
          // headerShown: false,
        }}
      />
      <Tabs.Screen
        name="payment"
        options={{
          title: 'Payment',
          headerTitle: 'Payments',
          tabBarIcon: ({ color, focused }) => (
            <Feather name="credit-card" size={24} color={color} />
          ),
          // headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerTitle: 'My Profile',
          tabBarIcon: ({ color, focused }) => (
            <Feather name="user" size={24} color={color} />
            ),
          // headerShown: false,
        }}
      />
    </Tabs>
  );
}
