import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Formik } from 'formik';
import { useEffect, useState } from 'react';
import { Dimensions, Image, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import * as Yup from 'yup';
import OTPInput from '../components/OTPInput';
import { authStyles, inputTheme } from '../theme/authStyles';

const { width } = Dimensions.get('window');

const RegisterScreen = () => {
  const [step, setStep] = useState<'register' | 'cnic' | 'otp' | 'tpin'>('register');
  const [mobile, setMobile] = useState('');
  const [cnicFront, setCnicFront] = useState('');
  const [cnicBack, setCnicBack] = useState('');
  const [otp, setOtp] = useState('');
  const [tpin, setTpin] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [popupMsg, setPopupMsg] = useState('');
  const [timer, setTimer] = useState(60);
  const [cnicFrontImg, setCnicFrontImg] = useState<string | null>(null);
  const [cnicBackImg, setCnicBackImg] = useState<string | null>(null);
  const router = useRouter();
  const [isUrdu, setIsUrdu] = useState(true);

  const formatCNIC = (value: string) => {
    // Remove all non-digit characters
    const numbers = value.replace(/\D/g, '');
    
    // Format the number with hyphens
    let formatted = '';
    if (numbers.length > 0) {
      formatted = numbers.slice(0, 5);
      if (numbers.length > 5) {
        formatted += '-' + numbers.slice(5, 12);
        if (numbers.length > 12) {
          formatted += '-' + numbers.slice(12, 13);
        }
      }
    }
    return formatted;
  };

  useEffect(() => {
    let interval: any;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, timer]);

  const handleRegister = (values: { mobile: string }) => {
    setMobile(values.mobile);
    setStep('cnic');
  };

  const handleCnic = (values: { cnic: string }) => {
    setStep('otp');
    setTimer(60);
  };

  const handleOtp = (values: { otp: string }) => {
    if (values.otp === '123456') {
      setPopupMsg('Your mobile number is registered successfully.');
      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
        setStep('tpin');
      }, 4000);
    } else {
      setPopupMsg('Invalid OTP. Please try 123456.');
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 4000);
    }
  };

  const handleTpin = (values: { tpin: string }) => {
    if (/^[0-9]{3,}$/.test(values.tpin)) {
      setPopupMsg('PIN set successfully.');
      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
        router.replace('/login');
      }, 4000);
    } else {
      setPopupMsg('PIN must be at least 3 digits.');
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 4000);
    }
  };

  const pickImage = async (which: 'front' | 'back') => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Camera permission is required!');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      if (which === 'front') setCnicFrontImg(result.assets[0].uri);
      else setCnicBackImg(result.assets[0].uri);
    }
  };

  return (
    <ImageBackground 
      source={require('../../assets/images/login_signup.png')}
      style={authStyles.backgroundImage}
    >
      <KeyboardAvoidingView
        style={authStyles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView contentContainerStyle={authStyles.scrollContainer}>
          <LinearGradient
            colors={['rgba(18, 14, 14, 0.8)', 'rgba(23, 22, 21, 0.8)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={authStyles.gradientContainer}
          >
            {/* Urdu/English Toggle */}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', width: '100%', marginBottom: 8 }}>
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2, elevation: 2, borderWidth: 0 }}
                onPress={() => setIsUrdu((prev) => !prev)}
                activeOpacity={0.7}
                accessibilityLabel="Translate registration labels"
              >
                <Text style={{ color: '#40cf45', fontWeight: 'bold', fontSize: 20, fontFamily: 'NotoNastaliqUrdu' }}>{isUrdu ? 'اردو' : 'English'}</Text>
                <Ionicons name="chevron-down" size={18} color="#40cf45" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>
            <Text style={authStyles.authTitle}>{isUrdu ? 'رجسٹر کریں' : 'Register'}</Text>
            <View style={authStyles.headerContainer}>
              <Text style={authStyles.headerText}>{isUrdu ? 'گاڑی کی جانچ اور سرٹیفیکیشن سسٹم' : 'Vehicle Inspection and Certification System'}</Text>
            </View>
            <View style={authStyles.logoRow}>
              <Image source={require('../../assets/images/punjab-logo.png')} style={authStyles.logo} />
              <Image source={require('../../assets/images/transport-loho.png')} style={authStyles.logo} />
              <Image source={require('../../assets/images/PTA-logo.png')} style={authStyles.logo} />
            </View>
            {step === 'register' && (
              <Formik
                initialValues={{ mobile: '' }}
                validationSchema={Yup.object().shape({
                  mobile: Yup.string()
                    .matches(/^\+92[0-9]{10}$/, isUrdu ? 'نمبر +92 سے شروع ہو اور 10 ہندسے ہوں' : 'Mobile number must start with +92 and be followed by 10 digits')
                    .required(isUrdu ? 'موبائل نمبر ضروری ہے' : 'Mobile number is required'),
                })}
                onSubmit={handleRegister}
              >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
                  <View style={authStyles.formContainer}>
                    <View style={authStyles.inputContainer}>
                      <TextInput
                        // label={isUrdu ? 'موبائل نمبر' : 'Mobile Number'}
                        value={values.mobile}
                        onChangeText={text => {
                          let val = text;
                          if (!val.startsWith('+92')) val = '+92' + val.replace(/^\+?92?/, '');
                          val = val.replace(/[^0-9+]/g, '');
                          if (val.length > 13) val = val.slice(0, 13);
                          setFieldValue('mobile', val);
                        }}
                        onBlur={handleBlur('mobile')}
                        error={touched.mobile && !!errors.mobile}
                        style={authStyles.input}
                        mode="outlined"
                        keyboardType="phone-pad"
                        placeholder={isUrdu ? '+92XXXXXXXXXX' : '+92XXXXXXXXXX'}
                        left={<TextInput.Icon icon="phone" />}
                        theme={inputTheme}
                        maxLength={13}
                      />
                      {touched.mobile && errors.mobile && (
                        <Text style={authStyles.errorText}>{errors.mobile}</Text>
                      )}
                    </View>
                    <Button
                      mode="contained"
                      onPress={() => handleSubmit()}
                      style={authStyles.button}
                    >
                      {isUrdu ? 'اگلا' : 'Next'}
                    </Button>
                  </View>
                )}
              </Formik>
            )}
            {step === 'cnic' && (
              <Formik
                initialValues={{ cnic: '' }}
                validationSchema={Yup.object().shape({
                  cnic: Yup.string()
                    .matches(/^[0-9]{5}-[0-9]{7}-[0-9]$/, isUrdu ? 'فارمیٹ: 12345-1234567-1' : 'Format: 12345-1234567-1')
                    .required(isUrdu ? 'شناختی کارڈ ضروری ہے' : 'CNIC is required'),
                })}
                onSubmit={handleCnic}
              >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
                  <View style={authStyles.formContainer}>
                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: '500', marginBottom: 4 }}>{isUrdu ? 'اپنا شناختی کارڈ نمبر درج کریں' : 'Enter your CNIC number'}</Text>
                    <View style={authStyles.inputContainer}>
                      <TextInput
                        label={isUrdu ? 'شناختی کارڈ نمبر' : 'Enter CNIC'}
                        value={values.cnic}
                        onChangeText={(text) => {
                          const formatted = formatCNIC(text);
                          setFieldValue('cnic', formatted);
                        }}
                        onBlur={handleBlur('cnic')}
                        error={touched.cnic && !!errors.cnic}
                        style={authStyles.input}
                        mode="outlined"
                        keyboardType="numeric"
                        placeholder={isUrdu ? '12345-1234567-1' : '12345-1234567-1'}
                        left={<TextInput.Icon icon="card-account-details" />}
                        theme={inputTheme}
                        maxLength={15} // 5 + 1 + 7 + 1 + 1 = 15 characters including hyphens
                      />
                      {touched.cnic && errors.cnic && (
                        <Text style={authStyles.errorText}>{errors.cnic}</Text>
                      )}
                    </View>
                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: '500', marginBottom: 4, marginTop: 4 }}>{isUrdu ? 'اپنے شناختی کارڈ کے سامنے والے حصے کی تصویر لیں' : 'Take picture of your CNIC front side'}</Text>
                    <View style={[authStyles.inputContainer, { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginBottom: 12 }]}> 
                      <Button
                        mode="outlined"
                        style={{ minWidth: 120, borderColor: '#0cad17', borderWidth: 1.5, borderRadius: 12, paddingVertical: 4, paddingHorizontal: 8, marginRight: 14, backgroundColor: '#fff' }}
                        onPress={() => pickImage('front')}
                        icon="camera"
                        labelStyle={{ color: '#0cad17', fontWeight: 'bold', fontSize: 15 }}
                        contentStyle={{ flexDirection: 'row' }}
                      >
                        {isUrdu ? 'شناختی کارڈ سامنے' : 'CNIC Front'}
                      </Button>
                      {cnicFrontImg && (
                        <View style={{
                          width: 52, height: 52, borderRadius: 10, backgroundColor: '#f8f8f8', borderWidth: 1.5, borderColor: '#0cad17', marginLeft: 2,
                          shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.13, shadowRadius: 4,
                          ...Platform.select({ android: { elevation: 3 } })
                        }}>
                          <Image source={{ uri: cnicFrontImg }} style={{ width: 50, height: 50, borderRadius: 9 }} />
                        </View>
                      )}
                    </View>
                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: '500', marginBottom: 4, marginTop: 4 }}>{isUrdu ? 'اپنے شناختی کارڈ کے پچھلے حصے کی تصویر لیں' : 'Take picture of your CNIC back side'}</Text>
                    <View style={[authStyles.inputContainer, { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginBottom: 12 }]}> 
                      <Button
                        mode="outlined"
                        style={{ minWidth: 120, borderColor: '#0cad17', borderWidth: 1.5, borderRadius: 12, paddingVertical: 4, paddingHorizontal: 8, marginRight: 14, backgroundColor: '#fff' }}
                        onPress={() => pickImage('back')}
                        icon="camera"
                        labelStyle={{ color: '#0cad17', fontWeight: 'bold', fontSize: 15 }}
                        contentStyle={{ flexDirection: 'row' }}
                      >
                        {isUrdu ? 'شناختی کارڈ پچھلا' : 'CNIC Back'}
                      </Button>
                      {cnicBackImg && (
                        <View style={{
                          width: 52, height: 52, borderRadius: 10, backgroundColor: '#f8f8f8', borderWidth: 1.5, borderColor: '#0cad17', marginLeft: 2,
                          shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.13, shadowRadius: 4,
                          ...Platform.select({ android: { elevation: 3 } })
                        }}>
                          <Image source={{ uri: cnicBackImg }} style={{ width: 50, height: 50, borderRadius: 9 }} />
                        </View>
                      )}
                    </View>
                    <Button
                      mode="contained"
                      onPress={() => handleSubmit()}
                      style={authStyles.button}
                      disabled={!(values.cnic && cnicFrontImg && cnicBackImg)}
                    >
                      {isUrdu ? 'اگلا' : 'Next'}
                    </Button>
                  </View>
                )}
              </Formik>
            )}
            {step === 'otp' && (
              <Formik
                initialValues={{ otp: '' }}
                validationSchema={Yup.object().shape({
                  otp: Yup.string()
                    .matches(/^[0-9]{6}$/, 'OTP must be 6 digits')
                    .required('OTP is required'),
                })}
                onSubmit={handleOtp}
              >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
                  <View style={authStyles.formContainer}>
                    <View style={authStyles.inputContainer}>
                      <OTPInput
                        value={values.otp}
                        onChange={val => setFieldValue('otp', val)}
                        length={6}
                        disabled={false}
                      />
                      {touched.otp && errors.otp && (
                        <Text style={authStyles.errorText}>{errors.otp}</Text>
                      )}
                      <Text style={authStyles.timerText}>Time remaining: {timer} seconds</Text>
                    </View>
                    <Button
                      mode="contained"
                      onPress={() => handleSubmit()}
                      style={authStyles.button}
                    >
                      Verify OTP
                    </Button>
                  </View>
                )}
              </Formik>
            )}
            {step === 'tpin' && (
              <Formik
                initialValues={{ tpin: '' }}
                validationSchema={Yup.object().shape({
                  tpin: Yup.string()
                    .matches(/^[0-9]{3,}$/, isUrdu ? 'پن کم از کم 3 ہندسوں پر مشتمل ہونا چاہیے' : 'PIN must be at least 3 digits')
                    .required(isUrdu ? 'پن درکار ہے' : 'PIN is required'),
                })}
                onSubmit={handleTpin}
              >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                  <View style={authStyles.formContainer}>
                    <View style={authStyles.inputContainer}>
                      <TextInput
                        label={isUrdu ? 'پن سیٹ کریں' : 'Set PIN'}
                        value={values.tpin}
                        onChangeText={handleChange('tpin')}
                        onBlur={handleBlur('tpin')}
                        error={touched.tpin && !!errors.tpin}
                        style={authStyles.input}
                        mode="outlined"
                        keyboardType="numeric"
                        secureTextEntry
                        placeholder={isUrdu ? 'اپنا پن سیٹ کریں (مثلاً 123)' : 'Set your PIN (e.g. 123)'}
                        left={<TextInput.Icon icon="lock" />}
                        theme={inputTheme}
                      />
                      {touched.tpin && errors.tpin && (
                        <Text style={authStyles.errorText}>{errors.tpin}</Text>
                      )}
                    </View>
                    <Button
                      mode="contained"
                      onPress={() => handleSubmit()}
                      style={authStyles.button}
                    >
                      {isUrdu ? 'پن سیٹ کریں' : 'Set PIN'}
                    </Button>
                  </View>
                )}
              </Formik>
            )}
            {/* Popups */}
            {showPopup && (
              <View style={{
                position: 'absolute',
                top: '40%',
                left: '10%',
                right: '10%',
                backgroundColor: 'white',
                borderRadius: 16,
                padding: 24,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 8,
                zIndex: 1000,
              }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#009688', marginBottom: 12, textAlign: 'center' }}>
                  {popupMsg}
                </Text>
              </View>
            )}
          </LinearGradient>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

export default RegisterScreen; 