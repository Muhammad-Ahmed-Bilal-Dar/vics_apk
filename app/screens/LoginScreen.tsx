import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Formik } from 'formik';
import { useEffect, useState } from 'react';
import { Dimensions, Image, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Button, Text, TextInput } from 'react-native-paper';
import * as Yup from 'yup';
import OTPInput from '../components/OTPInput';
import { useAuth } from '../context/AuthContext';
import { authStyles, inputTheme } from '../theme/authStyles';

const { width } = Dimensions.get('window');

const LoginSchema = Yup.object().shape({
  mobile: Yup.string()
    .matches(/^\+92[0-9]{10}$/, 'Mobile number must start with +92 and be followed by 10 digits')
    .required('Mobile number is required'),
  pin: Yup.string()
    .matches(/^[0-9]{6,}$/, 'PIN must be at least 6 digits and numeric')
    .required('PIN is required'),
});

const LoginScreen = () => {
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const router = useRouter();
  const [step, setStep] = useState<'login' | 'forgot-mobile' | 'forgot-otp' | 'forgot-reset'>('login');
  const [forgotMobile, setForgotMobile] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotPin, setForgotPin] = useState('');
  const [timer, setTimer] = useState(60);
  const [isUrdu, setIsUrdu] = useState(true);

  const handleLogin = async (values: { mobile: string; pin: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      const success = await signIn(values.mobile, values.pin);
      if (success) {
        router.replace('(tabs)' as any);
        setTimeout(() => {
          setShowPopup(true);
        }, 3000);
      } else {
        setError('Invalid credentials. Please try again. Use 123 for both mobile and PIN for the demo.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let interval: any;
    if (step === 'forgot-otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, timer]);

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
                accessibilityLabel="Translate login labels"
              >
                <Text style={{ color: '#40cf45', fontWeight: 'bold', fontSize: 20, fontFamily: 'NotoNastaliqUrdu' }}>{isUrdu ? 'اردو' : 'English'}</Text>
                <Ionicons name="chevron-down" size={18} color="#40cf45" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>
            <Text style={authStyles.authTitle}>{isUrdu ? 'سائن ان کریں' : 'Sign in'}</Text>
            
            <View style={authStyles.headerContainer}>
              <Text style={authStyles.headerText}>{isUrdu ? 'گاڑی کی جانچ اور سرٹیفیکیشن سسٹم' : 'Vehicle Inspection and Certification System'}</Text>
            </View>
            
            <View style={authStyles.logoRow}>
              <Image source={require('../../assets/images/punjab-logo.png')} style={authStyles.logo} />
              <Image source={require('../../assets/images/transport-loho.png')} style={authStyles.logo} />
              <Image source={require('../../assets/images/PTA-logo.png')} style={authStyles.logo} />
            </View>
            
            {step === 'login' && (
              <Formik
                initialValues={{ mobile: '', pin: '' }}
                validationSchema={LoginSchema}
                onSubmit={handleLogin}
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
                    <View style={authStyles.inputContainer}>
                      <TextInput
                        // label={isUrdu ? 'پن' : 'PIN'}
                        value={values.pin}
                        onChangeText={handleChange('pin')}
                        onBlur={handleBlur('pin')}
                        error={touched.pin && !!errors.pin}
                        style={authStyles.input}
                        mode="outlined"
                        keyboardType="numeric"
                        secureTextEntry
                        placeholder={isUrdu ? 'اپنا پن درج کریں (123)' : 'Enter your PIN (123)'}
                        left={<TextInput.Icon icon="lock" />}
                        theme={inputTheme}
                      />
                      {touched.pin && errors.pin && (
                        <Text style={authStyles.errorText}>{errors.pin}</Text>
                      )}
                    </View>
                    {error && <Text style={authStyles.errorText}>{error}</Text>}
                    <Button
                      mode="contained"
                      onPress={() => handleSubmit()}
                      style={authStyles.button}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <ActivityIndicator animating={true} color="#FFFFFF" size="small" />
                      ) : (
                        isUrdu ? 'لاگ ان کریں' : 'LOGIN'
                      )}
                    </Button>
                    <Button
                      mode="outlined"
                      onPress={() => router.push('/register')}
                      style={[authStyles.button, { marginTop: 12, backgroundColor: 'white', borderColor: '#009688', borderWidth: 1 }]}
                      labelStyle={{ color: '#009688', fontWeight: 'bold' }}
                    >
                      {isUrdu ? 'رجسٹر کریں' : 'Register'}
                    </Button>
                    <Button
                      mode="text"
                      onPress={() => setStep('forgot-mobile')}
                      style={{ marginTop: 8 }}
                      labelStyle={{ color: '#fff', fontWeight: 'bold', textDecorationLine: 'underline', fontSize: 15 }}
                    >
                      {isUrdu ? 'پن بھول گئے؟' : 'Forgot PIN?'}
                    </Button>
                  </View>
                )}
              </Formik>
            )}
            {step === 'forgot-mobile' && (
              <View style={authStyles.formContainer}>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>{isUrdu ? 'پن بھول گئے' : 'Forgot PIN'}</Text>
                <Text style={{ color: '#fff', fontSize: 15, marginBottom: 8 }}>{isUrdu ? 'اپنا موبائل نمبر درج کریں تاکہ آپ کا پن ری سیٹ ہو سکے' : 'Enter your mobile number to reset your PIN'}</Text>
                <View style={authStyles.inputContainer}>
                  <TextInput
                    label={isUrdu ? 'موبائل نمبر' : 'Mobile Number'}
                    value={forgotMobile}
                    onChangeText={text => {
                      let val = text;
                      if (!val.startsWith('+92')) val = '+92' + val.replace(/^\+?92?/, '');
                      val = val.replace(/[^0-9+]/g, '');
                      if (val.length > 13) val = val.slice(0, 13);
                      setForgotMobile(val);
                    }}
                    style={authStyles.input}
                    mode="outlined"
                    keyboardType="phone-pad"
                    placeholder={isUrdu ? '+92XXXXXXXXXX' : '+92XXXXXXXXXX'}
                    left={<TextInput.Icon icon="phone" />}
                    theme={inputTheme}
                    maxLength={13}
                  />
                </View>
                <Button
                  mode="contained"
                  onPress={() => { setStep('forgot-otp'); setTimer(60); }}
                  style={authStyles.button}
                  disabled={!forgotMobile}
                >
                  {isUrdu ? 'اگلا' : 'Next'}
                </Button>
                <Button
                  mode="text"
                  onPress={() => setStep('login')}
                  style={{ marginTop: 8 }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}
                >
                  {isUrdu ? 'واپس لاگ ان پر' : 'Back to Login'}
                </Button>
              </View>
            )}
            {step === 'forgot-otp' && (
              <View style={authStyles.formContainer}>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>{isUrdu ? 'او ٹی پی تصدیق' : 'OTP Verification'}</Text>
                <Text style={{ color: '#fff', fontSize: 15, marginBottom: 8 }}>{isUrdu ? 'اپنے موبائل پر بھیجا گیا او ٹی پی درج کریں' : 'Enter the OTP sent to your mobile'}</Text>
                <View style={authStyles.inputContainer}>
                  <OTPInput
                    value={forgotOtp}
                    onChange={setForgotOtp}
                    length={6}
                    disabled={false}
                  />
                  <Text style={authStyles.timerText}>{isUrdu ? `وقت باقی: ${timer} سیکنڈ` : `Time remaining: ${timer} seconds`}</Text>
                </View>
                <Button
                  mode="contained"
                  onPress={() => setStep('forgot-reset')}
                  style={authStyles.button}
                  disabled={forgotOtp.length !== 6}
                >
                  {isUrdu ? 'تصدیق کریں' : 'Verify OTP'}
                </Button>
                <Button
                  mode="text"
                  onPress={() => setStep('forgot-mobile')}
                  style={{ marginTop: 8 }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}
                >
                  {isUrdu ? 'واپس' : 'Back'}
                </Button>
              </View>
            )}
            {step === 'forgot-reset' && (
              <View style={authStyles.formContainer}>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>{isUrdu ? 'پن ری سیٹ کریں' : 'Reset PIN'}</Text>
                <Text style={{ color: '#fff', fontSize: 15, marginBottom: 8 }}>{isUrdu ? 'اپنا نیا پن درج کریں' : 'Enter your new PIN'}</Text>
                <View style={authStyles.inputContainer}>
                  <TextInput
                    label={isUrdu ? 'نیا پن' : 'New PIN'}
                    value={forgotPin}
                    onChangeText={setForgotPin}
                    style={authStyles.input}
                    mode="outlined"
                    keyboardType="numeric"
                    secureTextEntry
                    placeholder={isUrdu ? 'نیا پن درج کریں' : 'Enter new PIN'}
                    left={<TextInput.Icon icon="lock-reset" />}
                    theme={inputTheme}
                  />
                </View>
                <Button
                  mode="contained"
                  onPress={() => { setStep('login'); setForgotMobile(''); setForgotOtp(''); setForgotPin(''); }}
                  style={authStyles.button}
                  disabled={!forgotPin}
                >
                  {isUrdu ? 'پن ری سیٹ کریں' : 'Reset PIN'}
                </Button>
              </View>
            )}
            {/* Registration Complete Popup */}
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
                  {isUrdu ? 'اپنی رجسٹریشن مکمل کریں!' : 'Complete your registration!'}
                </Text>
                <Button mode="contained" onPress={() => setShowPopup(false)} style={{ marginTop: 8 }}>
                  OK
                </Button>
              </View>
            )}
          </LinearGradient>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

export default LoginScreen; 