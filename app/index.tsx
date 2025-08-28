import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, BackHandler, Dimensions, Image, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Card, IconButton, Surface, Text } from 'react-native-paper';
import Animated, {
  Extrapolate,
  FadeIn,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import YoutubeIframe from 'react-native-youtube-iframe';
import { useAuth } from './context/AuthContext';
import { Colors } from './theme/theme';

const { width, height } = Dimensions.get('window');
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

// Define certification data type
type CertificationType = {
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
  safety: {
    brakes: string;
    lights: string;
    steering: string;
    suspension: string;
    tires: string;
  };
};

// Dummy certification data
const dummyCertification: CertificationType = {
  vehicleNumber: "ABC-1234",
  owner: "Muhammad Ahmed",
  vehicleType: "Toyota Corolla",
  inspectionDate: "2023-10-15",
  expiryDate: "2024-10-15",
  status: "PASSED",
  center: "Lahore Center",
  certificateNumber: "VICS-LC-2023-12345",
  emissions: {
    co2: "Pass",
    nox: "Pass",
    pm: "Pass"
  },
  safety: {
    brakes: "Pass",
    lights: "Pass",
    steering: "Pass",
    suspension: "Pass",
    tires: "Pass"
  }
};

// Translation object for all static text
const translations = {
  mainTitle: {
    en: "Vehicle Safety is not an option - It's the Law!",
    ur: "سلامت گاڑی ایک آپشن نہیں قانون ہے",
  },
  verificationTitle: {
    en: 'Vehicle Verification',
    ur: 'گاڑی کی تصدیق',
  },
  inputLabel: {
    en: 'Enter vehicle registration number',
    ur: 'اپنی گاڑی کا رجسٹریشن نمبر درج کریں',
  },
  searchPlaceholder: {
    en: 'FORMAT: ABC-00-0000, ABC 0000',
    ur: 'فارمیٹ: ABC-00-0000, ABC 0000',
  },
  search: {
    en: 'Search',
    ur: 'تلاش کریں',
  },
  vendorTitle: {
    en: 'Vendor Registration',
    ur: 'وینڈر رجسٹریشن',
  },
  vendorDesc: {
    en: 'Register your business as a vendor and provide services through the VICS platform.',
    ur: 'اپنا کاروبار وینڈر کے طور پر رجسٹر کریں اور VICS پلیٹ فارم کے ذریعے خدمات فراہم کریں۔',
  },
  becomeVendor: {
    en: 'Become a Vendor',
    ur: 'وینڈر بنیں',
  },
  appointment: {
    en: 'Book Inspection',
    ur: 'انسپیکشن بُک کریں',
  },
  infoCardTitle: {
    en: 'A Revolutionary Step by the Government of Punjab',
    ur: 'حکومت پنجاب کا انقلابی قدم',
  },
  infoText1: {
    en: 'Government of Punjab in collaboration with VICS is taking a substantial step towards regulatory duty in the field of road safety and environmental protection by introducing a provincial, computerized & standardized Vehicle Inspection & Certification System. Service Vehicles operating in Punjab will be digitally inspected by these centers.',
    ur: 'حکومت پنجاب نے VICS کے تعاون سے روڈ سیفٹی اور ماحولیاتی تحفظ کے لیے ایک صوبائی، کمپیوٹرائزڈ اور معیاری گاڑیوں کی جانچ اور سرٹیفیکیشن سسٹم متعارف کرایا ہے۔ پنجاب میں چلنے والی سروس گاڑیاں ان مراکز میں ڈیجیٹل طور پر چیک کی جائیں گی۔',
  },
  infoText2: {
    en: 'Computerized inspection system ensures that the vehicle is safe to ply on public roads and highways and to ensure air quality standards within Punjab.',
    ur: 'کمپیوٹرائزڈ جانچ سسٹم اس بات کو یقینی بناتا ہے کہ گاڑی عوامی سڑکوں اور شاہراہوں پر چلنے کے لیے محفوظ ہے اور پنجاب میں ہوا کے معیار کے معیار کو یقینی بناتا ہے۔',
  },
  infoText3: {
    en: 'VICS (Vehicle Inspection & Certification Open Inspector (Pvt) Ltd) is establishing 39 VICS centers all over Punjab & constructing permanent state-of-the-art inspection centers with the Government of Punjab. VICS has been inaugurated in Rawalpindi & key regions of Punjab to start its operations.',
    ur: 'VICS پنجاب بھر میں 39 مراکز قائم کر رہا ہے اور حکومت پنجاب کے ساتھ مل کر جدید ترین معائنہ مراکز تعمیر کر رہا ہے۔ VICS نے راولپنڈی اور پنجاب کے اہم علاقوں میں اپنے آپریشنز کا آغاز کر دیا ہے۔',
  },
  sectionTitle: {
    en: 'Safe & Environment Friendly',
    ur: 'محفوظ اور ماحول دوست',
  },
  sectionText1: {
    en: 'The need for a Vehicle Inspection & Certification System (VICS) in Punjab:',
    ur: 'پنجاب میں گاڑیوں کی جانچ اور سرٹیفیکیشن سسٹم (VICS) کی ضرورت:',
  },
  sectionText2: {
    en: 'Pakistan is country of 230 Million people which makes it the fifth most populous country with approximately 23 Million cars, owned and maintained by local individuals. With increasing population, requirements for transport, trade and other activities are pulling up the roads, increasing the chances of road accidents and injury due to mechanical failure and unregulated pollution is causing deterioration of air quality and population health.',
    ur: 'پاکستان 230 ملین آبادی کے ساتھ پانچواں سب سے زیادہ آبادی والا ملک ہے، جس میں تقریباً 23 ملین گاڑیاں مقامی افراد کی ملکیت اور دیکھ بھال میں ہیں۔ آبادی میں اضافے کے ساتھ، ٹرانسپورٹ، تجارت اور دیگر سرگرمیوں کی ضروریات سڑکوں پر دباؤ ڈال رہی ہیں، جس سے روڈ حادثات اور چوٹوں کے امکانات بڑھ رہے ہیں اور غیر منظم آلودگی ہوا کے معیار اور صحت کو متاثر کر رہی ہے۔',
  },
  mainBenefits: {
    en: 'Main Benefits of VICS:',
    ur: 'VICS کے اہم فوائد:',
  },
  benefits: [
    {
      en: '• Reduced fatalities and traffic related injuries due to mechanical failure of Public transport vehicles',
      ur: '• پبلک ٹرانسپورٹ گاڑیوں کی مکینیکل خرابی کی وجہ سے اموات اور ٹریفک حادثات میں کمی',
    },
    {
      en: '• Increased transparency in vehicle inspection',
      ur: '• گاڑیوں کی جانچ میں شفافیت میں اضافہ',
    },
    {
      en: '• Promotion of Green Environment & sustainable development',
      ur: '• سبز ماحول اور پائیدار ترقی کا فروغ',
    },
    {
      en: '• Improved vehicle delivery and transparency in vehicle registration',
      ur: '• گاڑیوں کی فراہمی اور رجسٹریشن میں شفافیت میں بہتری',
    },
    {
      en: '• Increased citizen confidence in the transportation ecosystem',
      ur: '• ٹرانسپورٹیشن ایکو سسٹم میں شہریوں کے اعتماد میں اضافہ',
    },
    {
      en: '• Promoting employment opportunities',
      ur: '• روزگار کے مواقع میں اضافہ',
    },
  ],
  cta: {
    en: 'MAKE YOUR APPOINTMENT NOW',
    ur: 'اپنے ایپوینٹمنٹ بنائیں',
  },
  footerText: {
    en: 'For Online Appointments, Click Here',
    ur: 'آن لائن اپوائنٹمنٹ کے لیے یہاں کلک کریں',
  },
  footerContact: {
    en: 'Appointments Call: 042-111-123',
    ur: 'اپوائنٹمنٹ کال: 042-111-123',
  },
  serviceProviderTitle: {
    en: 'Service Provider Registration',
    ur: 'سروس فراہم کنندہ رجسٹریشن',
  },
  serviceProviderDesc: {
    en: 'Register your business as a service provider and provide services through the VICS platform.',
    ur: 'اپنا کاروبار سروس فراہم کنندہ کے طور پر رجسٹر کریں اور VICS پلیٹ فارم کے ذریعے خدمات فراہم کریں۔',
  },
  becomeServiceProvider: {
    en: 'Become a Service Provider',
    ur: 'سروس فراہم کنندہ بنیں',
  },
};

export default function Index() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [playing, setPlaying] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollY = useSharedValue(0);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [showCertification, setShowCertification] = useState(false);
  const [certificationData, setCertificationData] = useState<CertificationType | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isUrdu, setIsUrdu] = useState(false);

  // Animation shared values
  const headerOpacity = useSharedValue(0);
  const mainTitleScale = useSharedValue(0.9);
  const buttonScale = useSharedValue(0.95);

  // Define scroll thresholds for animations
  const videoThreshold = 50;
  const titleThreshold = 150;
  const infoCardThreshold = 450;
  const ctaThreshold = 1200;
  const footerThreshold = 1400;

  // Set up scroll handler
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  useEffect(() => {
    // Run entrance animations when component mounts
    headerOpacity.value = withTiming(1, { duration: 800 });
    mainTitleScale.value = withSpring(1, { damping: 15, stiffness: 100 });
    buttonScale.value = withSpring(1, { damping: 15, stiffness: 100 });
    
    if (!isLoading && user) {
      router.replace('/(tabs)/dashboard');
    }
    // Do NOT redirect to /login if not logged in
  }, [user, isLoading, router]);

  // Handle Android back button to exit app on landing page when logged out
  useEffect(() => {
    if (Platform.OS === 'android' && !user && !isLoading) {
      let backPressed = false;
      const onBackPress = () => {
        if (router.canGoBack()) {
          router.back();
        } else {
          if (!backPressed) {
            backPressed = true;
            BackHandler.exitApp();
          }
        }
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }
  }, [user, isLoading, router]);

  // Complete vehicle verification - matches CertificationScreen implementation
  // This ensures consistent verification behavior across both screens
  const handleVerification = () => {
    if (vehicleNumber.trim() === "ABC-1234") {
      setCertificationData(dummyCertification);
      setShowCertification(true);
      // Scroll to the certification card
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 400, animated: true });
      }, 100);
    } else if (vehicleNumber.trim()) {
      // Show a message for other vehicle numbers
      Alert.alert(
        "Verification Failed",
        "No certification found for this vehicle number. Try ABC-1234 for demo.",
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

  // Complete download certification function - matches CertificationScreen implementation
  const handleDownload = () => {
    // Force set certification data if it's not already set
    if (!certificationData) {
      setCertificationData(dummyCertification);
    }
    
    // Set modal visible and log for debugging
    setModalVisible(true);
    console.log("Modal should be visible now", { modalVisible: true, certificationData });
  };

  // Animated styles
  const headerAnimStyle = useAnimatedStyle(() => {
    const elevation = interpolate(
      scrollY.value,
      [0, 50],
      [0, 8],
      Extrapolate.CLAMP
    );
    
    const shadowOpacity = interpolate(
      scrollY.value,
      [0, 50],
      [0.1, 0.3],
      Extrapolate.CLAMP
    );
    
    return {
      opacity: headerOpacity.value,
      shadowOpacity,
      elevation,
      transform: [
        { 
          translateY: interpolate(
            scrollY.value, 
            [0, 100], 
            [0, -5], 
            Extrapolate.CLAMP
          ) 
        }
      ]
    };
  });

  const mainTitleAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: mainTitleScale.value },
        { 
          translateY: interpolate(
            scrollY.value, 
            [0, 150], 
            [0, -20], 
            Extrapolate.CLAMP
          ) 
        }
      ],
      opacity: interpolate(
        scrollY.value,
        [0, 400],
        [1, 0.85],
        Extrapolate.CLAMP
      )
    };
  });

  const videoAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { 
          scale: interpolate(
            scrollY.value,
            [0, 200],
            [1, 0.98],
            Extrapolate.CLAMP
          ) 
        },
      ],
      opacity: interpolate(
        scrollY.value,
        [0, 300],
        [1, 0.9],
        Extrapolate.CLAMP
      )
    };
  });

  const infoCardAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { 
          translateX: interpolate(
            scrollY.value,
            [infoCardThreshold - 100, infoCardThreshold],
            [-width, 0],
            Extrapolate.CLAMP
          ) 
        }
      ]
    };
  });

  const ctaButtonAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { 
          scale: interpolate(
            scrollY.value,
            [ctaThreshold - 200, ctaThreshold],
            [0.8, 1],
            Extrapolate.CLAMP
          )
        }
      ],
      opacity: interpolate(
        scrollY.value,
        [ctaThreshold - 200, ctaThreshold],
        [0, 1],
        Extrapolate.CLAMP
      )
    };
  });

  const buttonAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  const footerAnimStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        scrollY.value,
        [footerThreshold - 200, footerThreshold],
        [0, 1],
        Extrapolate.CLAMP
      ),
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [footerThreshold - 200, footerThreshold],
            [30, 0],
            Extrapolate.CLAMP
          )
        }
      ]
    };
  });

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
                onPress={handleDownload}
                iconColor="#009688"
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
            
            <Text style={styles.sectionTitle}>Safety Inspection</Text>
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
            </View>
          </Card.Content>
          <Card.Actions>
            <Button 
              onPress={handleDownload} 
              mode="contained" 
              style={styles.downloadButton}
              labelStyle={{color: 'white', fontWeight: 'bold'}}
            >
              Download Certificate
            </Button>
            <Button onPress={() => setShowCertification(false)} style={styles.closeButton}>
              Close
            </Button>
          </Card.Actions>
        </Card>
      </Animated.View>
    );
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
                {Object.entries(certificationData.safety).map(([key, value], index) => (
                  <View key={index} style={styles.reportRow}>
                    <Text style={styles.reportLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}:</Text>
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
                onPress={() => {
                  setModalVisible(false);
                  Alert.alert(
                    "Download Complete",
                    "Certificate PDF has been saved to your device."
                  );
                }}
              >
                Save as PDF
              </Button>
              <Button
                mode="outlined"
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}
              >
                Close
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Define the grid buttons
  const landingButtons = [
    {
      key: 'verification',
      label: isUrdu ? 'فٹنس ویریفکیشن سرٹیفکیٹ' : 'Fitness Verification Certificate',
      onPress: () => router.push('/screens/CertificationScreen' as any),
      icon: require('../assets/images/Vehicle_license_verification.png'),
    },
    {
      key: 'serviceProvider',
      label: isUrdu ? 'سروس فراہم کنندہ بنیں' : 'Become a Service Provider',
      // 
      onPress: () => {
        Linking.openURL('https://lawmis.punjab.gov.pk/lawmis');
      },
      icon: require('../assets/images/New_license.png'),
    },
    {
      key: 'appointment',
      label: isUrdu ? translations.appointment.ur : translations.appointment.en,
      onPress: () => router.push('/login'),
      icon: require('../assets/images/renew_license.png'),
    },
    {
      key: 'ownstation',
      label: isUrdu ? 'اسٹیشن رجسٹریشن' : 'Station Registration',
      onPress: () => {
        Linking.openURL('https://lawmis.punjab.gov.pk/lawmis');
      },
      icon: require('../assets/images/inspection_history.png'),
    },
  ];

  const screenWidth = Dimensions.get('window').width;
  const gridButtonWidth = (screenWidth - 40) / 2;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976D2" />
      </View>
    );
  }

  // Show the landing page if user is not logged in
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View style={[styles.headerContainer, { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }, headerAnimStyle]}>
          <Image 
            source={require('../assets/images/logo-header.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
        
        <AnimatedScrollView 
          ref={scrollViewRef}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          contentContainerStyle={[styles.scrollContent, { paddingTop: 70 }]} // Add padding to account for fixed header
          showsVerticalScrollIndicator={false}
        >
          {/* YouTube Video replacing Banner Image */}
          <Animated.View 
            style={[styles.bannerContainer, videoAnimStyle]}
            entering={FadeIn.duration(800).delay(200)}
          >
            <YoutubeIframe
              height={200}
              width={width - 32} // Adjust for padding
              play={playing}
              videoId="vJ_FJWFaCIQ" // Replace with your YouTube video ID
              onChangeState={(event: string) => {
                if (event === 'ended') {
                  setPlaying(false);
                }
              }}
            />
          </Animated.View>
          
          <View style={styles.contentContainer}>
            {/* Main Title with animation */}
            <Animated.Text 
              style={[styles.mainTitle, mainTitleAnimStyle]}
              entering={FadeIn.duration(1000).delay(400)}
            >
              {isUrdu ? translations.mainTitle.ur : translations.mainTitle.en}
            </Animated.Text>
            
            {/* Language Toggle Button */}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', width: '100%', marginBottom: 8 }}>
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2, elevation: 2, borderWidth: 0 }}
                onPress={() => setIsUrdu((prev) => !prev)}
                activeOpacity={0.7}
                accessibilityLabel="Translate grid labels"
              >
                <Text style={{ color: '#40cf45', fontWeight: 'bold', fontSize: 20, fontFamily: 'NotoNastaliqUrdu' }}>{isUrdu ? 'اردو' : 'English'}</Text>
                <Ionicons name="chevron-down" size={18} color="#40cf45" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>
            <View style={styles.gridContainer}>
              {landingButtons.reduce((rows: any[][], btn, idx, arr) => {
                if (idx % 2 === 0) rows.push(arr.slice(idx, idx + 2));
                return rows;
              }, []).map((row: any[], rowIdx: number) => (
                <View style={styles.gridRow} key={rowIdx}>
                  {row.map((btn: any) => (
                    <Pressable
                      key={btn.key}
                      onPress={btn.onPress}
                      style={({ pressed }) => [
                        styles.gridButton,
                        { width: gridButtonWidth },
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
            
            {/* Info Card */}
            <Surface style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>
                {isUrdu ? translations.infoCardTitle.ur : translations.infoCardTitle.en}
              </Text>
              <Text style={styles.infoText}>
                {isUrdu ? translations.infoText1.ur : translations.infoText1.en}
              </Text>
              <Text style={styles.infoText}>
                {isUrdu ? translations.infoText2.ur : translations.infoText2.en}
              </Text>
              <Text style={styles.infoText}>
                {isUrdu ? translations.infoText3.ur : translations.infoText3.en}
              </Text>
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>{isUrdu ? translations.sectionTitle.ur : translations.sectionTitle.en}</Text>
                <Text style={styles.infoText}>{isUrdu ? translations.sectionText1.ur : translations.sectionText1.en}</Text>
                <Text style={styles.infoText}>{isUrdu ? translations.sectionText2.ur : translations.sectionText2.en}</Text>
              </View>
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>{isUrdu ? translations.mainBenefits.ur : translations.mainBenefits.en}</Text>
                <View style={styles.benefitsList}>
                  {translations.benefits.map((b, i) => (
                    <Text style={styles.benefitItem} key={i}>{isUrdu ? b.ur : b.en}</Text>
                  ))}
                </View>
              </View>
            </Surface>
            
            {/* Certification Result */}
            {renderCertificationCard()}

            {/* Footer (always visible, with logos and text) */}
            
              <Text style={styles.footerText}>
                {isUrdu ? translations.footerText.ur : translations.footerText.en}
              </Text>
              <Text style={styles.footerContact}>
                {isUrdu ? translations.footerContact.ur : translations.footerContact.en}
              </Text>
              {/* Footer Logos */}
              <View style={styles.footerLogosContainer}>
                <Image 
                  source={require('../assets/images/punjab-logo.png')} 
                  style={styles.footerLogo}
                  resizeMode="contain"
                />
                <Image 
                  source={require('../assets/images/PTA-logo.png')} 
                  style={styles.footerLogo}
                  resizeMode="contain"
                />
                <Image 
                  source={require('../assets/images/transport-loho.png')} 
                  style={styles.footerLogo}
                  resizeMode="contain"
                />
              </View>
            
          </View>
        </AnimatedScrollView>
      </SafeAreaView>
    );
  }

  return (
    <>
      {renderCertificationCard()}
      {renderCertificationPopup()}
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 32,
    paddingHorizontal: 0,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 19,
    backgroundColor: '#0cad17',
    
    paddingHorizontal: 16,
    width: '100%',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 8,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
  },
  logo: {
    width: 100,
    height: 80,
    marginTop: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  bannerContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 8,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: 180,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  verificationContainer: {
    padding: 16,
    borderRadius: 12,
    elevation: 4,
    marginBottom: 24,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(0, 150, 136, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  verificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#009688',
    alignSelf: 'center',

  },
  searchContainer: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 12,
    color: '#555',
    marginBottom: 8,
    alignSelf: 'center',
  },
  searchInput: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
    backgroundColor: '#f9f9f9',
    color: '#050505',
  },
  appointmentButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  audioButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.background,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  searchButton: {
    backgroundColor: '#0cad17',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 2,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 18,
    color: '#555',
    marginBottom: 16,
    textAlign: 'center',
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    elevation: 4,
    marginBottom: 24,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#009688',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
  },
  sectionContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#009688',
    marginBottom: 8,
  },
  benefitsList: {
    marginLeft: 8,
  },
  benefitItem: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 6,
  },
  ctaButton: {
    backgroundColor: '#0cad17',
    paddingVertical: 12,
    marginBottom: 24,
    borderRadius: 8,
    elevation: 2,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  footer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#1976D2',
    marginBottom: 8,
  },
  footerContact: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#009688',
    marginBottom: 24,
  },
  footerLogosContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
  },
  footerLogo: {
    width: 80,
    height: 80,
    marginHorizontal: 10,
  },
  certificationCard: {
    marginBottom: 24,
    elevation: 4,
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
    borderLeftWidth: 4,
    borderLeftColor: '#009688',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  certificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  statusBadge: {
    padding: 4,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#009688',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  certificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  certificationLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
    marginRight: 8,
    width: 130,
  },
  certificationValue: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  testResultsContainer: {
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
  },
  testItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  testItemLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
    marginRight: 8,
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
    backgroundColor: '#009688',
    paddingVertical: 8,
    paddingHorizontal: 24,
    marginRight: 8,
    borderRadius: 8,
  },
  closeButton: {
    borderColor: '#888',
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
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
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
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#009688',
  },
  modalScrollView: {
    flexGrow: 1,
    maxHeight: 400,
    backgroundColor: 'white',
  },
  reportHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#009688',
  },
  reportSubtitle: {
    fontSize: 14,
    color: '#555',
  },
  reportStatus: {
    padding: 4,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#009688',
    marginTop: 8,
  },
  reportStatusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  reportSection: {
    marginBottom: 12,
  },
  reportSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#009688',
    marginBottom: 8,
  },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  reportLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
  },
  reportValue: {
    fontSize: 14,
    color: '#555',
  },
  reportValueWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportFooter: {
    marginTop: 12,
    alignItems: 'center',
  },
  reportFooterText: {
    fontSize: 14,
    color: '#555',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  modalButton: {
    backgroundColor: '#009688',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  modalCloseButton: {
    borderColor: '#888',
    borderWidth: 1,
    backgroundColor: 'transparent',
    borderRadius: 8,
  },
  becomeServiceProviderContainer: {
    padding: 16,
    borderRadius: 12,
    elevation: 4,
    marginBottom: 24,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(0, 150, 136, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  becomeServiceProviderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#009688',
    marginBottom: 12,
    textAlign: 'center',
  },
  becomeServiceProviderDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 16,
    textAlign: 'center',
  },
  becomeServiceProviderButton: {
    backgroundColor: '#0cad17',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 2,
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
    fontFamily: 'NotoNastaliqUrdu',
  },
  gridButtonTextEn: {
    color: '#222',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Roboto, Arial, sans-serif',
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
  gridContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
    marginBottom: 24,
    width: '100%',
  },
}); 