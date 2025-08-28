import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Formik } from 'formik';
import { useEffect, useRef, useState } from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  Divider,
  HelperText,
  RadioButton,
  Surface,
  Text,
  TextInput,
  Title,
  TouchableRipple
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Yup from 'yup';
import vicsData from '../../dataset/vics_dataset.json';
import { Colors, Spacing } from '../theme/theme';



// Helper to get JSON station info by city and UI station name
const getStationInfo = (city: string, stationName: string) => {
  if (!city || !stationName) return null;
  const cityKey = city.charAt(0).toUpperCase() + city.slice(1); // e.g., lahore -> Lahore
  const stations = (vicsData.station_information as any)[cityKey];
  if (!stations) return null;
  // Try to match by name (UI name contains JSON name or vice versa)
  return stations.find((s: any) => stationName.toLowerCase().includes(s.station_name.toLowerCase()) || s.station_name.toLowerCase().includes(stationName.toLowerCase()));
};

// Validation schema
const AppointmentSchema = Yup.object().shape({
  registrationNumber: Yup.string()
    .required('Vehicle registration number is required'),
    // .matches(/^[a-zA-Z]{3}-\d{3}$|^[a-zA-Z]{2}-\d{4}$/i, 'Format should be ABC-123 or AB-1234'),
    // .matches(/^[a-zA-Z]{1,2,3}-\d{1,2,3,4}$|^[a-zA-Z]{2}-\d{4}$/i, 'Format should be ABC-123 or AB-1234'),
  date: Yup.date().required('Date is required'),
  city: Yup.string().required('City is required'),
  stationId: Yup.string().required('Please select a station'),
  timeSlot: Yup.string().required('Please select a time slot'),
});

interface AppointmentValues {
  registrationNumber: string;
  date: Date | undefined;
  city: string;
  stationId: string;
  timeSlot: string;
}

// Helper function to safely format dates
const formatDate = (date: Date | undefined): string => {
  if (!date) return 'Select a date';
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
};

// Helper function to format date for calendar marking
const formatDateForMarking = (date: Date | undefined): string => {
  if (!date) return '';
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
};

// Add helper to check if a date is a weekend or 14 August
const isWeekendOr14August = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDay(); // 0 = Sunday, 6 = Saturday
  // Check for 14 August (any year)
  const is14August = date.getDate() === 14 && date.getMonth() === 7; // August is month 7 (0-indexed)
  return day === 0 || day === 6 || is14August;
};

export default function AppointmentScreen() {
  const [success, setSuccess] = useState(false);
  const [vehicleFound, setVehicleFound] = useState(false);
  const [vehicleData, setVehicleData] = useState<any>(null);
  const [psidNumber, setPsidNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [calendarVisible, setCalendarVisible] = useState(false);

  // Cascading selection states
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  const [filteredStations, setFilteredStations] = useState<any[]>([]);

  // Audio refs and states
  const carNumberSoundRef = useRef<Audio.Sound | null>(null);
  const carDetailsSoundRef = useRef<Audio.Sound | null>(null);
  const dateSelectionSoundRef = useRef<Audio.Sound | null>(null);
  const appointmentDetailsSoundRef = useRef<Audio.Sound | null>(null);
  const psidSoundRef = useRef<Audio.Sound | null>(null);
  const [isCarNumberPlaying, setIsCarNumberPlaying] = useState(false);
  const [isCarDetailsPlaying, setIsCarDetailsPlaying] = useState(false);
  const [isDateSelectionPlaying, setIsDateSelectionPlaying] = useState(false);
  const [isAppointmentDetailsPlaying, setIsAppointmentDetailsPlaying] = useState(false);
  const [isPSIDPlaying, setIsPSIDPlaying] = useState(false);

  // Add state for available dates and slots
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  const navigation = useNavigation();
  const router = useRouter();

  // Get available cities from the JSON data
  const cityKeys: string[] = Object.keys((vicsData.station_information as any));

  // Handle city selection
  const handleCitySelect = (cityKey: string, setFieldValue: any) => {
    setSelectedCity(cityKey);
    setSelectedArea('');
    setFieldValue('city', cityKey);
    setFieldValue('stationId', '');
    
    // Get areas for selected city
    const stations = (vicsData.station_information as any)[cityKey] || [];
    const areas = [...new Set(stations.map((station: any) => station.area as string))] as string[];
    setAvailableAreas(areas);
    setFilteredStations([]);
  };

  // Handle area selection
  const handleAreaSelect = (area: string, setFieldValue: any) => {
    setSelectedArea(area);
    setFieldValue('stationId', '');
    
    // Filter stations by selected city and area
    const allStations = (vicsData.station_information as any)[selectedCity] || [];
    const stationsInArea = allStations.filter((station: any) => station.area === area);
    setFilteredStations(stationsInArea);
  };

  // Toggle play/stop for car number audio
  const toggleCarNumberAudio = async () => {
    try {
      if (isCarNumberPlaying && carNumberSoundRef.current) {
        await carNumberSoundRef.current.stopAsync();
        await carNumberSoundRef.current.unloadAsync();
        carNumberSoundRef.current = null;
        setIsCarNumberPlaying(false);
        return;
      }
      if (carNumberSoundRef.current) {
        await carNumberSoundRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/audios/enter car number.mp3')
      );
      carNumberSoundRef.current = sound;
      setIsCarNumberPlaying(true);
      sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (!status.isLoaded || status.didJustFinish) {
          setIsCarNumberPlaying(false);
        }
      });
      await sound.playAsync();
    } catch (error) {
      setIsCarNumberPlaying(false);
    }
  };

  // Toggle play/stop for car details audio
  const toggleCarDetailsAudio = async () => {
    try {
      if (isCarDetailsPlaying && carDetailsSoundRef.current) {
        await carDetailsSoundRef.current.stopAsync();
        await carDetailsSoundRef.current.unloadAsync();
        carDetailsSoundRef.current = null;
        setIsCarDetailsPlaying(false);
        return;
      }
      if (carDetailsSoundRef.current) {
        await carDetailsSoundRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/audios/after car details.mp3')
      );
      carDetailsSoundRef.current = sound;
      setIsCarDetailsPlaying(true);
      sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (!status.isLoaded || status.didJustFinish) {
          setIsCarDetailsPlaying(false);
        }
      });
      await sound.playAsync();
    } catch (error) {
      setIsCarDetailsPlaying(false);
    }
  };

  // Toggle play/stop for date selection audio
  const toggleDateSelectionAudio = async () => {
    try {
      if (isDateSelectionPlaying && dateSelectionSoundRef.current) {
        await dateSelectionSoundRef.current.stopAsync();
        await dateSelectionSoundRef.current.unloadAsync();
        dateSelectionSoundRef.current = null;
        setIsDateSelectionPlaying(false);
        return;
      }
      if (dateSelectionSoundRef.current) {
        await dateSelectionSoundRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/audios/date seletion.mp3')
      );
      dateSelectionSoundRef.current = sound;
      setIsDateSelectionPlaying(true);
      sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (!status.isLoaded || status.didJustFinish) {
          setIsDateSelectionPlaying(false);
        }
      });
      await sound.playAsync();
    } catch (error) {
      setIsDateSelectionPlaying(false);
    }
  };

  // Toggle play/stop for appointment details audio
  const toggleAppointmentDetailsAudio = async () => {
    try {
      if (isAppointmentDetailsPlaying && appointmentDetailsSoundRef.current) {
        await appointmentDetailsSoundRef.current.stopAsync();
        await appointmentDetailsSoundRef.current.unloadAsync();
        appointmentDetailsSoundRef.current = null;
        setIsAppointmentDetailsPlaying(false);
        return;
      }
      if (appointmentDetailsSoundRef.current) {
        await appointmentDetailsSoundRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/audios/appointment details.mp3')
      );
      appointmentDetailsSoundRef.current = sound;
      setIsAppointmentDetailsPlaying(true);
      sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (!status.isLoaded || status.didJustFinish) {
          setIsAppointmentDetailsPlaying(false);
        }
      });
      await sound.playAsync();
    } catch (error) {
      setIsAppointmentDetailsPlaying(false);
    }
  };

  // Toggle play/stop for PSID audio
  const togglePSIDAudio = async () => {
    try {
      if (isPSIDPlaying && psidSoundRef.current) {
        await psidSoundRef.current.stopAsync();
        await psidSoundRef.current.unloadAsync();
        psidSoundRef.current = null;
        setIsPSIDPlaying(false);
        return;
      }
      if (psidSoundRef.current) {
        await psidSoundRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/audios/PSID.mp3')
      );
      psidSoundRef.current = sound;
      setIsPSIDPlaying(true);
      sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (!status.isLoaded || status.didJustFinish) {
          setIsPSIDPlaying(false);
        }
      });
      await sound.playAsync();
    } catch (error) {
      setIsPSIDPlaying(false);
    }
  };

  // Cleanup audio on component unmount
  useEffect(() => {
    return () => {
      if (carNumberSoundRef.current) {
        carNumberSoundRef.current.stopAsync();
        carNumberSoundRef.current.unloadAsync();
      }
      if (carDetailsSoundRef.current) {
        carDetailsSoundRef.current.stopAsync();
        carDetailsSoundRef.current.unloadAsync();
      }
      if (dateSelectionSoundRef.current) {
        dateSelectionSoundRef.current.stopAsync();
        dateSelectionSoundRef.current.unloadAsync();
      }
      if (appointmentDetailsSoundRef.current) {
        appointmentDetailsSoundRef.current.stopAsync();
        appointmentDetailsSoundRef.current.unloadAsync();
      }
      if (psidSoundRef.current) {
        psidSoundRef.current.stopAsync();
        psidSoundRef.current.unloadAsync();
      }
    };
  }, []);

  // Update available dates when station changes
  // useEffect(() => {
  //   if (!values.city || !values.stationId) {
  //     setAvailableDates([]);
  //     setAvailableTimeSlots([]);
  //     return;
  //   }
  //   const stationObj = stationsByCity[values.city as keyof typeof stationsByCity].find(s => s.id === values.stationId);
  //   if (!stationObj) return;
  //   const stationInfo = getStationInfo(values.city, stationObj.name);
  //   if (stationInfo) {
  //     setAvailableDates(stationInfo.available_dates || []);
  //     setAvailableTimeSlots([]); // Reset slots until date is picked
  //   } else {
  //     setAvailableDates([]);
  //     setAvailableTimeSlots([]);
  //   }
  // }, [values.city, values.stationId]);

  // Update available time slots when date changes
  // useEffect(() => {
  //   if (!values.city || !values.stationId || !values.date) {
  //     setAvailableTimeSlots([]);
  //     return;
  //   }
  //   const stationObj = stationsByCity[values.city as keyof typeof stationsByCity].find(s => s.id === values.stationId);
  //   if (!stationObj) return;
  //   const stationInfo = getStationInfo(values.city, stationObj.name);
  //   // Only show slots if selected date is in available_dates
  //   const dateStr = values.date.toISOString().split('T')[0];
  //   if (stationInfo && stationInfo.available_dates && stationInfo.available_dates.includes(dateStr)) {
  //     setAvailableTimeSlots(stationInfo.available_time_slots || []);
  //   } else {
  //     setAvailableTimeSlots([]);
  //   }
  // }, [values.city, values.stationId, values.date]);

  // Check if vehicle exists when registration number changes
  const handleRegistrationChange = (value: string, setFieldValue: any) => {
    setFieldValue('registrationNumber', value);
  };

  const handleVehicleLookup = (value: string) => {
    // Don't proceed if the value contains spaces
    if (value.includes(' ')) {
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const regNum = value.trim().toUpperCase();
      // Search in vicsData.vehicle_information
      const found = (vicsData.vehicle_information as any[]).find(
        v => v.vehicle_registration_number.toUpperCase() === regNum
      );
      if (found) {
        // Map JSON fields to UI fields
        setVehicleData({
          vehicleName: found.vehicle_name,
          variant: found.variant,
          color: found.color,
          year: found["model year"],
          owner: found.owner,
          engineNumber: '', // Not available in JSON
          chassisNumber: found.chassis,
          registration: found.registration,
          status: '', // Not available in JSON
        });
        setVehicleFound(true);
      } else {
        setVehicleFound(false);
        setVehicleData(null);
      }
      setLoading(false);
    }, 1000);
  };

  // Generate a random PSID number
  const generatePSID = () => {
    const randomNum = Math.floor(Math.random() * 1000000);
    return `VICS-${randomNum.toString().padStart(6, '0')}`;
  };

  const onSubmitAppointment = async (values: any, actions: any) => {
    console.log('onSubmitAppointment called with values:', values);
    try {
      console.log('Setting loading state...');
      setLoading(true);
      
      // Generate PSID for the appointment
      console.log('Generating PSID...');
      const newPSID = generatePSID();
      setPsidNumber(newPSID);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Here you would normally send the data to your API
      console.log('Appointment booked:', values);
      
      // Set success after API call succeeds
      setSuccess(true);
    } catch (error) {
      console.error('Error booking appointment:', error);
    } finally {
      setLoading(false);
      if (actions?.setSubmitting) {
        actions.setSubmitting(false);
      }
    }
  };

  const handleCloseSuccess = () => {
    setSuccess(false);
    setVehicleFound(false);
    setVehicleData(null);
    setPsidNumber('');
    setCurrentStep(1);
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepPress = (step: number) => {
    // Only allow moving to completed steps or the next step
    if (step <= currentStep || step === currentStep + 1) {
      setCurrentStep(step);
    }
  };

  // Handle selecting a date from the calendar
  const handleDateSelect = (date: { dateString: string }, setFieldValue: any) => {
    const selectedDate = new Date(date.dateString);
    setFieldValue('date', selectedDate);
    setCalendarVisible(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      
      
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent,
          { 
            minHeight: '100%',
            paddingBottom: 200 // Extra padding to ensure back buttons are always visible
          }
        ]}
        showsVerticalScrollIndicator={true}
        automaticallyAdjustKeyboardInsets={true}
        style={{ flex: 1 }}
        bounces={true}
        keyboardShouldPersistTaps="handled">
        {success ? (
          <Surface style={styles.successContainer} elevation={4}>
            <LinearGradient
              colors={['#f0f9ef', '#e8f5e9']}
              style={styles.successGradient}
              start={{x: 0, y: 0}}
              end={{x: 0, y: 1}}
            >
              <Ionicons name="checkmark-circle" size={64} color={Colors.status.success.default} />
              <Text style={styles.successText}>
                Appointment Booked!
              </Text>
              
              <View style={styles.psidContainer}>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity onPress={togglePSIDAudio} style={styles.audioButton}>
                    <Ionicons 
                      name={isPSIDPlaying ? 'stop' : 'volume-high'} 
                      size={24} 
                      color={Colors.primary.main} 
                    />
                  </TouchableOpacity>
                <Text style={styles.psidLabel}>
                  Your PSID Number:
                </Text>
                </View>
                <Text style={styles.psidNumber}>
                  {psidNumber}
                </Text>
              </View>
              
              <Text style={styles.successSubtext}>
                Please keep this number for your reference. You'll need it at the inspection center.
              </Text>
              {/* Pay Now / Pay Later buttons */}
              <View style={styles.payButtonsRow}>
                <Button
                  mode="contained"
                  style={styles.payNowButton}
                  buttonColor={Colors.button.default}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                  onPress={() => router.push({ pathname: '/screens/epay', params: { psid: psidNumber, amount: 150 } })}
                >
                  Pay Now
                </Button> 
                <Button
                  mode="outlined"
                  style={styles.payLaterButton}
                  textColor={Colors.button.default}
                  labelStyle={{ color: Colors.button.default, fontWeight: 'bold' }}
                  onPress={() => router.replace('/(tabs)/dashboard')}
                >
                  Pay Later
                </Button>
              </View>
              <View style={[styles.payButtonsRow, { marginTop: 16 }]}>
                <Button
                  mode="contained"
                  style={[styles.payNowButton, { flex:0}]}
                  buttonColor={Colors.button.default}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                  onPress={handleCloseSuccess}
                >
                  Book Another Appointment
                </Button>
              </View>
            </LinearGradient>
          </Surface>
        ) : (
          <Formik
            initialValues={{
              registrationNumber: '',
              date: undefined,
              city: '',
              stationId: '',
              timeSlot: '',
            }}
            validationSchema={AppointmentSchema}
            onSubmit={(values, actions) => {
              console.log('Formik onSubmit triggered');
              onSubmitAppointment(values, actions);
            }}
          >
            {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched, isSubmitting }) => {
              console.log('Form State:', { values, errors, isSubmitting });
              // Fix: define cityKeys and stations here so they are in scope
              const cityKeys: string[] = Object.keys((vicsData.station_information as any));
              const selectedCityKey: string | undefined = cityKeys.find(
                (key: string) => key.toLowerCase() === values.city?.toLowerCase()
              );
              const stations: any[] = selectedCityKey ? (vicsData.station_information as any)[selectedCityKey] : [];
              const stationObj = values.stationId ? stations.find((s: any) => s.station_name === values.stationId) : null;
              const availableDateObjs = stationObj?.available_dates || [];
              const availableDateStrings = availableDateObjs.map((d: any) => d.date);
              const selectedDateStr = values.date && typeof values.date === 'object' && 'toISOString' in values.date
                ? (values.date as Date).toISOString().split('T')[0]
                : undefined;
              const selectedDateObj = availableDateObjs.find((d: any) => d.date === selectedDateStr);
              const isDisabledDate = selectedDateObj && (selectedDateObj.is_weekend || selectedDateObj.is_independence_day);
              const availableTimeSlots = (selectedDateObj && !isDisabledDate)
                ? (selectedDateObj.available_time_slots || [])
                : [];

              useEffect(() => {
                setFieldValue('timeSlot', '');
                // eslint-disable-next-line
              }, [values.stationId, selectedDateStr]);
              return (
                <View>
                  {/* Step indicator */}
                  <View style={styles.stepIndicatorContainer}>
                    <TouchableOpacity 
                      style={styles.stepIndicatorWrapper}
                      onPress={() => handleStepPress(1)}
                      disabled={currentStep < 1}
                    >
                        <Ionicons 
                          name="car" 
                          size={23} 
                          color={currentStep >= 1 ? Colors.primary.main : Colors.text.tertiary} 
                        />
                      <Text style={[
                        styles.stepLabel,
                        currentStep >= 1 && styles.activeStepLabel
                      ]}>Vehicle Information</Text>
                    </TouchableOpacity>

                    <View style={[styles.stepConnector, currentStep >= 2 && styles.activeStepConnector]} />
                    
                    <TouchableOpacity 
                      style={styles.stepIndicatorWrapper}
                      onPress={() => handleStepPress(2)}
                      disabled={currentStep < 2}
                    >
                        <Ionicons 
                          name="location" 
                          size={23} 
                          color={currentStep >= 2 ? Colors.primary.main : Colors.text.tertiary} 
                        />
                      <Text style={[
                        styles.stepLabel,
                        currentStep >= 2 && styles.activeStepLabel
                      ]}>Station Selection</Text>
                    </TouchableOpacity>
                    <View style={[styles.stepConnector, currentStep >= 3 && styles.activeStepConnector]} />
                    
                    <TouchableOpacity 
                      style={styles.stepIndicatorWrapper}
                      onPress={() => handleStepPress(3)}
                      disabled={currentStep < 3}
                    >
                        <Ionicons 
                          name="calendar" 
                          size={22} 
                          color={currentStep >= 3 ? Colors.primary.main : Colors.text.tertiary} 
                        />
                     
                      <Text style={[
                        styles.stepLabel,
                        currentStep >= 3 && styles.activeStepLabel
                      ]}>Date & Time</Text>
                    </TouchableOpacity>
                    <View style={[styles.stepConnector, currentStep >= 4 && styles.activeStepConnector]} />
                    
                    <TouchableOpacity 
                      style={styles.stepIndicatorWrapper}
                      onPress={() => handleStepPress(4)}
                      disabled={currentStep < 4}
                    >
                        <Ionicons 
                          name="checkmark-circle" 
                          size={23} 
                          color={currentStep >= 4 ? Colors.primary.main : Colors.text.tertiary} 
                        />
                      <Text style={[
                        styles.stepLabel,
                        currentStep >= 4 && styles.activeStepLabel
                      ]}>Confirmation</Text>
                    </TouchableOpacity>
                  </View>
                  
                  {/* Step 1: Vehicle Registration */}
                  {currentStep === 1 && (
                    <Card style={styles.card} mode="elevated">
                      <View style={styles.cardIndicator} />
                      <Card.Content style={styles.cardContent}>
                        <View style={styles.stepTitleContainer}>
                          <View style={styles.stepNumberContainer}>
                            <Text style={styles.stepNumber}>1</Text>
                          </View>
                          <View style={styles.stepTextContainer}>
                            <Text style={styles.stepTitle}>Vehicle Information</Text>
                            <Text style={styles.stepDescription}>Enter your vehicle registration number</Text>
                            <Text style={[styles.stepDescription, styles.urduStepDescription]}>اپنی گاڑی کا رجسٹریشن نمبر درج کریں</Text>
                          </View>
                        </View>
                        <Divider style={styles.divider} />
                        
                        {/* Custom License Plate Input */}
                        <View style={styles.licensePlateInputContainer}>
                          <Text style={{ color: Colors.text.secondary, marginTop: 0, textAlign: 'center', fontSize: 12 }}>
                            Format should be ABC-123 or AB-1234
                          </Text>
                          <View style={styles.licensePlateInputInner}>
                        <TextInput
                          value={values.registrationNumber}
                          onChangeText={(text) => handleRegistrationChange(text.replace(/\s/g, ''), setFieldValue)}
                              placeholder="ABC-123"
                              placeholderTextColor="#c0c4c6"
                              style={styles.licensePlateInputText}
                              maxLength={8}
                          autoCapitalize="characters"
                              keyboardType="default"
                              underlineColorAndroid="transparent"
                              selectionColor="#222"
                              textAlign="center"
                              accessibilityLabel="Vehicle Registration Number"
                          error={!!(touched.registrationNumber && errors.registrationNumber)}
                          textColor="#000"
                        />
                          </View>
                          
                        </View>
                        {touched.registrationNumber && errors.registrationNumber && (
                          <Text style={{ color: Colors.status.error.default, marginBottom: 8, textAlign: 'center' }}>{errors.registrationNumber}</Text>
                        )}
                        
                        <Button
                          mode="contained"
                          style={styles.lookupButton}
                          onPress={() => handleVehicleLookup(values.registrationNumber)}
                          loading={loading}
                          buttonColor={Colors.button.default}
                        >
                          <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={toggleCarNumberAudio} style={styles.audioButton}>
                              <Ionicons 
                                name={isCarNumberPlaying ? 'stop' : 'volume-high'} 
                                size={24} 
                                color={Colors.primary.main} 
                              />
                            </TouchableOpacity>
                            <Text style={styles.buttonText}>Look Up Vehicle</Text>
                          </View>
                        </Button>
                        
                        {loading && (
                          <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={Colors.primary.main} />
                            <Text style={styles.loadingText}>
                              Searching for vehicle...
                            </Text>
                          </View>
                        )}
                        
                        {vehicleFound && vehicleData && !loading && (
                          <View style={styles.vehicleResultContainer}>
                            <Surface style={styles.vehicleInfoContainer} elevation={3}>
                              <View style={styles.vehicleHeaderRow}>
                                <View style={styles.vehicleImageContainer}>
                                  <Ionicons name="car" size={40} color={Colors.text.tertiary} />
                                </View>
                                <View style={styles.vehicleHeaderInfo}>
                                  <Title style={styles.vehicleTitle}>
                                    {vehicleData.vehicleName}
                                  </Title>
                                  <Text style={styles.vehicleSubtitle}>{`${vehicleData.variant} • ${vehicleData.year}`}</Text>
                                  
                                </View>
                              </View>
                              
                              <Divider style={styles.vehicleDivider} />
                              
                              <View style={styles.vehicleDetailsGrid}>
                                <View style={styles.vehicleDetailRow}>
                                  <View style={styles.vehicleDetailItem}>
                                    <View style={styles.detailLabelContainer}>
                                      <Ionicons name="person-outline" size={16} color={Colors.text.tertiary} style={styles.detailIcon} />
                                      <Text style={styles.vehicleDetailLabel}>Owner</Text>
                                    </View>
                                    <Text style={styles.vehicleDetailValue}>{vehicleData.owner}</Text>
                                  </View>
                                  
                                  <View style={styles.vehicleDetailItem}>
                                    <View style={styles.detailLabelContainer}>
                                      <Ionicons name="color-palette-outline" size={16} color={Colors.text.tertiary} style={styles.detailIcon} />
                                      <Text style={styles.vehicleDetailLabel}>Color</Text>
                                    </View>
                                    <Text style={styles.vehicleDetailValue}>{vehicleData.color}</Text>
                                  </View>
                                </View>
                                
                                <View style={styles.vehicleDetailRow}>
                                  <View style={styles.vehicleDetailItem}>
                                    <View style={styles.detailLabelContainer}>
                                      <Ionicons name="calendar-outline" size={16} color={Colors.text.tertiary} style={styles.detailIcon} />
                                      <Text style={styles.vehicleDetailLabel}>Registration Date</Text>
                                    </View>
                                    <Text style={styles.vehicleDetailValue}>{vehicleData.registration}</Text>
                                  </View>
                                  
                                  <View style={styles.vehicleDetailItem}>
                                    <View style={styles.detailLabelContainer}>
                                      <Ionicons name="barcode-outline" size={16} color={Colors.text.tertiary} style={styles.detailIcon} />
                                      <Text style={styles.vehicleDetailLabel}>Reg Number</Text>
                                    </View>
                                    <Text style={styles.vehicleDetailValue}>{values.registrationNumber}</Text>
                                  </View>
                                </View>
                                <View style={styles.vehicleDetailRow}>
                                  <View style={styles.vehicleDetailItem}>
                                    <View style={styles.detailLabelContainer}>
                                      <Ionicons name="barcode-outline" size={16} color={Colors.text.tertiary} style={styles.detailIcon} />
                                      <Text style={styles.vehicleDetailLabel}>Chassis #</Text>
                                    </View>
                                    <Text style={styles.vehicleDetailValue}>{vehicleData.chassisNumber.slice(-6)}</Text>
                                  </View>
                                </View>
                              </View>
                              
                              <Button
                                mode="contained"
                                onPress={handleNextStep}
                                style={styles.continueButton}
                                buttonColor={Colors.button.default}
                              >
                                <View style={styles.buttonContainer}>
                                  <TouchableOpacity onPress={toggleCarDetailsAudio} style={styles.audioButton}>
                                    <Ionicons 
                                      name={isCarDetailsPlaying ? 'stop' : 'volume-high'} 
                                      size={24} 
                                      color={Colors.primary.main} 
                                    />
                                  </TouchableOpacity>
                                  <Text style={styles.buttonText}>Continue to Select Station</Text>
                                </View>
                              </Button>
                            </Surface>
                          </View>
                        )}
                        
                        {!vehicleFound && !loading && touched.registrationNumber && (
                          <Surface style={styles.errorContainer} elevation={2}>
                            <Ionicons name="alert-circle" size={24} color={Colors.status.error.default} />
                            <Text style={styles.errorText}>
                              Vehicle not found in our database. Please check the registration number and try again.
                            </Text>
                          </Surface>
                        )}
                      </Card.Content>
                    </Card>
                  )}
                  
                  {/* Step 2: Station Selection */}
                  {currentStep === 2 && (
                    <Card style={styles.card} mode="elevated">
                      <View style={styles.cardIndicator} />
                      <Card.Content style={styles.cardContent}>
                        <View style={styles.stepTitleContainer}>
                          <View style={styles.stepNumberContainer}>
                            <Text style={styles.stepNumber}>2</Text>
                          </View>
                          <View style={styles.stepTextContainer}>
                            <Text style={styles.stepTitle}>Select Station</Text>
                            <Text style={styles.stepDescription}>Choose an inspection center near you</Text>
                          </View>
                        </View>
                        <Divider style={styles.divider} />
                        
                        <View style={styles.citySelectorContainer}>
                          <Text style={styles.citySelectLabel}>Select City:</Text>
                          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cityScrollContainer}>
                            {cityKeys.map((cityKey: string) => (
                              <Button
                                key={cityKey}
                                mode={selectedCity === cityKey ? 'contained' : 'outlined'}
                                onPress={() => handleCitySelect(cityKey, setFieldValue)}
                                style={styles.cityButton}
                                buttonColor={selectedCity === cityKey ? Colors.button.default : undefined}
                                textColor={selectedCity === cityKey ? '#ffffff' : Colors.text.primary}
                                compact={false}
                              >
                                {cityKey}
                              </Button>
                            ))}
                          </ScrollView>
                          {touched.city && errors.city && (
                            <HelperText type="error">{errors.city}</HelperText>
                          )}
                        </View>
                        
                        {/* Area Selection - Only show if city is selected */}
                        {selectedCity && availableAreas.length > 0 && (
                          <View style={styles.areaSelectorContainer}>
                            <Text style={styles.areaSelectLabel}>Select Area in {selectedCity}:</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.areaScrollContainer}>
                              {availableAreas.map((area: string) => (
                                <Button
                                  key={area}
                                  mode={selectedArea === area ? "contained" : "outlined"}
                                  onPress={() => handleAreaSelect(area, setFieldValue)}
                                  style={styles.areaButton}
                                  buttonColor={selectedArea === area ? Colors.button.default : undefined}
                                  textColor={selectedArea === area ? '#fff' : Colors.button.default}
                                >
                                  {area}
                                </Button>
                              ))}
                            </ScrollView>
                          </View>
                        )}
                        
                        {/* Station Selection - Only show if area is selected */}
                        {selectedArea && filteredStations.length > 0 && (
                          <View>
                            <Text style={styles.stationsTitle}>Available Stations in {selectedArea}, {selectedCity}:</Text>
                            <View style={styles.stationsContainer}>
                              {filteredStations.map((s: any, i: number) => (
                                <Surface
                                  key={`${s.station_name}-${s.area}-${i}`}
                                  style={[
                                    styles.stationSurface,
                                    values.stationId === s.station_name && styles.selectedStationSurface
                                  ]}
                                  elevation={2}
                                >
                                  <TouchableRipple
                                    key={`touch-${s.station_name}-${s.area}-${i}`}
                                    onPress={() => setFieldValue('stationId', s.station_name)}
                                    rippleColor="rgba(0, 167, 111, 0.1)"
                                    style={styles.stationTouchable}
                                  >
                                    <View>
                                      <RadioButton.Item
                                        key={`radio-${s.station_name}-${s.area}-${i}`}
                                        label=""
                                        value={s.station_name}
                                        status={values.stationId === s.station_name ? 'checked' : 'unchecked'}
                                        onPress={() => setFieldValue('stationId', s.station_name)}
                                        position="leading"
                                        style={styles.stationRadioButton}
                                        color={Colors.button.default}
                                        uncheckedColor={Colors.divider}
                                      />
                                      <View style={styles.stationContent}>
                                        <View style={styles.stationHeader}>
                                          <Ionicons
                                            name="location"
                                            size={24}
                                            color={values.stationId === s.station_name ? Colors.button.default : Colors.text.tertiary}
                                            style={styles.stationIcon}
                                          />
                                          <View style={styles.stationDetails}>
                                            <Text style={styles.stationName}>{s.station_name}</Text>
                                            <Text style={styles.stationAddress}>{s.area}, {selectedCity}</Text>
                                          </View>
                                        </View>
                                        <Divider style={styles.stationDivider} />
                                        <View style={styles.stationFooter}>
                                          <View style={styles.stationFeature}>
                                            <Ionicons name="checkmark-circle" size={16} color={Colors.status.success.default} />
                                            <Text style={styles.featureText}>Certified</Text>
                                          </View>
                                          <View style={styles.stationFeature}>
                                            <Ionicons name="time" size={16} color={Colors.text.secondary} />
                                            <Text style={styles.featureText}>Quick Service</Text>
                                          </View>
                                        </View>
                                      </View>
                                    </View>
                                  </TouchableRipple>
                                </Surface>
                              ))}
                            </View>
                            {touched.stationId && errors.stationId && (
                              <HelperText type="error">{errors.stationId}</HelperText>
                            )}
                            
                            <Button
                              mode="contained"
                              onPress={handleNextStep}
                              style={styles.continueButton}
                              buttonColor={Colors.button.default}
                              labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                              disabled={!values.stationId}
                            >
                              Continue to Select Date & Time
                            </Button>
                          </View>
                        )}
                      </Card.Content>
                    </Card>
                  )}
                  
                  {/* Step 3: Date & Time Selection */}
                  {currentStep === 3 && (
                    <Card style={styles.card} mode="elevated">
                      <View style={styles.cardIndicator} />
                      <Card.Content style={styles.cardContent}>
                        <View style={styles.stepTitleContainer}>
                          <View style={styles.stepNumberContainer}>
                            <Text style={styles.stepNumber}>3</Text>
                          </View>
                          <View style={styles.stepTextContainer}>
                            <Text style={styles.stepTitle}>Select Date & Time</Text>
                            <Text style={styles.stepDescription}>Choose your preferred inspection date and time</Text>
                          </View>
                        </View>
                        <Divider style={styles.divider} />
                        
                        <View style={styles.dateSelectionContainer}>
                          <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={toggleDateSelectionAudio} style={styles.audioButton}>
                              <Ionicons 
                                name={isDateSelectionPlaying ? 'stop' : 'volume-high'} 
                                size={24} 
                                color={Colors.primary.main} 
                              />
                            </TouchableOpacity>
                            <Text style={styles.dateLabel}>Appointment Date:</Text>
                          </View>
                          
                          <TouchableOpacity
                            style={styles.customDatePicker}
                            onPress={() => setCalendarVisible(true)}
                            activeOpacity={0.7}
                          >
                            <View style={styles.dateDisplay}>
                              <Text style={styles.dateText}>
                                {formatDate(values.date)}
                              </Text>
                            </View>
                            <View style={styles.calendarIconContainer}>
                              <Ionicons name="calendar" size={24} color={Colors.primary.main} />
                            </View>
                          </TouchableOpacity>
                          
                          {touched.date && errors.date && (
                            <HelperText type="error">{errors.date as string}</HelperText>
                          )}
                          
                          {/* Calendar Modal */}
                          <Modal
                            visible={calendarVisible}
                            transparent={true}
                            animationType="fade"
                            onRequestClose={() => setCalendarVisible(false)}
                          >
                            <View style={styles.modalOverlay}>
                              <View style={styles.calendarContainer}>
                                <View style={styles.calendarHeader}>
                                  <Text style={styles.calendarTitle}>Select Date</Text>
                                  <TouchableOpacity onPress={() => setCalendarVisible(false)}>
                                    <Ionicons name="close" size={24} color={Colors.text.primary} />
                                  </TouchableOpacity>
                                </View>
                                
                                <Calendar
                                  minDate={availableDateStrings.length > 0 ? availableDateStrings[0] : new Date().toISOString().split('T')[0]}
                                  maxDate={availableDateStrings.length > 0 ? availableDateStrings[availableDateStrings.length - 1] : new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0]}
                                  markedDates={{
                                    ...(values.date ? { [formatDateForMarking(values.date)]: { selected: true, selectedColor: Colors.primary.main } } : {}),
                                    ...Object.fromEntries(availableDateObjs.map((d: any) => [
                                      d.date,
                                      (d.is_weekend || d.is_independence_day)
                                        ? { disabled: true, marked: true, disableTouchEvent: true }
                                        : { disabled: false, marked: true }
                                    ]))
                                  }}
                                  onDayPress={day => {
                                    if (availableDateStrings.includes(day.dateString)) {
                                      const dObj = availableDateObjs.find((d: any) => d.date === day.dateString);
                                      if (dObj && !(dObj.is_weekend || dObj.is_independence_day)) {
                                        handleDateSelect(day, setFieldValue);
                                      }
                                    }
                                  }}
                                  disabledDaysIndexes={[0, 6]} // Optionally disable weekends
                                  theme={{
                                    todayTextColor: Colors.primary.main,
                                    selectedDayBackgroundColor: Colors.primary.main,
                                    textDayFontWeight: '500',
                                    textMonthFontWeight: 'bold',
                                    textDayHeaderFontWeight: '500',
                                    textDayFontSize: 16,
                                    textMonthFontSize: 16,
                                    textDayHeaderFontSize: 14,
                                  }}
                                  enableSwipeMonths={true}
                                />
                                
                                <View style={styles.calendarFooter}>
                                  <Button
                                    mode="contained"
                                    onPress={() => setCalendarVisible(false)}
                                    buttonColor={Colors.button.default}
                                  >
                                    Done
                                  </Button>
                                </View>
                              </View>
                            </View>
                          </Modal>
                        </View>
                        
                        {values.date && (
                          <View style={styles.timeSlotSection}>
                            <Text style={styles.sectionSubtitle}>Available Time Slots:</Text>
                            <Text style={styles.timeSlotHint}>
                              Select your preferred time slot for{' '}
                              {formatDate(values.date)}
                            </Text>
                            <View style={styles.timeSlotGrid}>
                              {availableTimeSlots.length > 0 ? (
                                availableTimeSlots.map((time: string) => (
                                  <Chip
                                    key={time}
                                    selected={values.timeSlot === time}
                                    onPress={() => setFieldValue('timeSlot', time)}
                                    style={[
                                      styles.timeSlotChip,
                                      values.timeSlot === time && styles.selectedTimeSlotChip,
                                    ]}
                                    selectedColor={values.timeSlot === time ? "#fff" : "#000"}
                                    showSelectedCheck={values.timeSlot === time}
                                    elevation={values.timeSlot === time ? 2 : 0}
                                  >
                                    <Text style={{ color: values.timeSlot === time ? '#fff' : '#000' }}>{time}</Text>
                                  </Chip>
                                ))
                              ) : (
                                <Text style={{ color: Colors.text.secondary, marginTop: 8 }}>No available time slots for this date.</Text>
                              )}
                            </View>
                            {touched.timeSlot && errors.timeSlot && (
                              <HelperText type="error">{errors.timeSlot}</HelperText>
                            )}
                            <Button
                              mode="contained"
                              onPress={handleNextStep}
                              style={styles.continueButton}
                              buttonColor={Colors.button.default}
                              labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                              disabled={!values.timeSlot}
                            >
                              Continue to Confirmation
                            </Button>
                          </View>
                        )}
                      </Card.Content>
                    </Card>
                  )}
                  
                  {/* Step 4: Confirmation & PSID */}
                  {currentStep === 4 && (
                    <Card style={styles.card} mode="elevated">
                      <View style={styles.cardIndicator} />
                      <Card.Content style={styles.cardContent}>
                        <View style={styles.stepTitleContainer}>
                          <View style={styles.stepNumberContainer}>
                            <Text style={styles.stepNumber}>4</Text>
                          </View>
                          <View style={styles.stepTextContainer}>
                            <Text style={styles.stepTitle}>Confirmation</Text>
                            <Text style={styles.stepDescription}>Review and confirm your appointment details</Text>
                          </View>
                        </View>
                        <Divider style={styles.divider} />
                        
                        <Surface style={[styles.summaryContainer, { backgroundColor: Colors.background }]} elevation={1}>
                          <View style={styles.summarySection}>
                            <Text style={styles.summaryTitle}>Vehicle Information</Text>
                            <View style={styles.summaryItem}>
                              <Text style={styles.summaryLabel}>Registration:</Text>
                              <Text style={styles.summaryValue}>{values.registrationNumber.toUpperCase()}</Text>
                            </View>
                            <View style={styles.summaryItem}>
                              <Text style={styles.summaryLabel}>Vehicle:</Text>
                              <Text style={styles.summaryValue}>{`${vehicleData.vehicleName} ${vehicleData.variant}`}</Text>
                            </View>
                            <View style={styles.summaryItem}>
                              <Text style={styles.summaryLabel}>Owner:</Text>
                              <Text style={styles.summaryValue}>{vehicleData.owner}</Text>
                            </View>
                          </View>
                          
                          <Divider style={styles.summaryDivider} />
                          
                          <View style={styles.summarySection}>
                            <Text style={styles.summaryTitle}>Appointment Details</Text>
                            <View style={styles.summaryItem}>
                              <Text style={styles.summaryLabel}>Date:</Text>
                              <Text style={styles.summaryValue}>
                                {formatDate(values.date)}
                              </Text>
                            </View>
                            <View style={styles.summaryItem}>
                              <Text style={styles.summaryLabel}>Time:</Text>
                              <Text style={styles.summaryValue}>{values.timeSlot}</Text>
                            </View>
                            <View style={styles.summaryItem}>
                              <Text style={styles.summaryLabel}>Center:</Text>
                              <Text style={styles.summaryValue}>
                                {stations.find((s: any) => s.station_name === values.stationId)?.station_name}
                              </Text>
                            </View>
                            <View style={styles.summaryItem}>
                              <Text style={styles.summaryLabel}>Address:</Text>
                              <Text style={styles.summaryValue}>
                                {stations.find((s: any) => s.station_name === values.stationId)?.area}
                              </Text>
                            </View>
                          </View>
                          
                          <Divider style={styles.summaryDivider} />
                          
                          <View style={styles.summarySection}>
                            <Text style={styles.summaryTitle}>Payment Information</Text>
                            <View style={styles.summaryItem}>
                              <Text style={styles.summaryLabel}>Inspection Fee:</Text>
                              <Text style={styles.summaryValue}>
                                {stations.find((s: any) => s.station_name === values.stationId)?.price}
                              </Text>
                            </View>
                            <View style={styles.summaryItem}>
                              <Text style={styles.summaryLabel}>Payment Status:</Text>
                              <Text style={[styles.summaryValue, styles.pendingText]}>Pending</Text>
                            </View>
                          </View>
                        </Surface>
                        
                        <Text style={styles.termsText}>
                          By confirming, you agree to the Terms and Conditions of the Vehicle Inspection and Certification System.
                        </Text>
                        
                        <Button
                          mode="contained"
                          onPress={() => {
                            console.log('Confirm button pressed');
                            if (!loading) {
                              console.log('Loading check passed, calling handleSubmit');
                              handleSubmit(); // This is Formik's handleSubmit from the render props
                            } else {
                              console.log('Button not triggered - loading state is:', loading);
                            }
                          }}
                          style={styles.confirmButton}
                          buttonColor={Colors.button.default}
                          loading={loading}
                          disabled={loading}
                        >
                          <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={toggleAppointmentDetailsAudio} style={styles.audioButton}>
                              <Ionicons 
                                name={isAppointmentDetailsPlaying ? 'stop' : 'volume-high'} 
                                size={24} 
                                color={Colors.primary.main} 
                              />
                            </TouchableOpacity>
                            <Text style={styles.buttonText}>
                          {loading ? 'Processing...' : 'Confirm Appointment'}
                            </Text>
                          </View>
                        </Button>
                      </Card.Content>
                    </Card>
                  )}
                  
                  {/* Back button for steps 2-4 */}
                  {currentStep > 1 && (
                    <Button
                      mode="outlined"
                      onPress={handlePreviousStep}
                      style={styles.backButton}
                      icon="arrow-left"
                      textColor="#000"
                    >
                      Back
                    </Button>
                  )}
                </View>
              );
            }}
          </Formik>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Layout and Container styles
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    marginBottom: 0,
  },
  scrollContent: {
    padding: Spacing.m,
    paddingBottom: 200, // Extra padding to ensure buttons are always visible
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: Spacing.l,
    paddingVertical: Spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    color: Colors.text.primary,
  },

  // Step indicator styles
  stepIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
    marginVertical: Spacing.xs,
    marginTop: Spacing.xs,
    marginBottom: Spacing.m,
  },
  stepIndicatorWrapper: {
    alignItems: 'center',
    flex: 4, // Adjusted to allow more space for step indicators
  },
  stepIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.text.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  activeStepIndicator: {
    backgroundColor: Colors.background,
    borderColor: Colors.primary.main,
  },
  stepConnector: {
    height: 2,
    backgroundColor: Colors.text.tertiary,
    flex: 1,
    marginHorizontal: -10,
  },
  activeStepConnector: {
    backgroundColor: Colors.primary.main,
  },
  stepLabel: {
    fontSize: 12,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  activeStepLabel: {
    color: Colors.primary.main,
    fontWeight: 'bold',
  },
  stepTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  stepNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.s,
  },
  stepNumber: {
    color: Colors.common.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  stepTextContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: 15,
    color: Colors.text.secondary,
  },
  urduStepDescription: {
    fontSize: 17,
    fontWeight: 'bold',
  },

  // Card styles
  card: {
    marginBottom: Spacing.l,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.common.white,
    elevation: 4,
  },
  cardIndicator: {
    height: 8,
    backgroundColor: Colors.primary.main,
  },
  cardContent: {
    padding: Spacing.m,
  },
  divider: {
    marginBottom: Spacing.m,
    backgroundColor: Colors.divider,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  audioButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.primary.light,
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: Colors.common.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  licensePlateInputContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  licensePlateInputInner: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: Spacing.m,
    width: '100%',
    maxWidth: 300,
  },
  licensePlateInputText: {
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 2,
    fontWeight: 'bold',
  },
  lookupButton: {
    marginTop: 16,
    borderRadius: 8,
  },
  loadingContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: Colors.text.secondary,
  },
  vehicleResultContainer: {
    marginTop: 16,
  },
  vehicleInfoContainer: {
    padding: Spacing.m,
    borderRadius: 12,
    backgroundColor: Colors.background,
  },
  vehicleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.m,
  },
  vehicleImageContainer: {
    backgroundColor: Colors.divider,
    padding: Spacing.s,
    borderRadius: 12,
    marginRight: Spacing.m,
  },
  vehicleHeaderInfo: {
    flex: 1,
  },
  vehicleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  vehicleSubtitle: {
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  vehicleDivider: {
    marginVertical: 16,
  },
  vehicleDetailsGrid: {
    marginBottom: 16,
  },
  vehicleDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  vehicleDetailItem: {
    flex: 1,
  },
  detailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailIcon: {
    marginRight: 4,
  },
  vehicleDetailLabel: {
    color: Colors.text.secondary,
    fontSize: 12,
  },
  vehicleDetailValue: {
    fontWeight: '500',
  },
  continueButton: {
    marginTop: 16,
    borderRadius: 8,
  },
  errorContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: Colors.status.error.light,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    marginLeft: 8,
    color: Colors.status.error.dark,
    flex: 1,
  },
  backButton: {
    marginTop: Spacing.m,
    marginBottom: Spacing.xl,
    borderColor: Colors.text.primary,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
  successContainer: {
    margin: Spacing.m,
    borderRadius: 16,
    overflow: 'hidden',
  },
  successGradient: {
    padding: 24,
    alignItems: 'center',
  },
  successText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.status.success.default,
    marginTop: 16,
    marginBottom: 8,
  },
  successSubtext: {
    textAlign: 'center',
    color: Colors.text.secondary,
    marginTop: 8,
  },
  psidContainer: {
    backgroundColor: Colors.background,
    padding: Spacing.m,
    borderRadius: 8,
    marginVertical: Spacing.m,
    alignItems: 'center',
  },
  psidNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary.main,
    letterSpacing: 2,
  },
  psidLabel: {
    color: Colors.text.secondary,
    marginTop: 4,
  },
  payButtonsRow: {
    flexDirection: 'row',
    marginTop: Spacing.l,
  },
  payLaterButton: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.button.default,
    backgroundColor: '#fff',
  },
  closeButton: {
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  citySelectorContainer: {
    marginBottom: 16,
  },
  citySelectLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  cityScrollContainer: {
    paddingVertical: 8,
  },
  cityButton: {
    marginRight: 8,
    borderRadius: 8,
  },
  stationsTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  stationsContainer: {
    gap: 12,
  },
  stationSurface: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectedStationSurface: {
    borderWidth: 2,
    borderColor: Colors.button.default,
  },
  stationTouchable: {
    padding: 16,
  },
  stationRadioButton: {
    padding: 0,
    margin: 0,
  },
  stationContent: {
    marginTop: -40,
    marginLeft: 52,
  },
  stationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stationIcon: {
    marginRight: 12,
  },
  stationDetails: {
    flex: 1,
  },
  stationName: {
    fontSize: 16,
    fontWeight: '500',
  },
  stationAddress: {
    color: Colors.text.secondary,
    marginTop: 2,
  },
  stationDivider: {
    marginVertical: 12,
  },
  stationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stationFeature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    marginLeft: 4,
    color: Colors.text.secondary,
  },
  dateSelectionContainer: {
    marginBottom: 24,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  // Calendar styles
  customDatePicker: {
    flexDirection: 'row',
    height: 56,
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: 4,
    backgroundColor: Colors.common.white,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.m,
    marginBottom: Spacing.m,
  },
  dateDisplay: {
    flex: 1,
    padding: Spacing.m,
  },
  dateText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  calendarIconContainer: {
    padding: Spacing.m,
    backgroundColor: Colors.surface,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.m,
  },
  calendarContainer: {
    width: '95%',
    backgroundColor: Colors.background,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  calendarFooter: {
    padding: Spacing.m,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  timeSlotSection: {
    marginTop: 24,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  timeSlotHint: {
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  timeSlotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  timeSlotChip: {
    backgroundColor: Colors.surface,
  },
  selectedTimeSlotChip: {
    backgroundColor: Colors.button.default,
  },
  summaryContainer: {
    borderRadius: 12,
    marginBottom: 24,
  },
  summarySection: {
    padding: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    color: Colors.text.secondary,
  },
  summaryValue: {
    fontWeight: '500',
  },
  summaryDivider: {
    marginVertical: 0,
  },
  pendingText: {
    color: Colors.status.warning.default,
  },
  termsText: {
    textAlign: 'center',
    color: Colors.text.secondary,
    marginBottom: 24,
  },
  confirmButton: {
    borderRadius: 8,
  },
  // Form field styles
  input: {
    marginBottom: Spacing.xs,
    backgroundColor: Colors.common.white,
  },
  datePickerContainer: {
    marginBottom: Spacing.l,
  },
  datePickerInput: {
    marginBottom: Spacing.m,
    backgroundColor: Colors.common.white,
  },
  searchButton: {
    marginTop: Spacing.s,
    marginBottom: Spacing.l,
  },

  vehicleDetailItem: {
    flex: 1,
    marginHorizontal: Spacing.xs,
  },
  detailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailIcon: {
    marginRight: 4,
  },
  vehicleDetailLabel: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  vehicleDetailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  continueButton: {
    marginTop: Spacing.s,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.status.error.lighter,
    padding: Spacing.m,
    borderRadius: 8,
    marginTop: Spacing.m,
  },
  errorText: {
    marginLeft: Spacing.s,
    color: Colors.status.error.dark,
    flex: 1,
    fontSize: 14,
  },
  successContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  successGradient: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  successText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.status.success.dark,
    marginTop: Spacing.m,
    marginBottom: Spacing.s,
  },
  successSubtext: {
    fontSize: 14,
    textAlign: 'center',
    color: Colors.text.secondary,
    marginTop: Spacing.m,
  },
  psidContainer: {
    backgroundColor: Colors.common.white,
    borderRadius: 8,
    padding: Spacing.m,
    width: '100%',
    alignItems: 'center',
    marginTop: Spacing.m,
    borderWidth: 1,
    borderColor: Colors.status.success.main,
  },
  psidLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  psidNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.status.success.dark,
    letterSpacing: 1,
  },
  bookAnotherContainer: {
    marginTop: Spacing.l,
    width: '100%',
    paddingHorizontal: Spacing.m,
  },
  bookAnotherButton: {
    width: '100%',
    height: 48,
    borderRadius: 8,
  },
  navigationButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.m,
  },
  backButton: {
    flex: 1,
    marginRight: Spacing.s,
  },
  nextButton: {
    flex: 1,
    marginLeft: Spacing.s,
  },
  citySelectLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: Spacing.l,
  },
  citySelectorContainer: {
    marginBottom: Spacing.m,
  },
  cityScrollContainer: {
    paddingBottom: Spacing.s,
  },
  stationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: Spacing.m,
    color: Colors.text.primary,
  },
  stationsContainer: {
    marginBottom: Spacing.l,
  },
  stationSurface: {
    borderRadius: 12,
    marginBottom: Spacing.m,
    overflow: 'hidden',
    backgroundColor: Colors.common.white,
  },
  selectedStationSurface: {
    borderWidth: 2,
    borderColor: Colors.button.default,
  },
  stationTouchable: {
    padding: Spacing.s,
  },
  stationContent: {
    paddingLeft: 40,
    paddingRight: Spacing.m,
    paddingVertical: Spacing.s,
  },
  stationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.s,
  },
  stationIcon: {
    marginRight: Spacing.s,
  },
  stationDetails: {
    flex: 1,
  },
  stationName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: Colors.text.primary,
  },
  stationDivider: {
    marginVertical: Spacing.s,
  },
  stationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.s,
  },
  stationFeature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    marginLeft: 4,
    fontSize: 12,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  timeSlotSection: {
    marginTop: Spacing.m,
  },
  timeSlotHint: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: Spacing.m,
  },
  timeSlotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.m,
  },
  timeSlotChip: {
    margin: 4,
    backgroundColor: Colors.card.light,
    borderWidth: 1,
    borderColor: Colors.divider,
    height: 40,
    justifyContent: 'center',
  },
  selectedTimeSlotChip: {
    backgroundColor: Colors.button.default,
    borderColor: Colors.button.default,
  },
  unavailableTimeSlotChip: {
    backgroundColor: Colors.gray["700"],
    opacity: 0.7,
  },
  timeLegendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: Spacing.s,
    backgroundColor: Colors.card.dark,
    borderRadius: 8,
    marginVertical: Spacing.m,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.xs,
  },
  availableIndicator: {
    backgroundColor: Colors.card.light,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  selectedIndicator: {
    backgroundColor: Colors.button.default,
  },
  unavailableIndicator: {
    backgroundColor: Colors.gray["700"],
    opacity: 0.7,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  legendText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  summaryContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: Spacing.m,
    backgroundColor: Colors.card.default,
  },
  summarySection: {
    padding: Spacing.m,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: Spacing.s,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.text.tertiary,
    flex: 1,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    flex: 2,
    textAlign: 'right',
  },
  pendingText: {
    color: Colors.status.pending.text,
    fontWeight: 'bold',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.divider,
  },
  termsText: {
    fontSize: 12,
    color: Colors.text.tertiary,
    textAlign: 'center',
    marginVertical: Spacing.m,
  },
  confirmButton: {
    borderRadius: 8,
    paddingVertical: Spacing.xs,
  },
  lookupButton: {
    borderRadius: 8,
    marginVertical: Spacing.m,
  },
  loadingText: {
    marginTop: Spacing.s,
    fontSize: 14,
    color: Colors.text.secondary,
  },
  cityButton: {
    marginRight: Spacing.s,
    borderRadius: 25,
    paddingHorizontal: Spacing.m,
    minWidth: 100,
  },
  areaSelectorContainer: {
    marginBottom: Spacing.m,
    marginTop: Spacing.m,
  },
  areaSelectLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: Spacing.m,
  },
  areaScrollContainer: {
    paddingBottom: Spacing.s,
  },
  areaButton: {
    marginRight: Spacing.s,
    borderRadius: 25,
    paddingHorizontal: Spacing.m,
    minWidth: 80,
  },
  stationRadioButton: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    margin: 0,
    position: 'absolute',
    top: 12,
    left: 8,
  },
  stationAddress: {
    color: Colors.text.secondary,
    fontSize: 14,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: Spacing.s,
    color: Colors.text.primary,
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
    backgroundColor: Colors.background,
  },
  buttonText: {
    color: Colors.common.white,
    fontWeight: 'bold',
  },
  dateSelectionContainer: {
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary.main,
  },
  licensePlateInputContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  licensePlateInputInner: {
    width: 300,
    height: 120,
    backgroundColor: '#e9ecec',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f4f4f4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    padding: 0,
    margin: 0,
  },
  licensePlateInputText: {
    width: 250,
    height: 80,
    fontSize: 40,
    color: '#000',
    fontWeight: '700',
    backgroundColor: '#dde2e2',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#888',
    textAlign: 'center',
    letterSpacing: 2,
    paddingHorizontal: 0,
    paddingVertical: 0,
    includeFontPadding: false,
    margin: 0,
  },
  payButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
    gap: 16,
  },
  payNowButton: {
    flex: 1,
    marginRight: 8,
    borderRadius: 8,
    elevation: 2,
  },
  payLaterButton: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.button.default,
    backgroundColor: '#fff',
  },
}); 