import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Card, IconButton, Surface, Text, TextInput } from 'react-native-paper';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import vicsData from '../../dataset/vics_dataset.json';
import { inputTheme } from '../theme/authStyles';
import { Colors, Spacing } from '../theme/theme';

// Define certification data type based on JSON

type EmissionsTestType = {
  CO2: number;
  NOX: number;
  PM: number;
};

type CertificateJSONType = {
  certificate_no: string;
  status: string;
  title: string;
  vehicle_number: string;
  owner: string;
  vehicle_type: string;
  inspection_date: string;
  expiry_date: string;
  inspection_center: string;
  emissions_test: EmissionsTestType;
};

// UI type
export type CertificationType = {
  vehicleNumber: string;
  owner: string;
  vehicleType: string;
  inspectionDate: string;
  expiryDate: string;
  status: string;
  center: string;
  certificateNumber: string;
  emissions: {
    co2: string;
    nox: string;
    pm: string;
  };
  // Optionally add safety if you want
};

// Helper to map JSON to UI type
function mapCertificate(json: CertificateJSONType): CertificationType {
  // For demo, treat pass/fail by title, and show numbers for emissions
  return {
    vehicleNumber: json.vehicle_number,
    owner: json.owner,
    vehicleType: json.vehicle_type,
    inspectionDate: json.inspection_date,
    expiryDate: json.expiry_date,
    status: json.title.toUpperCase() === 'PASS' ? 'PASSED' : 'FAILED',
    center: json.inspection_center,
    certificateNumber: json.certificate_no,
    emissions: {
      co2: `${json.emissions_test.CO2}`,
      nox: `${json.emissions_test.NOX}`,
      pm: `${json.emissions_test.PM}`,
    },
  };
}

export default function CertificationScreen() {
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [showCertification, setShowCertification] = useState(false);
  const [certificationData, setCertificationData] = useState<CertificationType | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Handle vehicle verification
  const handleVerification = () => {
    const regNum = registrationNumber.trim().toUpperCase();
    // Search both arrays
    const cert = (
      (vicsData.vehicle_fitness_verification as CertificateJSONType[])
        .concat(vicsData.vehicle_e_certificates as CertificateJSONType[])
    ).find(c => c.vehicle_number.toUpperCase() === regNum);
    if (cert) {
      setCertificationData(mapCertificate(cert));
      setShowCertification(true);
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 400, animated: true });
      }, 100);
    } else if (registrationNumber.trim()) {
      Alert.alert(
        "Verification Failed",
        "No certification found for this vehicle number.",
        [{ text: "OK" }]
      );
    } else {
      Alert.alert(
        "Input Required",
        "Please enter a vehicle registration number.",
        [{ text: "OK" }]
      );
    }
  };

  // Handle download certification
  const handleDownload = () => {
    // Force set certification data if it's not already set
    if (!certificationData) {
      // setCertificationData(dummyCertification); // Removed dummyCertification
    }
    
    // Set modal visible and log for debugging
    setModalVisible(true);
    console.log("Modal should be visible now", { modalVisible: true, certificationData });
  };

  // Render certification popup
  const renderCertificationPopup = () => {
    if (!modalVisible || !certificationData) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Vehicle Certification Report</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScrollView}>
              <View style={styles.reportHeader}>
                <Text style={styles.reportTitle}>VICS CERTIFICATE</Text>
                <Text style={styles.reportSubtitle}>Vehicle Inspection & Certification System</Text>
                <View style={styles.reportStatus}>
                  <Text style={styles.reportStatusText}>{certificationData.status}</Text>
                </View>
              </View>
              
              <View style={styles.reportSection}>
                <Text style={styles.reportSectionTitle}>Certificate Information</Text>
                <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>Certificate Number:</Text>
                  <Text style={styles.reportValue}>{certificationData.certificateNumber}</Text>
                </View>
                <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>Inspection Center:</Text>
                  <Text style={styles.reportValue}>{certificationData.center}</Text>
                </View>
                <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>Inspection Date:</Text>
                  <Text style={styles.reportValue}>{certificationData.inspectionDate}</Text>
                </View>
                <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>Expiry Date:</Text>
                  <Text style={styles.reportValue}>{certificationData.expiryDate}</Text>
                </View>
              </View>
              
              <View style={styles.reportSection}>
                <Text style={styles.reportSectionTitle}>Vehicle Information</Text>
                <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>Registration Number:</Text>
                  <Text style={styles.reportValue}>{certificationData.vehicleNumber}</Text>
                </View>
                <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>Vehicle Type:</Text>
                  <Text style={styles.reportValue}>{certificationData.vehicleType}</Text>
                </View>
                <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>Owner:</Text>
                  <Text style={styles.reportValue}>{certificationData.owner}</Text>
                </View>
              </View>
              
              <View style={styles.reportSection}>
                <Text style={styles.reportSectionTitle}>Emissions Test Results</Text>
                {Object.entries(certificationData.emissions).map(([key, value], index) => (
                  <View key={index} style={styles.reportRow}>
                    <Text style={styles.reportLabel}>{key.toUpperCase()}:</Text>
                    <View style={styles.reportValueWithIcon}>
                      <Ionicons
                        name={value === "Pass" ? "checkmark-circle" : "close-circle"}
                        size={16}
                        color={value === "Pass" ? "#4CAF50" : "#F44336"}
                      />
                      <Text 
                        style={[
                          styles.reportValue, 
                          { color: value === "Pass" ? "#4CAF50" : "#F44336" }
                        ]}
                      >
                        {value}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
              
              <View style={styles.reportSection}>
                <Text style={styles.reportSectionTitle}>Safety Inspection Results</Text>
                {/* Safety inspection results are not available in the current vics_dataset.json */}
                {/* If you need to add safety inspection data, you would map it here */}
                <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>Brakes:</Text>
                  <View style={styles.reportValueWithIcon}>
                    <Ionicons name="close-circle" size={16} color="#F44336" />
                    <Text style={styles.reportValue}>N/A</Text>
                  </View>
                </View>
                <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>Lights:</Text>
                  <View style={styles.reportValueWithIcon}>
                    <Ionicons name="close-circle" size={16} color="#F44336" />
                    <Text style={styles.reportValue}>N/A</Text>
                  </View>
                </View>
                <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>Steering:</Text>
                  <View style={styles.reportValueWithIcon}>
                    <Ionicons name="close-circle" size={16} color="#F44336" />
                    <Text style={styles.reportValue}>N/A</Text>
                  </View>
                </View>
                <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>Suspension:</Text>
                  <View style={styles.reportValueWithIcon}>
                    <Ionicons name="close-circle" size={16} color="#F44336" />
                    <Text style={styles.reportValue}>N/A</Text>
                  </View>
                </View>
                <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>Tires:</Text>
                  <View style={styles.reportValueWithIcon}>
                    <Ionicons name="close-circle" size={16} color="#F44336" />
                    <Text style={styles.reportValue}>N/A</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.reportFooter}>
                <Text style={styles.reportFooterText}>
                  This is an official certification document issued by VICS.
                </Text>
                <Text style={styles.reportFooterText}>
                  Valid until: {certificationData.expiryDate}
                </Text>
              </View>
            </ScrollView>
            
            <View style={styles.modalActions}>
              <Button
                mode="contained"
                style={styles.modalButton}
                onPress={() => {}}
              >
                Save as PDF
              </Button>
              <Button
                mode="outlined"
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}
                labelStyle={{ color: Colors.primary.default, fontWeight: 'bold' }}
              >
                Close
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Render certification card
  const renderCertificationCard = () => {
    if (!showCertification || !certificationData) return null;

    return (
      <Animated.View entering={FadeIn.duration(800)}>
        <Card style={styles.certificationCard}>
          <Card.Title 
            title="Vehicle Certification" 
            subtitle={`Certificate #${certificationData.certificateNumber}`}
            right={(props) => (
              <IconButton 
                {...props} 
                icon="download" 
                onPress={() => {}}
                iconColor={Colors.primary.default}
              />
            )}
          />
          <Card.Content>
            <View style={styles.certificationHeader}>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{certificationData.status}</Text>
              </View>
            </View>
            
            <View style={styles.certificationRow}>
              <Text style={styles.certificationLabel}>Vehicle Number:</Text>
              <Text style={styles.certificationValue}>{certificationData.vehicleNumber}</Text>
            </View>
            
            <View style={styles.certificationRow}>
              <Text style={styles.certificationLabel}>Owner:</Text>
              <Text style={styles.certificationValue}>{certificationData.owner}</Text>
            </View>
            
            <View style={styles.certificationRow}>
              <Text style={styles.certificationLabel}>Vehicle Type:</Text>
              <Text style={styles.certificationValue}>{certificationData.vehicleType}</Text>
            </View>
            
            <View style={styles.certificationRow}>
              <Text style={styles.certificationLabel}>Inspection Date:</Text>
              <Text style={styles.certificationValue}>{certificationData.inspectionDate}</Text>
            </View>
            
            <View style={styles.certificationRow}>
              <Text style={styles.certificationLabel}>Expiry Date:</Text>
              <Text style={styles.certificationValue}>{certificationData.expiryDate}</Text>
            </View>
            
            <View style={styles.certificationRow}>
              <Text style={styles.certificationLabel}>Inspection Center:</Text>
              <Text style={styles.certificationValue}>{certificationData.center}</Text>
            </View>
            
            <View style={styles.divider} />
            
            <Text style={styles.sectionTitle}>Emissions Test</Text>
            <View style={styles.testResultsContainer}>
              {Object.entries(certificationData.emissions).map(([key, value]) => (
                <View key={key} style={styles.testItem}>
                  <Text style={styles.testItemLabel}>{key.toUpperCase()}</Text>
                  <View style={styles.testItemValue}>
                    <Ionicons
                      name={value === "Pass" ? "checkmark-circle" : "close-circle"}
                      size={16}
                      color={value === "Pass" ? "#4CAF50" : "#F44336"}
                    />
                    <Text style={[styles.testItemText, { color: value === "Pass" ? "#4CAF50" : "#F44336" }]}>
                      {value}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
            
            {/* <Text style={styles.sectionTitle}>Safety Inspection</Text>
            <View style={styles.testResultsContainer}>
              {Object.entries(certificationData.safety).map(([key, value]) => (
                <View key={key} style={styles.testItem}>
                  <Text style={styles.testItemLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                  <View style={styles.testItemValue}>
                    <Ionicons
                      name={value === "Pass" ? "checkmark-circle" : "close-circle"}
                      size={16}
                      color={value === "Pass" ? "#4CAF50" : "#F44336"}
                    />
                    <Text style={[styles.testItemText, { color: value === "Pass" ? "#4CAF50" : "#F44336" }]}>
                      {value}
                    </Text>
                  </View>
                </View>
              ))}
            </View> */}
          </Card.Content>
          <Card.Actions>
            <Button 
              onPress={() => {}}
              mode="contained" 
              style={styles.downloadButton}
              labelStyle={{color: 'white', fontWeight: 'bold'}}
            >
              Download Certificate
            </Button>
            <Button 
              onPress={() => setShowCertification(false)} 
              style={styles.closeButton}
              labelStyle={{ color: Colors.primary.default, fontWeight: 'bold' }}
            >
              Close
            </Button>
          </Card.Actions>
        </Card>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <LinearGradient
        colors={[Colors.primary.main, Colors.primary.light]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.headerGradient}
      >
        <Text style={styles.headerTitle}>Certificate Verification</Text>
      </LinearGradient>
      <StatusBar style="auto" />
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
      >
        <Surface style={styles.verificationContainer}>
          <Text style={styles.verificationTitle}>Vehicle Certificate Verification</Text>
          <View style={styles.searchContainer}>
            <Text style={styles.inputLabel}>Enter vehicle registration number</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="FORMAT: ABC-00-0000, ABC 0000"
              value={registrationNumber}
              onChangeText={setRegistrationNumber}
              placeholderTextColor="#888"
              theme={inputTheme}
            />
            <Button
              mode="contained"
              style={styles.searchButton}
              labelStyle={styles.searchButtonText}
              onPress={handleVerification}
            >
              Search
            </Button>
          </View>
        </Surface>
        
        {/* Certification Result */}
        {renderCertificationCard()}
        
        <Surface style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Why Verify?</Text>
          <Text style={styles.infoText}>
            Vehicle fitness verification ensures your vehicle meets safety and emission standards.
            A verified vehicle certificate is required for registration renewal and insurance claims.
          </Text>
          
          <Text style={styles.infoTitle}>What You'll Need</Text>
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.infoItemText}>Valid registration number</Text>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.infoItemText}>Ownership details</Text>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.infoItemText}>Recent inspection report (if applicable)</Text>
            </View>
          </View>
        </Surface>
      </ScrollView>
      
      {/* Certification Popup - Render outside ScrollView */}
      {renderCertificationPopup()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'left',
  },
  scrollContent: {
    padding: Spacing.m,
    paddingBottom: 80, // Additional padding to ensure content is visible above bottom nav
  },
  verificationContainer: {
    padding: Spacing.l,
    borderRadius: 12,
    elevation: 4,
    marginBottom: Spacing.l,
    backgroundColor: 'white',
  },
  verificationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  searchContainer: {
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    color: Colors.text.primary  ,
    fontWeight: '600',
  },
  searchInput: {
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#000',
  },
  searchButton: {
    backgroundColor: Colors.primary.default,
    borderRadius: 8,
    marginTop: 8,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  infoContainer: {
    padding: Spacing.l,
    borderRadius: 12,
    elevation: 4,
    backgroundColor: 'white',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: Colors.text.primary,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  infoList: {
    marginTop: 4,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary.default,
    marginRight: 8,
  },
  infoItemText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  certificationCard: {
    marginBottom: Spacing.m,
    elevation: 4,
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary.default,
  },
  certificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: Spacing.m,
  },
  statusBadge: {
    padding: Spacing.s,
    paddingHorizontal: Spacing.m,
    borderRadius: 8,
    backgroundColor: Colors.primary.default,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  certificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.s,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  certificationLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: Spacing.s,
    width: 130,
    color: Colors.text.primary,
  },
  certificationValue: {
    fontSize: 14,
    flex: 1,
    color: Colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: Spacing.m,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: Spacing.m,
    color: Colors.primary.default,
  },
  testResultsContainer: {
    marginBottom: Spacing.m,
    backgroundColor: '#f9f9f9',
    padding: Spacing.m,
    borderRadius: 8,
  },
  testItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.s,
  },
  testItemLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: Spacing.s,
    color: Colors.text.primary,
  },
  testItemValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testItemText: {
    fontSize: 14,
    marginLeft: 4,
  },
  downloadButton: {
    backgroundColor: '#0cad17',
    borderRadius: 8,
    marginRight: Spacing.s,
  },
  closeButton: {
    borderColor: Colors.text.secondary,
    borderWidth: 1,
    backgroundColor: 'transparent',
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: Spacing.l,
    borderRadius: 12,
    width: '90%',
    maxHeight: '90%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.m,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  modalScrollView: {
    flexGrow: 1,
    maxHeight: 400,
    backgroundColor: 'white',
  },
  reportHeader: {
    alignItems: 'center',
    marginBottom: Spacing.m,
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    color: Colors.primary.default,
    textAlign: 'center',
  },
  reportSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  reportStatus: {
    padding: Spacing.s,
    paddingHorizontal: Spacing.m,
    borderRadius: 8,
    backgroundColor: Colors.primary.default,
  },
  reportStatusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  reportSection: {
    marginBottom: Spacing.m,
  },
  reportSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: Spacing.m,
    color: Colors.text.primary,
  },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.s,
  },
  reportLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  reportValue: {
    fontSize: 14,
    color: '#333',
  },
  reportValueWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportFooter: {
    marginTop: Spacing.m,
    alignItems: 'center',
  },
  reportFooterText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.m,
  },
  modalButton: {
    backgroundColor: '#0cad17',
    borderRadius: 8,
  },
  modalCloseButton: {
    borderColor: Colors.text.secondary,
    borderWidth: 1,
    backgroundColor: 'transparent',
    borderRadius: 8,
  },
}); 


export const options = {
  headerTitle: () => (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
        External Page
      </Text>
      <Text style={{ color: 'white', fontSize: 12 }}>With Subtitle</Text>
    </View>
  ),
  headerBackground: () => (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={{ flex: 1 }}
    />
  ),
  headerStyle: {
    height: 100,
    backgroundColor: 'transparent',
  },
  headerTitleAlign: 'center',
};
// kakak