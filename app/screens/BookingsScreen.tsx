import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { FlatList, Modal, Platform, ScrollView, StyleSheet, ToastAndroid, TouchableOpacity, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/theme';

// Booking data type
interface BookingItem {
  id: string;
  vehicle: string;
  center: string;
  date: string;
  validity: string;
  status: 'pending' | 'paid' | 'cancelled';
}

// Dummy booking data
const bookings: BookingItem[] = [
  {
    id: '1',
    vehicle: 'Toyota Corolla',
    center: 'Lahore Center',
    date: 'May 10, 2025',
    validity: 'May 10, 2026',
    status: 'pending',
  },
  {
    id: '2',
    vehicle: 'Honda Civic',
    center: 'Islamabad Center',
    date: 'May 15, 2025',
    validity: 'May 15, 2026',
    status: 'paid',
  },
  {
    id: '3',
    vehicle: 'Suzuki Swift',
    center: 'Karachi Center',
    date: 'Jan 10, 2025',
    validity: 'Jan 10, 2026',
    status: 'cancelled',
  },
  {
    id: '4',
    vehicle: 'Toyota Yaris',
    center: 'Peshawar Center',
    date: 'Dec 15, 2024',
    validity: 'Dec 15, 2025',
    status: 'paid',
  },
  {
    id: '5',
    vehicle: 'Honda City',
    center: 'Multan Center',
    date: 'Nov 20, 2024',
    validity: 'Nov 20, 2025',
    status: 'paid',
  },
  {
    id: '6',
    vehicle: 'Kia Sportage',
    center: 'Faisalabad Center',
    date: 'Oct 5, 2024',
    validity: 'Oct 5, 2025',
    status: 'pending',
  },
  {
    id: '7',
    vehicle: 'Hyundai Tucson',
    center: 'Sialkot Center',
    date: 'Sep 12, 2024',
    validity: 'Sep 12, 2025',
    status: 'cancelled',
  },
];

// Tab types
const TABS = [
  { key: 'booked', label: 'Booked' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'history', label: 'History' },
] as const;
type TabKey = typeof TABS[number]['key'];

export default function BookingsScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('booked');
  const [rescheduleModalVisible, setRescheduleModalVisible] = useState(false);
  const [rescheduleBooking, setRescheduleBooking] = useState<BookingItem | null>(null);
  const [newDate, setNewDate] = useState<Date | null>(null);
  const [newTime, setNewTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [bookingsState, setBookingsState] = useState<BookingItem[]>(bookings);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

  // Example available time slots
  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  // Filtering logic for each tab
  let filteredBookings: BookingItem[] = [];
  if (activeTab === 'booked') {
    filteredBookings = bookingsState.filter(b => b.status === 'pending');
  } else if (activeTab === 'confirmed') {
    filteredBookings = bookingsState.filter(b => b.status === 'paid');
  } else if (activeTab === 'history') {
    filteredBookings = bookingsState.filter(b => b.status === 'paid' || b.status === 'cancelled');
  }

  // Reschedule logic (mock backend placeholder)
  const handleOpenReschedule = (booking: BookingItem) => {
    setRescheduleBooking(booking);
    setNewDate(null);
    setNewTime(null);
    setRescheduleModalVisible(true);
  };

  const handleSaveReschedule = () => {
    if (!newDate || !selectedTimeSlot) {
      showToast('Please select both date and time.');
      return;
    }
    // Simulate API call
    setTimeout(() => {
      if (rescheduleBooking) {
        setBookingsState(prev => prev.map(b =>
          b.id === rescheduleBooking.id
            ? { ...b, date: newDate.toLocaleDateString() + ' ' + selectedTimeSlot }
            : b
        ));
      }
      setRescheduleModalVisible(false);
      showToast('Appointment rescheduled (mock).');
    }, 1000);
  };

  function showToast(msg: string) {
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      // For iOS, you can use a 3rd party snackbar or alert
      alert(msg);
    }
  }

  // Booking card renderer
  const renderBookingCard = (item: BookingItem) => {
    const isConfirmed = item.status === 'paid';
    const isHistoryTab = activeTab === 'history';
    const isExpanded = !!expandedMap[item.id];

    const getStatusColors = () => {
      switch (item.status) {
        case 'paid':
          return {
            indicator: Colors.status.success.main || Colors.status.success.default,
            chip: Colors.status.success.lighter || '#E6F9ED',
            text: Colors.common?.black || '#000',
          };
        case 'pending':
          return {
            indicator: Colors.status.pending.main || Colors.status.pending.default,
            chip: Colors.status.pending.lighter || '#FFF7E6',
            text: Colors.common?.black || '#000',
          };
        case 'cancelled':
        default:
          return {
            indicator: Colors.status.error.main || Colors.status.error.default,
            chip: Colors.status.error.lighter || '#FDE8E8',
            text: Colors.common?.black || '#000',
          };
      }
    };

    const statusColors = getStatusColors();
    const statusLabel = item.status === 'paid' ? 'Paid' : item.status === 'pending' ? 'Pending' : 'Cancelled';
    const statusIcon: keyof typeof Ionicons.glyphMap = item.status === 'paid' ? 'checkmark-circle' : item.status === 'pending' ? 'time' : 'close-circle';

    return (
      <Card key={item.id} style={[styles.card, styles.bookingCardModern]}>
        <View style={[styles.accentBar, { backgroundColor: statusColors.indicator }]} />
        <View style={styles.cardContentModern}>
          <View style={styles.cardHeaderModern}>
            <View style={styles.headerLeftModern}>
              <Text style={styles.vehicleTitleModern}>{item.vehicle}</Text>
              <View style={styles.metaRowModern}>
                <View style={styles.metaItemModern}>
                  <Ionicons name="calendar" size={14} color={Colors.light.text.tertiary} />
                  <Text style={styles.metaTextModern}>{item.date}</Text>
                </View>
              </View>
            </View>
            <View style={styles.headerRightModern}>
              <View style={[styles.statusChipModern, { backgroundColor: statusColors.chip }]}>
                <Ionicons name={statusIcon} size={14} color={statusColors.indicator} />
                <Text style={[styles.statusChipTextModern, { color: statusColors.text }]}>{statusLabel}</Text>
              </View>
              {isConfirmed && !isHistoryTab ? (
                <TouchableOpacity
                  style={styles.reschedulePillSmall}
                  onPress={() => handleOpenReschedule(item)}
                  activeOpacity={0.9}
                >
                  <Ionicons name="calendar-outline" size={14} color={Colors.primary.default} />
                  <Text style={styles.reschedulePillSmallText}>Reschedule</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {isExpanded && (
            <View style={styles.detailsContainerModern}>
              <View style={styles.detailRowModern}>
                <Ionicons name="location" size={18} color={Colors.primary.main} />
                <View style={styles.detailTextWrapModern}>
                  <Text style={styles.detailLabelModern}>Center</Text>
                  <Text style={styles.detailValueModern}>{item.center}</Text>
                </View>
              </View>
              <View style={styles.detailRowModern}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.primary.main} />
                <View style={styles.detailTextWrapModern}>
                  <Text style={styles.detailLabelModern}>Validity</Text>
                  <Text style={styles.detailValueModern}>{item.validity}</Text>
                </View>
              </View>
              {isConfirmed && isHistoryTab ? (
                <View style={styles.completedContainer}>
                  <Ionicons name="checkmark-done" size={16} color={Colors.primary.default} />
                  <Text style={styles.completedText}>Completed</Text>
                </View>
              ) : null}
            </View>
          )}

          <View style={styles.showMoreRow}>
            <TouchableOpacity
              onPress={() => setExpandedMap(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
              activeOpacity={0.8}
              style={styles.showMoreButton}
            >
              <Text style={styles.showMoreText}>{isExpanded ? 'Show less' : 'Show more'}</Text>
              <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.primary.default} />
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    );
  };

  // Reschedule Modal UI
  const renderRescheduleModal = () => (
    <Modal
      visible={rescheduleModalVisible}
      animationType="slide"
      transparent
      onRequestClose={() => setRescheduleModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Reschedule Appointment</Text>
          {rescheduleBooking && (
            <>
              <Text style={styles.modalLabel}>Vehicle: <Text style={styles.modalValue}>{rescheduleBooking.vehicle}</Text></Text>
              <Text style={styles.modalLabel}>Center: <Text style={styles.modalValue}>{rescheduleBooking.center}</Text></Text>
              <Text style={styles.modalLabel}>Current Date: <Text style={styles.modalValue}>{rescheduleBooking.date}</Text></Text>
              <Text style={styles.modalLabel}>Validity: <Text style={styles.modalValue}>{rescheduleBooking.validity}</Text></Text>
            </>
          )}
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar" size={16} color={Colors.primary.default} />
            <Text style={styles.pickerButtonText}>{newDate ? newDate.toLocaleDateString() : 'Select new date'}</Text>
          </TouchableOpacity>
          {/* Time Slot Picker */}
          <Text style={styles.timeSlotLabel}>Select Time Slot</Text>
          <FlatList
            data={timeSlots}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item}
            contentContainerStyle={styles.timeSlotList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.timeSlotButton, selectedTimeSlot === item && styles.timeSlotButtonSelected]}
                onPress={() => setSelectedTimeSlot(item)}
              >
                <Text style={[styles.timeSlotText, selectedTimeSlot === item && styles.timeSlotTextSelected]}>{item}</Text>
              </TouchableOpacity>
            )}
          />
          <View style={styles.modalActions}>
            <Button mode="outlined" onPress={() => setRescheduleModalVisible(false)} style={{flex:1,marginRight:8}}>Cancel</Button>
            <Button mode="contained" onPress={handleSaveReschedule} style={styles.saveButton} labelStyle={{color:'#fff'}}>Save</Button>
          </View>
        </View>
        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={newDate || new Date()}
            mode="date"
            display="default"
            onChange={(_: any, date?: Date) => {
              setShowDatePicker(false);
              if (date) setNewDate(date);
            }}
          />
        )}
      </View>
    </Modal>
  );

  // Tab icon mapping
  const tabIcons: Record<TabKey, string> = {
    booked: 'time',
    confirmed: 'checkmark-circle',
    history: 'calendar',
  };

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      {/* Modern Gradient Header */}
      <LinearGradient
        colors={[Colors.primary.main, Colors.primary.light]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <Text style={styles.headerTitleModern}>My Bookings</Text>
      </LinearGradient>

      {/* Modern Tab Container */}
      <View style={styles.tabContainerModern}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabPill,
              activeTab === tab.key ? styles.tabPillActive : styles.tabPillInactive
            ]}
            onPress={() => setActiveTab(tab.key as TabKey)}
            activeOpacity={0.85}
          >
            <Ionicons
              name={tabIcons[tab.key] as any}
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

      {/* Booking Cards */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredBookings.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 32, color: Colors.text.secondary }}>
            No bookings to show.
          </Text>
        ) : (
          filteredBookings.map(renderBookingCard)
        )}
      </ScrollView>
      {renderRescheduleModal()}
    </SafeAreaView>
  );
}

export const options = {
  headerTitle: () => (
    <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
      Bookings
    </Text>
  ),
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  // Modern Gradient Header
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
  headerTitleModern: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'left',
    letterSpacing: 0.2,
    marginBottom: 15,
  },
  // Modern Tab Container
  tabContainerModern: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -24,
    marginBottom: 18,
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
  tabPillText: {
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
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
  scrollContent: {
    paddingBottom: 80, // Additional padding for bottom nav
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  // Modernized card styles (aligned with HistoryScreen)
  bookingCardModern: {
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  accentBar: {
    height: 4,
    width: '100%',
  },
  cardContentModern: {
    padding: 16,
  },
  cardHeaderModern: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeftModern: {
    flex: 1,
    paddingRight: 10,
  },
  vehicleTitleModern: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 6,
  },
  metaRowModern: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaItemModern: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  metaTextModern: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginLeft: 4,
  },
  headerRightModern: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusChipModern: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusChipTextModern: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  detailsContainerModern: {
    marginTop: 12,
  },
  detailRowModern: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailTextWrapModern: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabelModern: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  detailValueModern: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  actionsRowModern: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  showMoreRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  showMoreText: {
    color: Colors.primary.default,
    fontWeight: 'bold',
    marginRight: 6,
    fontSize: 13,
  },
  reschedulePillSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 8,
  },
  reschedulePillSmallText: {
    color: Colors.primary.default,
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 12,
  },
  rescheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  rescheduleButtonText: {
    color: Colors.primary.default,
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: Colors.primary.default,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 15,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  modalValue: {
    color: Colors.primary.default,
    fontWeight: 'bold',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 12,
  },
  pickerButtonText: {
    marginLeft: 8,
    color: Colors.text.primary,
    fontSize: 15,
  },
  timeSlotLabel: {
    marginTop: 18,
    marginBottom: 6,
    color: Colors.text.primary,
    fontWeight: 'bold',
    fontSize: 15,
  },
  timeSlotList: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeSlotButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
  },
  timeSlotButtonSelected: {
    backgroundColor: Colors.primary.default,
  },
  timeSlotText: {
    color: Colors.text.primary,
    fontWeight: 'bold',
    fontSize: 15,
  },
  timeSlotTextSelected: {
    color: '#fff',
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 24,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: Colors.primary.default,
  },
  completedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#E6F9ED',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  completedText: {
    color: Colors.primary.default,
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 13,
  },
}); 