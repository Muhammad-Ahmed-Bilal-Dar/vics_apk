import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { Button, Divider, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { inputTheme } from '../theme/authStyles';
import { Colors } from '../theme/theme';

export default function AccountSettingsScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  
  // Initial form state with user data
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
  });
  
  const [isEditing, setIsEditing] = useState(false);
  
  const handleChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };
  
  const handleSave = async () => {
    try {
      // In a real app, this would call an API to update the user profile
      if (updateUser) {
        await updateUser(formData);
        Alert.alert('Success', 'Profile updated successfully');
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };
  
  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      city: user?.city || '',
    });
    setIsEditing(false);
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <LinearGradient
        colors={[Colors.primary.main, Colors.primary.light]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.headerGradient}
      >
        <Text style={styles.headerTitle}>Account Settings</Text>
      </LinearGradient>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.light.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setIsEditing(!isEditing)} 
            style={styles.editButton}
          >
            <Feather 
              name={isEditing ? "x" : "edit-2"} 
              size={20} 
              color={Colors.primary.main} 
            />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <Divider style={styles.divider} />
            
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Name</Text>
              {isEditing ? (
                <TextInput
                  mode="outlined"
                  value={formData.name}
                  onChangeText={(text) => handleChange('name', text)}
                  style={styles.textInput}
                  outlineColor={Colors.light.divider}
                  activeOutlineColor={Colors.primary.main}
                  theme={inputTheme}
                />
              ) : (
                <Text style={styles.fieldValue}>{formData.name || 'Not provided'}</Text>
              )}
            </View>
            
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Email</Text>
              {isEditing ? (
                <TextInput
                  mode="outlined"
                  value={formData.email}
                  onChangeText={(text) => handleChange('email', text)}
                  style={styles.textInput}
                  outlineColor={Colors.light.divider}
                  activeOutlineColor={Colors.primary.main}
                  keyboardType="email-address"
                  theme={inputTheme}
                />
              ) : (
                <Text style={styles.fieldValue}>{formData.email || 'Not provided'}</Text>
              )}
            </View>
            
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Phone Number</Text>
              {isEditing ? (
                <TextInput
                  mode="outlined"
                  value={formData.phone}
                  onChangeText={(text) => handleChange('phone', text)}
                  style={styles.textInput}
                  outlineColor={Colors.light.divider}
                  activeOutlineColor={Colors.primary.main}
                  keyboardType="phone-pad"
                  theme={inputTheme}
                />
              ) : (
                <Text style={styles.fieldValue}>{formData.phone || 'Not provided'}</Text>
              )}
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Address Information</Text>
            <Divider style={styles.divider} />
            
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Address</Text>
              {isEditing ? (
                <TextInput
                  mode="outlined"
                  value={formData.address}
                  onChangeText={(text) => handleChange('address', text)}
                  style={styles.textInput}
                  outlineColor={Colors.light.divider}
                  activeOutlineColor={Colors.primary.main}
                  theme={inputTheme}
                />
              ) : (
                <Text style={styles.fieldValue}>{formData.address || 'Not provided'}</Text>
              )}
            </View>
            
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>City</Text>
              {isEditing ? (
                <TextInput
                  mode="outlined"
                  value={formData.city}
                  onChangeText={(text) => handleChange('city', text)}
                  style={styles.textInput}
                  outlineColor={Colors.light.divider}
                  activeOutlineColor={Colors.primary.main}
                  theme={inputTheme}
                />
              ) : (
                <Text style={styles.fieldValue}>{formData.city || 'Not provided'}</Text>
              )}
            </View>
          </View>
          
          {isEditing && (
            <View style={styles.buttonContainer}>
              <Button 
                mode="outlined" 
                onPress={handleCancel}
                style={styles.cancelButton}
                labelStyle={styles.cancelButtonLabel}
              >
                Cancel
              </Button>
              <Button 
                mode="contained" 
                onPress={handleSave}
                style={styles.saveButton}
              >
                Save Changes
              </Button>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.divider,
    backgroundColor: Colors.light.card.default,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'left',
  },
  editButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: Colors.light.card.default,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.text.primary,
    marginBottom: 8,
  },
  divider: {
    marginBottom: 16,
    backgroundColor: Colors.light.divider,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    color: Colors.light.text.secondary,
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
    color: Colors.light.text.primary,
    paddingVertical: 8,
  },
  textInput: {
    backgroundColor: Colors.light.card.light,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    borderColor: Colors.primary.main,
  },
  cancelButtonLabel: {
    color: Colors.primary.main,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#0cad17',
  },
  headerGradient: {
    width: '100%',
    height: 120,
    paddingHorizontal: 24,
    paddingTop: 32,
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
}); 