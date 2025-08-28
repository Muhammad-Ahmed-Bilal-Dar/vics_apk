import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../theme/theme';

export default function GuideScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vehicle Inspection Guide</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.guideContainer}>
          <Text style={styles.guideTitle}>Before Your Appointment</Text>
          <View style={styles.guideItem}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" style={styles.guideIcon} />
            <Text style={styles.guideText}>Ensure your vehicle documents are up to date</Text>
          </View>
          <View style={styles.guideItem}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" style={styles.guideIcon} />
            <Text style={styles.guideText}>Check all lights, signals, and horn functionality</Text>
          </View>
          <View style={styles.guideItem}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" style={styles.guideIcon} />
            <Text style={styles.guideText}>Ensure tires are in good condition and properly inflated</Text>
          </View>
          <View style={styles.guideItem}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" style={styles.guideIcon} />
            <Text style={styles.guideText}>Check the braking system and fluid levels</Text>
          </View>
        </Surface>
        
        <Surface style={styles.guideContainer}>
          <Text style={styles.guideTitle}>During Inspection</Text>
          <View style={styles.guideItem}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" style={styles.guideIcon} />
            <Text style={styles.guideText}>Present all required documents to the inspector</Text>
          </View>
          <View style={styles.guideItem}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" style={styles.guideIcon} />
            <Text style={styles.guideText}>Follow all instructions from inspection staff</Text>
          </View>
          <View style={styles.guideItem}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" style={styles.guideIcon} />
            <Text style={styles.guideText}>Be prepared for brake testing and emissions check</Text>
          </View>
          <View style={styles.guideItem}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" style={styles.guideIcon} />
            <Text style={styles.guideText}>Stay with your vehicle unless instructed otherwise</Text>
          </View>
        </Surface>
        
        <Surface style={styles.guideContainer}>
          <Text style={styles.guideTitle}>After Inspection</Text>
          <View style={styles.guideItem}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" style={styles.guideIcon} />
            <Text style={styles.guideText}>Collect your inspection certificate</Text>
          </View>
          <View style={styles.guideItem}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" style={styles.guideIcon} />
            <Text style={styles.guideText}>Fix any identified issues promptly if required</Text>
          </View>
          <View style={styles.guideItem}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" style={styles.guideIcon} />
            <Text style={styles.guideText}>Keep your certificate in a safe place</Text>
          </View>
          <View style={styles.guideItem}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" style={styles.guideIcon} />
            <Text style={styles.guideText}>Schedule your next inspection before expiry</Text>
          </View>
        </Surface>
        
        <Surface style={styles.guideContainer}>
          <Text style={styles.guideTitle}>Required Documents</Text>
          <View style={styles.guideItem}>
            <Ionicons name="document-text" size={24} color="#1976D2" style={styles.guideIcon} />
            <Text style={styles.guideText}>Vehicle registration certificate</Text>
          </View>
          <View style={styles.guideItem}>
            <Ionicons name="document-text" size={24} color="#1976D2" style={styles.guideIcon} />
            <Text style={styles.guideText}>Driver's license</Text>
          </View>
          <View style={styles.guideItem}>
            <Ionicons name="document-text" size={24} color="#1976D2" style={styles.guideIcon} />
            <Text style={styles.guideText}>Insurance policy document</Text>
          </View>
          <View style={styles.guideItem}>
            <Ionicons name="document-text" size={24} color="#1976D2" style={styles.guideIcon} />
            <Text style={styles.guideText}>Previous inspection certificate (if any)</Text>
          </View>
          <View style={styles.guideItem}>
            <Ionicons name="document-text" size={24} color="#1976D2" style={styles.guideIcon} />
            <Text style={styles.guideText}>Proof of payment</Text>
          </View>
        </Surface>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.m,
    backgroundColor: Colors.primary.default,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  scrollContent: {
    padding: Spacing.m,
    paddingBottom: 80, // Additional padding for bottom nav
  },
  guideContainer: {
    padding: Spacing.l,
    borderRadius: 12,
    elevation: 3,
    marginBottom: 16,
    backgroundColor: 'white',
  },
  guideTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: Colors.text.primary,
  },
  guideItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  guideIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  guideText: {
    fontSize: 16,
    color: Colors.text.secondary,
    flex: 1,
    lineHeight: 22,
  },
}); 