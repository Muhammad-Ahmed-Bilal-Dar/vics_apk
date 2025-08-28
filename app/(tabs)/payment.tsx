import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, Divider, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../theme/theme';

// Define types
type VehicleInfo = {
  make: string;
  model: string;
  year: string;
  color: string;
  plateNo: string;
};

type StationInfo = {
  name: string;
  location: string;
  date: string;
  time?: string;
  day?: string;
};

type PSIDData = {
  psid: string;
  vehicle: VehicleInfo;
  station: StationInfo;
  amount: number;
  status: 'pending' | 'paid';
  paymentDate?: string;
  day?: string;
  month?: string;
  year?: string;
};

// Mock data for PSID vehicles
const mockPendingPSIDs: PSIDData[] = [
  { 
    psid: 'PU200821-88925518', 
    vehicle: { make: 'Toyota', model: 'Corolla Altis', year: '2018', color: 'White', plateNo: 'ABC-123' },
    station: { name: 'Central Inspection Center', location: 'Main Street, Riyadh', date: '2023-12-10', time: '10:30 AM', day: 'Monday' },
    amount: 150.00,
    status: 'pending',
    day: '20',
    month: 'AUG',
    year: '2023'
  },
  { 
    psid: 'PU200821-88925519', 
    vehicle: { make: 'Honda', model: 'Civic', year: '2020', color: 'Black', plateNo: 'XYZ-789' },
    station: { name: 'North Inspection Point', location: 'North Avenue, Jeddah', date: '2023-12-12', time: '12:45 PM', day: 'Wednesday' },
    amount: 150.00,
    status: 'pending',
    day: '20',
    month: 'AUG',
    year: '2023'
  },
  { 
    psid: 'PU200821-88925520', 
    vehicle: { make: 'Nissan', model: 'Altima', year: '2019', color: 'Silver', plateNo: 'DEF-456' },
    station: { name: 'East Station', location: 'East Road, Dammam', date: '2023-12-15', time: '2:15 PM', day: 'Friday' },
    amount: 150.00,
    status: 'pending',
    day: '20',
    month: 'AUG',
    year: '2023'
  },
  { 
    psid: 'PU200821-88925521', 
    vehicle: { make: 'Hyundai', model: 'Elantra', year: '2021', color: 'Blue', plateNo: 'GHI-789' },
    station: { name: 'West Inspection Hub', location: 'West Street, Mecca', date: '2023-12-18', time: '9:00 AM', day: 'Sunday' },
    amount: 150.00,
    status: 'pending',
    day: '20',
    month: 'AUG',
    year: '2023'
  },
  { 
    psid: 'PU200821-88925522', 
    vehicle: { make: 'Kia', model: 'Optima', year: '2020', color: 'Red', plateNo: 'JKL-012' },
    station: { name: 'South Inspection Center', location: 'South Boulevard, Medina', date: '2023-12-20', time: '3:30 PM', day: 'Tuesday' },
    amount: 150.00,
    status: 'pending',
    day: '20',
    month: 'AUG',
    year: '2023'
  }
];

const mockPaidPSIDs: PSIDData[] = [
  { 
    psid: 'PU200821-88925523', 
    vehicle: { make: 'BMW', model: '3 Series', year: '2019', color: 'Black', plateNo: 'MNO-345' },
    station: { name: 'Premium Inspection Center', location: 'Luxury Avenue, Riyadh', date: '2023-11-25', time: '11:00 AM', day: 'Saturday' },
    amount: 150.00,
    status: 'paid',
    paymentDate: '2023-11-25',
    day: '20',
    month: 'AUG',
    year: '2023'
  },
  { 
    psid: 'PU200821-88925524', 
    vehicle: { make: 'Mercedes', model: 'C-Class', year: '2020', color: 'Silver', plateNo: 'PQR-678' },
    station: { name: 'Elite Inspection Point', location: 'High Street, Jeddah', date: '2023-11-20', time: '1:15 PM', day: 'Thursday' },
    amount: 150.00,
    status: 'paid',
    paymentDate: '2023-11-20',
    day: '20',
    month: 'AUG',
    year: '2023'
  },
  { 
    psid: 'PU200821-88925525', 
    vehicle: { make: 'Audi', model: 'A4', year: '2018', color: 'White', plateNo: 'STU-901' },
    station: { name: 'Premium Center', location: 'Main Road, Dammam', date: '2023-11-15', time: '10:45 AM', day: 'Monday' },
    amount: 150.00,
    status: 'paid',
    paymentDate: '2023-11-15',
    day: '20',
    month: 'AUG',
    year: '2023'
  }
];

export default function PaymentScreen() {
  const [activeTab, setActiveTab] = useState('pending');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [pendingItems, setPendingItems] = useState<PSIDData[]>(mockPendingPSIDs);
  const [paidItems, setPaidItems] = useState<PSIDData[]>(mockPaidPSIDs);
  const navigation = useNavigation();

  const handlePayment = (psid: string) => {
    // Find the PSID data
    const item = pendingItems.find(item => item.psid === psid);
    if (item) {
      (navigation as any).navigate('screens/epay', { psid: item.psid, amount: item.amount });
    }
  };

  const toggleCardExpansion = (psid: string) => {
    if (expandedCard === psid) {
      setExpandedCard(null);
    } else {
      setExpandedCard(psid);
    }
  };

  const handleDeletePSID = (psid: string) => {
    // Remove the PSID from the appropriate list
    if (activeTab === 'pending') {
      setPendingItems(pendingItems.filter(item => item.psid !== psid));
    } else {
      setPaidItems(paidItems.filter(item => item.psid !== psid));
    }
  };

  const getStatusColors = (status: 'pending' | 'paid') => {
    if (status === 'paid') {
      return {
        indicator: Colors.status.success.main || Colors.status.success.default,
        chip: Colors.status.success.lighter || '#E6F9ED',
        text: '#000',
      };
    }
    return {
      indicator: Colors.status.pending.main || Colors.status.pending.default,
      chip: Colors.status.pending.lighter || '#FFF7E6',
      text: '#000',
    };
  };

  const renderPSIDCard = (item: PSIDData, showPayButton = false) => {
    const isExpanded = expandedCard === item.psid;
    const statusColors = getStatusColors(item.status);
    const carName = `${item.vehicle.make} ${item.vehicle.model} ${item.vehicle.year}`;
    const dateLabel = item.status === 'pending' ? item.station.date : item.paymentDate;
    
    return (
      <Card key={item.psid} style={styles.psidCard}>
        <View style={[styles.accentBar, { backgroundColor: statusColors.indicator }]} />
        <View style={styles.psCardContentModern}>
          <View style={styles.psCardHeaderModern}>
            <View style={styles.psHeaderLeftModern}>
              <Text style={styles.psidTitle}>{item.psid}</Text>
              <View style={styles.psMetaRow}>
                <View style={styles.psMetaItem}>
                  <Ionicons name="car" size={14} color={Colors.light.text.tertiary} />
                  <Text style={styles.psMetaText}>{carName}</Text>
                </View>
                <View style={styles.psMetaItem}>
                  <Ionicons name="calendar" size={14} color={Colors.light.text.tertiary} />
                  <Text style={styles.psMetaText}>{dateLabel}</Text>
                </View>
              </View>
            </View>
            <View style={styles.psHeaderRightModern}>
              {showPayButton ? (
                <TouchableOpacity
                  style={styles.payNowButton}
                  onPress={() => handlePayment(item.psid)}
                  activeOpacity={0.9}
                >
                  <Text style={styles.payNowText}>Pay Now</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.paidBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#fff" />
                  <Text style={styles.paidText}>Paid</Text>
                </View>
              )}
            </View>
          </View>

          {isExpanded && (
            <View style={styles.expandedContentWrapper}>
              <Divider style={styles.divider} />
              <View style={styles.expandedContent}>
                <View style={styles.infoRow}>
                  <View style={styles.infoColumn}>
                    <Text variant="labelMedium" style={styles.infoLabel}>Vehicle Details</Text>
                    <Text variant="bodyMedium" style={styles.infoValue}>
                      {item.vehicle.year} {item.vehicle.color} {item.vehicle.make} {item.vehicle.model}
                    </Text>
                  </View>
                </View>
                <View style={styles.infoRow}>
                  <View style={styles.infoColumn}>
                    <Text variant="labelMedium" style={styles.infoLabel}>Inspection Station</Text>
                    <Text variant="bodyMedium" style={styles.infoValue}>{item.station.name}</Text>
                    <Text variant="bodySmall" style={styles.infoSubValue}>{item.station.location}</Text>
                  </View>
                </View>
                <View style={styles.infoRow}>
                  <View style={styles.infoColumn}>
                    <Text variant="labelMedium" style={styles.infoLabel}>
                      {item.status === 'pending' ? 'Inspection Date & Time' : 'Payment Date & Time'}
                    </Text>
                    <Text variant="bodyMedium" style={styles.infoValue}>
                      {item.status === 'pending' ? item.station.date : item.paymentDate}
                    </Text>
                    <Text variant="bodyMedium" style={styles.infoValue}>
                      Time: {item.station.time || '10:30 AM'}
                    </Text>
                    <Text variant="bodyMedium" style={styles.infoValue}>
                      Day: {item.station.day || 'Monday'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          <View style={styles.showMoreRow}
          >
            <TouchableOpacity
              onPress={() => toggleCardExpansion(item.psid)}
              activeOpacity={0.8}
              style={styles.showMoreButtonPill}
            >
              <Text style={styles.showMoreTextPill}>{isExpanded ? 'Show less' : 'Show more'}</Text>
              <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.primary.default} />
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      {/* <StatusBar style="auto" /> */}
      <View style={styles.content}>
        {/* <View style={styles.headerContainer}>
          <Text variant="headlineMedium" style={styles.headerTitle}>
            Payment System
          </Text>
        </View>  */}
        
        <View style={styles.tabContainerModern}>
          {[
            { key: 'pending', label: 'To Pay', icon: 'time' },
            { key: 'history', label: 'Payment History', icon: 'calendar' },
          ].map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabPill,
                activeTab === tab.key ? styles.tabPillActive : styles.tabPillInactive
              ]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.85}
            >
              <Ionicons
                name={tab.icon as any}
                size={16}
                color={activeTab === tab.key ? '#fff' : Colors.primary.default}
                style={styles.tabIcon}
              />
              <Text
                style={[
                  styles.tabPillTextSmall,
                  activeTab === tab.key ? styles.tabPillTextActive : styles.tabPillTextInactive
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          {activeTab === 'pending' ? (
            <View style={styles.cardsContainer}>
              {pendingItems.map(item => renderPSIDCard(item, true))}
            </View>
          ) : (
            <View style={styles.cardsContainer}>
              {paidItems.map(item => renderPSIDCard(item, false))}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 25
  },
  content: {
    padding: Spacing.m,
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.m,
  },
  headerTitle: {
    color: Colors.text.primary,
    fontWeight: 'bold',
  },
  // Reuse modern tab styles from other screens
  tabContainerModern: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 18,
    padding: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 2,
    flex: 1,
    justifyContent: 'center',
  },
  tabPillActive: {
    backgroundColor: Colors.primary.default,
  },
  tabPillInactive: {
    backgroundColor: '#F3F4F6',
  },
  tabPillTextSmall: {
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
  },
  tabPillTextActive: {
    color: '#fff',
  },
  tabPillTextInactive: {
    color: Colors.text.primary,
  },
  tabIcon: {
    marginRight: 0,
  },
  scrollView: {
    flex: 1,
  },
  cardsContainer: {
    paddingBottom: Spacing.m,
  },
  psidCard: {
    marginBottom: Spacing.s,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'white',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  accentBar: {
    height: 4,
    width: '100%',
  },
  psCardContentModern: {
    padding: Spacing.m,
  },
  psCardHeaderModern: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  psHeaderLeftModern: {
    flex: 1,
    paddingRight: Spacing.s,
  },
  psidTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 6,
  },
  psMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  psMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  psMetaText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginLeft: 4,
  },
  psHeaderRightModern: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.xs,
    paddingVertical: Spacing.s,
  },
  dateCircle: {
    width: 65,
    height: 65,
    borderRadius: 30,
    backgroundColor: 'rgba(19, 171, 128, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  dateDay: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 20,
    lineHeight: 22,
  },
  dateMonth: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 12,
    lineHeight: 16,
  },
  dateYear: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 12,
    lineHeight: 16,
  },
  cardContent: {
    flex: 1,
    marginRight: 10,
  },
  psidInfo: {
    flex: 1,
    marginBottom: 0,
  },
  psidNumber: {
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 2,
    fontSize: 15,
  },
  applicationText: {
    color: Colors.text.secondary,
    marginBottom: 8,
    fontSize: 13,
  },
  vehicleInfo: {
    color: Colors.text.secondary,
    marginBottom: 15,
    fontSize: 13,
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1,
  },
  statusLabel: {
    color: '#444',
    marginRight: Spacing.xs,
    fontWeight: '600',
    fontSize: 13,
  },
  chipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusChip: {
    paddingHorizontal: 13,
    paddingVertical: 3,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(109, 93, 93)',
  },
  statusText: {
    color: 'rgb(12, 10, 10)',
    fontWeight: 'bold',
    fontSize: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
    paddingVertical: 4,
  },
  seeDetailsText: {
    color: '#3E4095',
    fontWeight: 'bold',
    fontSize: 13,
  },
  arabicText: {
    color: Colors.text.primary,
    fontSize: 13,
  },
  arrowContainer: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  divider: {
    backgroundColor: Colors.divider,
  },
  expandedContentWrapper: {
    backgroundColor: Colors.card.dark,
  },
  expandedContent: {
    padding: Spacing.m,
    paddingTop: Spacing.s,
  },
  infoRow: {
    marginBottom: Spacing.s,
  },
  infoColumn: {
    flex: 1,
  },
  infoLabel: {
    color: Colors.text.tertiary,
    marginBottom: 2,
    fontWeight: '600',
  },
  infoValue: {
    color: Colors.text.primary,
  },
  infoSubValue: {
    color: Colors.text.secondary,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.s,
    paddingHorizontal: Spacing.m,
  },
  showMoreButton: {
    flex: 1,
    marginRight: Spacing.s,
    borderColor: Colors.divider,
  },
  payButton: {
    flex: 1,
    backgroundColor: Colors.button.default,
  },
  paidButton: {
    flex: 1,
    opacity: 0.7,
  },
  payNowContainer: {
    marginLeft: 10,
  },
  payNowButton: {
    backgroundColor: Colors.primary.default,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  payNowText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  paidBadge: {
    backgroundColor: Colors.status.success.default,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paidText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 4,
  },
  showMoreRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  showMoreButtonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'center',
  },
  showMoreTextPill: {
    color: Colors.primary.default,
    fontWeight: 'bold',
    marginRight: 6,
    fontSize: 13,
  },
}); 