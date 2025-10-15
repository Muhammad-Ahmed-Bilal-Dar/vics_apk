import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { Colors, Spacing } from '../theme/theme';
import { formatFee, getFeeCategory } from '../utils/feeCalculation';

const epayLogo = require('../../assets/images/epay_logo.png');
const easypaisaLogo = require('../../assets/images/easypaisa.png');
const jazzcashLogo = require('../../assets/images/jazzcash.png');

export default function EpayScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [showPaymentInstructions, setShowPaymentInstructions] = useState(false);
  
  // Expecting params: { psid: string, amount: number, vehicleInfo?: string }
  const params = (route as any).params || {};
  const psid = params.psid || '';
  
  // Parse vehicle info if it's a JSON string
  let vehicleInfo = null;
  if (params.vehicleInfo) {
    try {
      vehicleInfo = typeof params.vehicleInfo === 'string' 
        ? JSON.parse(params.vehicleInfo) 
        : params.vehicleInfo;
    } catch (e) {
      console.error('Error parsing vehicleInfo:', e);
      vehicleInfo = params.vehicleInfo;
    }
  }
  
  let amount = params.amount;
  if (typeof amount === 'string') {
    amount = parseFloat(amount);
  }
  if (typeof amount !== 'number' || isNaN(amount)) {
    amount = 0;
  }

  // Format the amount properly
  const formattedAmount = formatFee(amount);
  
  // Get fee category if vehicle CC is available
  const feeCategory = vehicleInfo?.engineCC ? getFeeCategory(vehicleInfo.engineCC) : null;

  return (
    <View style={styles.container}>
      <Image source={epayLogo} style={styles.logo} resizeMode="contain" />
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.title}>ePay Punjab</Text>
          <Text style={styles.subtitle}>Secure PSID Payment</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>PSID:</Text>
            <Text style={styles.value}>{psid}</Text>
          </View>

          {vehicleInfo && (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Vehicle:</Text>
                <Text style={styles.value}>{vehicleInfo.make} {vehicleInfo.model}</Text>
              </View>
              
              {vehicleInfo.engineCC && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Engine CC:</Text>
                  <Text style={styles.value}>{vehicleInfo.engineCC} cc</Text>
                </View>
              )}

              {feeCategory && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Fee Category:</Text>
                  <Text style={styles.categoryValue}>{feeCategory}</Text>
                </View>
              )}
            </>
          )}

          <View style={[styles.infoRow, styles.amountRow]}>
            <Text style={styles.amountLabel}>Total Amount:</Text>
            <Text style={styles.amountValue}>{formattedAmount}</Text>
          </View>
          
          <Button
            mode="contained"
            style={styles.payButton}
            buttonColor={Colors.button.default}
            labelStyle={{ color: '#fff', fontWeight: 'bold' }}
            onPress={() => setShowPaymentInstructions(true)}
          >
            Proceed to Pay {formattedAmount}
          </Button>
        </Card.Content>
      </Card>

      {/* Payment Instructions Modal */}
      <Modal
        visible={showPaymentInstructions}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPaymentInstructions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>How to Pay</Text>
              <TouchableOpacity
                onPress={() => setShowPaymentInstructions(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
            
            {/* Payment Details */}
            <View style={styles.paymentDetails}>
              <Text style={styles.detailLabel}>PSID: <Text style={styles.detailValue}>{psid}</Text></Text>
              <Text style={styles.detailLabel}>Amount: <Text style={styles.detailValue}>{formattedAmount}</Text></Text>
            </View>
            
            <ScrollView style={styles.instructionsContainer} showsVerticalScrollIndicator={false}>
              
              {/* Bank App */}
              <View style={styles.paymentMethod}>
                <View style={styles.methodHeader}>
                  <View style={[styles.iconContainer, {backgroundColor: '#E3F2FD'}]}>
                    <Ionicons name="card-outline" size={28} color="#1976D2" />
                  </View>
                  <Text style={styles.methodTitle}>Bank Mobile App</Text>
                </View>
                <View style={styles.stepContainer}>
                  <Text style={styles.step}>1. Open your bank app</Text>
                  <Text style={styles.step}>2. Go to "Bill Payment"</Text>
                  <Text style={styles.step}>3. Select "Government Services"</Text>
                  <Text style={styles.step}>4. Choose "VICS Vehicle Inspection"</Text>
                  <Text style={styles.step}>5. Enter details and pay</Text>
                </View>
              </View>

              {/* JazzCash */}
              <View style={styles.paymentMethod}>
                <View style={styles.methodHeader}>
                  <View style={[styles.iconContainer, {backgroundColor: '#FFF'}]}>
                    <Image source={jazzcashLogo} style={styles.logoImage} resizeMode="contain" />
                  </View>
                  <Text style={styles.methodTitle}>JazzCash</Text>
                </View>
                <View style={styles.stepContainer}>
                  <Text style={styles.step}>1. Open JazzCash app</Text>
                  <Text style={styles.step}>2. Tap "Bill Payment"</Text>
                  <Text style={styles.step}>3. Select "Government"</Text>
                  <Text style={styles.step}>4. Choose "VICS"</Text>
                  <Text style={styles.step}>5. Enter Consumer No and pay</Text>
                </View>
              </View>

              {/* Easypaisa */}
              <View style={styles.paymentMethod}>
                <View style={styles.methodHeader}>
                  <View style={[styles.iconContainer, {backgroundColor: '#FFF'}]}>
                    <Image source={easypaisaLogo} style={styles.logoImage} resizeMode="contain" />
                  </View>
                  <Text style={styles.methodTitle}>Easypaisa</Text>
                </View>
                <View style={styles.stepContainer}>
                  <Text style={styles.step}>1. Open Easypaisa app</Text>
                  <Text style={styles.step}>2. Select "Bill Payments"</Text>
                  <Text style={styles.step}>3. Go to "Government Services"</Text>
                  <Text style={styles.step}>4. Find "VICS Vehicle Testing"</Text>
                  <Text style={styles.step}>5. Enter Reference and pay</Text>
                </View>
              </View>

              {/* Important Note */}
              <View style={styles.importantNote}>
                <Ionicons name="information-circle" size={24} color="#FF6B00" />
                <Text style={styles.noteText}>
                  Payment confirmation may take 5-10 minutes to appear in the system.
                </Text>
              </View>
            </ScrollView>

            {/* Bottom Button */}
            <View style={styles.bottomContainer}>
              <TouchableOpacity
                style={styles.gotItButton}
                onPress={() => setShowPaymentInstructions(false)}
              >
                <Text style={styles.gotItButtonText}>Got It!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.l,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: Spacing.l,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 18,
    elevation: 5,
    backgroundColor: Colors.card.light,
    paddingVertical: Spacing.l,
    paddingHorizontal: Spacing.l,
  },
  title: {
    color: Colors.primary.default,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: Spacing.s,
  },
  subtitle: {
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.l,
    fontSize: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.m,
  },
  label: {
    color: Colors.text.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  value: {
    color: Colors.primary.default,
    fontWeight: 'bold',
    fontSize: 16,
  },
  categoryValue: {
    color: Colors.text.secondary,
    fontWeight: '600',
    fontSize: 14,
  },
  amountRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: Spacing.m,
    marginTop: Spacing.s,
  },
  amountLabel: {
    color: Colors.text.primary,
    fontWeight: 'bold',
    fontSize: 18,
  },
  amountValue: {
    color: Colors.primary.default,
    fontWeight: 'bold',
    fontSize: 20,
  },
  payButton: {
    marginTop: Spacing.l,
    borderRadius: 8,
    paddingVertical: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    height: '95%',
    width: '95%',
    maxWidth: 450,
    elevation: 20,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    backgroundColor: '#2E7D32',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 5,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  paymentDetails: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  detailLabel: {
    fontSize: 17,
    color: '#555',
    marginBottom: 2,
  },
  detailValue: {
    fontWeight: 'bold',
    color: '#2E7D32',
    fontSize: 17,
  },
  instructionsContainer: {
    flex: 1,
    padding: 15,
  },
  paymentMethod: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    
  },
  iconContainer: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
  },
  logoImage: {
    width: 45,
    height: 45,
  },
  methodTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#333',
  },
  stepContainer: {
    paddingLeft: 15,
  },
  step: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
    lineHeight: 24,
    paddingLeft: 8,
  },
  importantNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    padding: 18,
    borderRadius: 12,
    marginTop: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B00',
  },
  noteText: {
    fontSize: 15,
    color: '#E65100',
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
    fontWeight: '500',
  },
  bottomContainer: {
    padding: 25,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },
  gotItButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gotItButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
}); 