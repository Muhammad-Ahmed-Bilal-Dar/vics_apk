import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/theme';

const dummyCertificates = [
  {
    id: '1',
    certificateNumber: 'VICS-2024-0001',
    vehicle: 'Toyota Corolla',
    owner: 'Ahmed Ali',
    date: '2024-05-01',
    status: 'Active',
  },
  {
    id: '2',
    certificateNumber: 'VICS-2024-0002',
    vehicle: 'Honda Civic',
    owner: 'Fatima Khan',
    date: '2024-04-15',
    status: 'Expired',
  },
  {
    id: '3',
    certificateNumber: 'VICS-2024-0003',
    vehicle: 'Suzuki Alto',
    owner: 'Ali Raza',
    date: '2023-12-20',
    status: 'Active',
  },
  {
    id: '4',
    certificateNumber: 'VICS-2024-0004',
    vehicle: 'Hyundai Tucson',
    owner: 'Sara Khan',
    date: '2024-03-10',
    status: 'Active',
  },
  {
    id: '5',
    certificateNumber: 'VICS-2024-0005',
    vehicle: 'Kia Sportage',
    owner: 'Bilal Ahmed',
    date: '2024-02-18',
    status: 'Expired',
  },
];

type Certificate = typeof dummyCertificates[number];

const TABS = [
  { key: 'active', label: 'Active' },
  { key: 'expired', label: 'Expired' },
  { key: 'all', label: 'All' },
] as const;
type TabKey = typeof TABS[number]['key'];

export default function MyCertificatesScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('active');
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

  const handleDownload = (cert: Certificate) => {
    Alert.alert('Download', `Certificate ${cert.certificateNumber} downloaded successfully!`);
  };

  // Filter per tab
  let filtered: Certificate[] = [];
  if (activeTab === 'active') {
    filtered = dummyCertificates.filter(c => c.status === 'Active');
  } else if (activeTab === 'expired') {
    filtered = dummyCertificates.filter(c => c.status === 'Expired');
  } else {
    filtered = dummyCertificates;
  }

  const getStatusColors = (status: Certificate['status']) => {
    if (status === 'Active') {
      return {
        indicator: Colors.status.success.main || Colors.status.success.default,
        chip: Colors.status.success.lighter || '#E6F9ED',
        text: Colors.common?.black || '#000',
        icon: 'checkmark-circle' as const,
      };
    }
    return {
      indicator: Colors.status.error.main || Colors.status.error.default,
      chip: Colors.status.error.lighter || '#FDE8E8',
      text: Colors.common?.black || '#000',
      icon: 'close-circle' as const,
    };
  };

  const renderCard = (item: Certificate) => {
    const isExpanded = !!expandedMap[item.id];
    const status = getStatusColors(item.status);

    return (
      <View key={item.id} style={[styles.card, styles.bookingCardModern]}>        
        <View style={[styles.accentBar, { backgroundColor: status.indicator }]} />
        <View style={styles.cardContentModern}>
          <View style={styles.cardHeaderModern}>
            <View style={styles.headerLeftModern}>
              <Text style={styles.vehicleTitleModern}>{item.vehicle}</Text>
              <View style={styles.metaRowModern}>
                <View style={styles.metaItemModern}>
                  <Ionicons name="ribbon-outline" size={14} color={Colors.light.text.tertiary} />
                  <Text style={styles.metaTextModern}>{item.certificateNumber}</Text>
                </View>
                <View style={styles.metaItemModern}>
                  <Ionicons name="calendar" size={14} color={Colors.light.text.tertiary} />
                  <Text style={styles.metaTextModern}>{item.date}</Text>
                </View>
              </View>
            </View>
            <View style={styles.headerRightModern}>
              <View style={[styles.statusChipModern, { backgroundColor: status.chip }]}>                
                <Ionicons name={status.icon} size={14} color={status.indicator} />
                <Text style={[styles.statusChipTextModern, { color: status.text }]}>{item.status}</Text>
              </View>
              <TouchableOpacity
                style={styles.reschedulePillSmall}
                onPress={() => handleDownload(item)}
                activeOpacity={0.9}
              >
                <Ionicons name="download-outline" size={14} color={Colors.primary.default} />
                <Text style={styles.reschedulePillSmallText}>Download</Text>
              </TouchableOpacity>
            </View>
          </View>

          {isExpanded && (
            <View style={styles.detailsContainerModern}>
              <View style={styles.detailRowModern}>
                <Ionicons name="person-circle" size={18} color={Colors.primary.main} />
                <View style={styles.detailTextWrapModern}>
                  <Text style={styles.detailLabelModern}>Owner</Text>
                  <Text style={styles.detailValueModern}>{item.owner}</Text>
                </View>
              </View>
              <View style={styles.detailRowModern}>
                <Ionicons name="document-text" size={18} color={Colors.primary.main} />
                <View style={styles.detailTextWrapModern}>
                  <Text style={styles.detailLabelModern}>Certificate #</Text>
                  <Text style={styles.detailValueModern}>{item.certificateNumber}</Text>
                </View>
              </View>
              <View style={styles.detailRowModern}>
                <Ionicons name="calendar" size={18} color={Colors.primary.main} />
                <View style={styles.detailTextWrapModern}>
                  <Text style={styles.detailLabelModern}>Issued on</Text>
                  <Text style={styles.detailValueModern}>{item.date}</Text>
                </View>
              </View>
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
      </View>
    );
  };

  const tabIcons: Record<TabKey, keyof typeof Ionicons.glyphMap> = {
    active: 'checkmark-circle',
    expired: 'close-circle',
    all: 'albums',
  };

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.primary.main, Colors.primary.light]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <Text style={styles.headerTitleModern}>My Certificates</Text>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabContainerModern}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabPill, activeTab === tab.key ? styles.tabPillActive : styles.tabPillInactive]}
            onPress={() => setActiveTab(tab.key as TabKey)}
            activeOpacity={0.85}
          >
            <Ionicons
              name={tabIcons[tab.key]}
              size={16}
              color={activeTab === tab.key ? '#fff' : Colors.primary.default}
              style={styles.tabIcon}
            />
            <Text
              style={[styles.tabPillTextSmall, activeTab === tab.key ? styles.tabPillTextActive : styles.tabPillTextInactive]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Cards */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filtered.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 32, color: Colors.text.secondary }}>
            No certificates to show.
          </Text>
        ) : (
          filtered.map(renderCard)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  // Header
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
  // Tabs
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
  // Content
  scrollContent: {
    paddingBottom: 80,
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
});
