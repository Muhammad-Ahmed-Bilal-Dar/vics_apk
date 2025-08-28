import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (mobile: string, password: string) => Promise<boolean>;
  signUp: (name: string, mobile: string, password: string, email?: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const loadUser = async () => {
      try {
        const userJson = await AsyncStorage.getItem('user');
        if (userJson) {
          setUser(JSON.parse(userJson));
        }
      } catch (error) {
        console.error('Failed to load user from storage', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const signIn = async (mobile: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      // Call the real API
      const response = await fetch('http://13.215.173.212:8081/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: mobile,
          pin: password,
        }),
      });
      if (!response.ok) {
        return false;
      }
      const data = await response.json();
      // You may need to adjust this based on the actual API response structure
      if (data && data.user) {
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Sign in failed', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (
    name: string, 
    mobile: string, 
    password: string,
    email?: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      // In a real app, this would be an API call to register
      // For demo purposes, we'll simulate a successful registration
      const mockUser: User = {
        id: '123456',
        name,
        mobile,
        email,
        phone: mobile, // Use mobile as initial phone
        address: '',
        city: ''
      };
      
      // Save user to AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
      return true;
    } catch (error) {
      console.error('Sign up failed', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>): Promise<boolean> => {
    try {
      if (!user) return false;
      
      // Update user data
      const updatedUser = { ...user, ...userData };
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update state
      setUser(updatedUser);
      
      return true;
    } catch (error) {
      console.error('Update user failed', error);
      return false;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Sign out failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Default empty component to satisfy Expo Router's requirement
export default function AuthContextComponent() {
  return null;
} 