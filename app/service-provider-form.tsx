import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Dialog, Divider, Portal, Text, TextInput, Title } from 'react-native-paper';
import { Colors } from './theme/theme';

const translations = {
  title: {
    en: 'Eligibility Criteria for Service Provider',
    ur: 'سروس فراہم کنندہ کے لیے اہلیت کے معیار',
  },
  basicInfo: {
    en: '1. Basic Information',
    ur: '1. بنیادی معلومات',
  },
  legalName: {
    en: 'Applicant Legal Name',
    ur: 'درخواست دہندہ کا قانونی نام',
  },
  contact: {
    en: 'Contact Details',
    ur: 'رابطے کی تفصیلات',
  },
  address: {
    en: 'Postal Address',
    ur: 'ڈاک کا پتہ',
  },
  secp: {
    en: '2. Company Incorporation Certificate (SECP)',
    ur: '2. کمپنی انکارپوریشن سرٹیفکیٹ (SECP)',
  },
  secpUpload: {
    en: 'Upload PDF',
    ur: 'پی ڈی ایف اپ لوڈ کریں',
  },
  ntn: {
    en: '3. NTN Registration',
    ur: '3. این ٹی این رجسٹریشن',
  },
  ntnLabel: {
    en: 'NTN Registration',
    ur: 'این ٹی این رجسٹریشن',
  },
  tax: {
    en: '4. Previous Tax Returns',
    ur: '4. پچھلے ٹیکس ریٹرن',
  },
  equipment: {
    en: '5. Equipment Details',
    ur: '5. آلات کی تفصیلات',
  },
  equipmentLabel: {
    en: 'Five Gas Emission Analyzer and Diesel Opacimeter Setup',
    ur: 'فائیو گیس ایمیشن اینالائزر اور ڈیزل اوپیسیمیٹر سیٹ اپ',
  },
  techSpecs: {
    en: 'Minimum Technical Specifications (annexed herewith)',
    ur: 'کم از کم تکنیکی وضاحتیں (ساتھ منسلک)',
  },
  oemAuth: {
    en: '6. Valid Authorization from the OEM for the Authorized Representative / JV',
    ur: '6. مجاز نمائندے / جے وی کے لیے OEM سے درست اجازت نامہ',
  },
  oemCapacity: {
    en: '7. Production Capacity of OEM for the specified equipment',
    ur: '7. مخصوص آلات کے لیے OEM کی پیداواری صلاحیت',
  },
  oemCapacityLabel: {
    en: 'Production Capacity',
    ur: 'پیداواری صلاحیت',
  },
  oemCapacityCert: {
    en: 'Certificate on OEM letterhead',
    ur: 'OEM لیٹر ہیڈ پر سرٹیفکیٹ',
  },
  warranty: {
    en: '8. Warranty Compliance',
    ur: '8. وارنٹی کی تعمیل',
  },
  warrantyAuth: {
    en: 'Authorization on OEM letterhead',
    ur: 'OEM لیٹر ہیڈ پر اجازت نامہ',
  },
  submit: {
    en: 'Submit',
    ur: 'جمع کریں',
  },
};

const inputTheme = {
  colors: {
    text: '#050505',
    placeholder: Colors.text.tertiary,
    onSurface: '#050505',
    primary: Colors.primary.main,
    error: Colors.status.error.main,
  }
};

interface FormState {
  legalName: string;
  contact: string;
  address: string;
  secpCert: any;
  ntn: string;
  taxReturns: any;
  equipmentDetails: string;
  techSpecs: any;
  oemAuth: any;
  oemCapacity: string;
  oemCapacityCert: any;
  warrantyAuth: any;
}

export default function ServiceProviderForm() {
  const [form, setForm] = useState<FormState>({
    legalName: '',
    contact: '',
    address: '',
    secpCert: null,
    ntn: '',
    taxReturns: null,
    equipmentDetails: '',
    techSpecs: null,
    oemAuth: null,
    oemCapacity: '',
    oemCapacityCert: null,
    warrantyAuth: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [isUrdu, setIsUrdu] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const router = useRouter();

  const handlePick = async (field: keyof FormState) => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (!result.canceled && result.assets && result.assets[0]) {
      setForm((prev) => ({ ...prev, [field]: result.assets[0] }));
    }
  };

  const handleChange = (field: keyof FormState, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setShowDialog(true);
    }, 1500);
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    router.replace('/');
  };

  return (
    <View style={{ flex: 1 }}>
      <Portal>
        <Dialog visible={showDialog} onDismiss={handleDialogClose}>
          <Dialog.Title>Success</Dialog.Title>
          <Dialog.Content>
            <Text>Your form is submitted!!</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleDialogClose}>OK</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <TouchableOpacity
        style={styles.translateBtn}
        onPress={() => setIsUrdu((prev) => !prev)}
        activeOpacity={0.7}
      >
        <Ionicons name="language" size={20} color={Colors.primary.main} />
        <Text style={styles.translateBtnText}>{isUrdu ? 'English' : 'اردو'}</Text>
      </TouchableOpacity>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
        <Title style={styles.title}>{isUrdu ? translations.title.ur : translations.title.en}</Title>
        <Divider style={{ marginBottom: 16 }} />
        <Text style={styles.section}>{isUrdu ? translations.basicInfo.ur : translations.basicInfo.en}</Text>
        <TextInput
          label={isUrdu ? translations.legalName.ur : translations.legalName.en}
          value={form.legalName}
          onChangeText={(v) => handleChange('legalName', v)}
          style={styles.input}
          mode="outlined"
          theme={inputTheme}
        />
        <TextInput
          label={isUrdu ? translations.contact.ur : translations.contact.en}
          value={form.contact}
          onChangeText={(v) => handleChange('contact', v)}
          style={styles.input}
          mode="outlined"
          theme={inputTheme}
        />
        <TextInput
          label={isUrdu ? translations.address.ur : translations.address.en}
          value={form.address}
          onChangeText={(v) => handleChange('address', v)}
          style={styles.input}
          mode="outlined"
          theme={inputTheme}
        />
        <Text style={styles.section}>{isUrdu ? translations.secp.ur : translations.secp.en}</Text>
        <Button
          mode="contained"
          onPress={() => handlePick('secpCert')}
          style={styles.uploadBtn}
          buttonColor={Colors.primary.main}
          labelStyle={styles.buttonLabel}
          contentStyle={styles.buttonContent}
        >
          {form.secpCert ? form.secpCert.name : isUrdu ? translations.secpUpload.ur : translations.secpUpload.en}
        </Button>
        <Text style={styles.section}>{isUrdu ? translations.ntn.ur : translations.ntn.en}</Text>
        <TextInput
          label={isUrdu ? translations.ntnLabel.ur : translations.ntnLabel.en}
          value={form.ntn}
          onChangeText={(v) => handleChange('ntn', v)}
          style={styles.input}
          mode="outlined"
          theme={inputTheme}
        />
        <Text style={styles.section}>{isUrdu ? translations.tax.ur : translations.tax.en}</Text>
        <Button
          mode="contained"
          onPress={() => handlePick('taxReturns')}
          style={styles.uploadBtn}
          buttonColor={Colors.primary.main}
          labelStyle={styles.buttonLabel}
          contentStyle={styles.buttonContent}
        >
          {form.taxReturns ? form.taxReturns.name : isUrdu ? translations.secpUpload.ur : translations.secpUpload.en}
        </Button>
        <Text style={styles.section}>{isUrdu ? translations.equipment.ur : translations.equipment.en}</Text>
        <TextInput
          label={isUrdu ? translations.equipmentLabel.ur : translations.equipmentLabel.en}
          value={form.equipmentDetails}
          onChangeText={(v) => handleChange('equipmentDetails', v)}
          style={styles.input}
          mode="outlined"
          theme={inputTheme}
        />
        <Text style={styles.subSection}>{isUrdu ? translations.techSpecs.ur : translations.techSpecs.en}</Text>
        <Button
          mode="contained"
          onPress={() => handlePick('techSpecs')}
          style={styles.uploadBtn}
          buttonColor={Colors.primary.main}
          labelStyle={styles.buttonLabel}
          contentStyle={styles.buttonContent}
        >
          {form.techSpecs ? form.techSpecs.name : isUrdu ? translations.secpUpload.ur : translations.secpUpload.en}
        </Button>
        <Text style={styles.section}>{isUrdu ? translations.oemAuth.ur : translations.oemAuth.en}</Text>
        <Button
          mode="contained"
          onPress={() => handlePick('oemAuth')}
          style={styles.uploadBtn}
          buttonColor={Colors.primary.main}
          labelStyle={styles.buttonLabel}
          contentStyle={styles.buttonContent}
        >
          {form.oemAuth ? form.oemAuth.name : isUrdu ? translations.secpUpload.ur : translations.secpUpload.en}
        </Button>
        <Text style={styles.section}>{isUrdu ? translations.oemCapacity.ur : translations.oemCapacity.en}</Text>
        <TextInput
          label={isUrdu ? translations.oemCapacityLabel.ur : translations.oemCapacityLabel.en}
          value={form.oemCapacity}
          onChangeText={(v) => handleChange('oemCapacity', v)}
          style={styles.input}
          mode="outlined"
          theme={inputTheme}
        />
        <Text style={styles.subSection}>{isUrdu ? translations.oemCapacityCert.ur : translations.oemCapacityCert.en}</Text>
        <Button
          mode="contained"
          onPress={() => handlePick('oemCapacityCert')}
          style={styles.uploadBtn}
          buttonColor={Colors.primary.main}
          labelStyle={styles.buttonLabel}
          contentStyle={styles.buttonContent}
        >
          {form.oemCapacityCert ? form.oemCapacityCert.name : isUrdu ? translations.secpUpload.ur : translations.secpUpload.en}
        </Button>
        <Text style={styles.section}>{isUrdu ? translations.warranty.ur : translations.warranty.en}</Text>
        <Text style={styles.subSection}>{isUrdu ? translations.warrantyAuth.ur : translations.warrantyAuth.en}</Text>
        <Button
          mode="contained"
          onPress={() => handlePick('warrantyAuth')}
          style={styles.uploadBtn}
          buttonColor={Colors.primary.main}
          labelStyle={styles.buttonLabel}
          contentStyle={styles.buttonContent}
        >
          {form.warrantyAuth ? form.warrantyAuth.name : isUrdu ? translations.secpUpload.ur : translations.secpUpload.en}
        </Button>
        <Button
          mode="contained"
          style={styles.submitBtn}
          onPress={handleSubmit}
          loading={submitting}
          disabled={submitting}
          buttonColor={Colors.primary.main}
          labelStyle={styles.buttonLabel}
          contentStyle={styles.buttonContent}
        >
          {isUrdu ? translations.submit.ur : translations.submit.en}
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
    marginTop: 32,
  },
  translateBtn: {
    position: 'absolute',
    top: 80,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 2,
  },
  translateBtnText: {
    marginLeft: 6,
    color: Colors.primary.main,
    fontWeight: 'bold',
    fontSize: 14,
  },
  title: {
    marginBottom: 8,
    color: Colors.primary.main,
    fontWeight: 'bold',
    fontSize: 22,
    textAlign: 'center',
  },
  section: {
    marginTop: 18,
    marginBottom: 4,
    fontWeight: 'bold',
    color: Colors.primary.main,
    fontSize: 16,
  },
  subSection: {
    marginTop: 8,
    marginBottom: 4,
    color: Colors.text.primary,
    fontSize: 14,
  },
  input: {
    marginBottom: 8,
    backgroundColor: Colors.card.light,
    color: '#050505',
  },
  uploadBtn: {
    marginBottom: 8,
    alignSelf: 'flex-start',
    borderRadius: 8,
    ...Platform.select({
      android: { elevation: 2 },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  buttonLabel: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textTransform: 'none',
  },
  buttonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 8,
    minHeight: 36,
  },
  submitBtn: {
    marginTop: 24,
    borderRadius: 8,
    paddingVertical: 6,
    ...Platform.select({
      android: { elevation: 2 },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
}); 