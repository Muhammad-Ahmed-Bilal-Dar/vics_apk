import { useNavigation, useRoute } from '@react-navigation/native';
import { Image, StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { Colors, Spacing } from '../theme/theme';

const epayLogo = require('../../assets/images/epay_logo.png');

export default function EpayScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  // Expecting params: { psid: string, amount: number }
  const params = (route as any).params || {};
  const psid = params.psid || '';
  let amount = params.amount;
  if (typeof amount === 'string') {
    amount = parseFloat(amount);
  }
  if (typeof amount !== 'number' || isNaN(amount)) {
    amount = 0;
  }

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
          <View style={styles.infoRow}>
            <Text style={styles.label}>Amount:</Text>
            <Text style={styles.value}>PKR {amount?.toFixed(2)}</Text>
          </View>
          <Button
            mode="contained"
            style={styles.payButton}
            buttonColor={Colors.button.default}
            labelStyle={{ color: '#fff', fontWeight: 'bold' }}
            onPress={() => {/* Payment logic here */}}
          >
            Proceed to Pay
          </Button>
        </Card.Content>
      </Card>
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
  payButton: {
    marginTop: Spacing.l,
    borderRadius: 8,
    paddingVertical: 10,
  },
}); 