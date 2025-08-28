import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, FlatList, NativeScrollEvent, NativeSyntheticEvent, Platform, Share, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Card, Divider, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../theme/theme';

// Define the history item type
interface HistoryItem {
  id: string;
  date: string;
  carStation: string;
  status: 'Passed' | 'Failed' | 'Pending' | 'Retry' | 'Cancelled';
  price: string;
  inspector: string;
  vehicle: string;
  reportUrl?: string; // URL to the report document
}

// Pakistani inspector names
const inspectorNames = [
  'Ahmed Khan', 
  'Fatima Ali', 
  'Muhammad Usman', 
  'Ayesha Malik', 
  'Zainab Rehman', 
  'Hassan Ahmed', 
  'Asad Farooq', 
  'Bilal Raza', 
  'Saima Iqbal', 
  'Tariq Mehmood',
  'Hamza Butt',
  'Nadia Chaudhry',
  'Imran Sheikh',
  'Saad Riaz',
  'Hina Zaidi'
];

// Stations
const stations = [
  'Lahore Main Station', 
  'Islamabad Center', 
  'Rawalpindi Branch', 
  'Karachi Highway Center', 
  'Peshawar Complex', 
  'Quetta Station', 
  'Multan Center',
  'Faisalabad Station',
  'Gujranwala Complex',
  'Sialkot Center'
];

// Vehicles
const vehicles = [
  'Toyota Corolla', 
  'Honda Civic', 
  'Suzuki Mehran', 
  'Toyota Hilux', 
  'Honda City',
  'Suzuki Alto',
  'Toyota Fortuner',
  'Kia Sportage',
  'Hyundai Tucson',
  'Toyota Yaris'
];

// Generate random date between start and end
function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Generate dummy data
const generateDummyData = (): HistoryItem[] => {
  const data: HistoryItem[] = [];
  const statuses: Array<HistoryItem['status']> = ['Passed', 'Failed', 'Pending', 'Retry', 'Cancelled'];
  
  const startDate = new Date(2023, 0, 1); // Jan 1, 2023
  const endDate = new Date(); // current date
  
  for (let i = 1; i <= 30; i++) {
    const randomDateVal = randomDate(startDate, endDate);
    const date = randomDateVal.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const price = status === 'Cancelled' ? 'PKR 0' : `PKR ${Math.floor(Math.random() * 3000) + 2000}`;
    const inspector = status === 'Cancelled' ? 'N/A' : inspectorNames[Math.floor(Math.random() * inspectorNames.length)];
    
    // Reports are available for completed inspections
    const hasReport = status !== 'Pending' && status !== 'Cancelled';
    
    data.push({
      id: i.toString(),
      date,
      carStation: stations[Math.floor(Math.random() * stations.length)],
      status,
      price,
      inspector,
      vehicle: vehicles[Math.floor(Math.random() * vehicles.length)],
      reportUrl: hasReport ? `https://example.com/reports/${i}` : undefined
    });
  }
  
  // Sort by date, newest first
  return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Generate our dummy data
const historyData = generateDummyData();

// Filter types
type FilterStatus = 'all' | 'passed' | 'failed' | 'pending' | 'retry' | 'cancelled';

export default function HistoryScreen() {
  const [filteredData, setFilteredData] = useState<HistoryItem[]>(historyData);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const horizontalScrollRef = useRef<any>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [contentWidth, setContentWidth] = useState<number>(1);
  const [containerWidth, setContainerWidth] = useState<number>(1);
  const [scrollOffset, setScrollOffset] = useState<number>(0);

  // Apply filters whenever filter state changes
  useEffect(() => {
    let filtered = [...historyData];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      const targetStatus = statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1) as HistoryItem['status'];
      filtered = filtered.filter(item => item.status === targetStatus);
    }
    
    setFilteredData(filtered);
  }, [statusFilter]);

  const getStatusColors = (status: string) => {
    switch (status) {
      case 'Passed':
        return {
          indicator: Colors.status.success.main,
          chip: Colors.status.success.lighter,
          text: Colors.common.black
        };
      case 'Failed':
        return {
          indicator: Colors.status.error.main,
          chip: Colors.status.error.lighter,
          text: Colors.common.black
        };
      case 'Pending':
        return {
          indicator: Colors.status.pending.main,
          chip: Colors.status.pending.lighter,
          text: Colors.common.black
        };
      case 'Retry':
        return {
          indicator: Colors.status.warning.main,
          chip: Colors.status.warning.lighter,
          text: Colors.common.black
        };
      case 'Cancelled':
        return {
          indicator: Colors.status.error.dark,
          chip: Colors.status.error.lighter,
          text: Colors.common.black
        };
      default:
        return {
          indicator: Colors.status.info.main,
          chip: Colors.status.info.lighter,
          text: Colors.common.black
        };
    }
  };

  const handleShowReport = (item: HistoryItem) => {
    if (item.status === 'Pending') {
      Alert.alert('Report Not Available', 'The inspection is still pending. No report is available yet.');
      return;
    }
    
    if (item.status === 'Cancelled') {
      Alert.alert('Report Not Available', 'This inspection was cancelled. No report is available.');
      return;
    }
    
    // In a real app, this would navigate to a report viewer or open a PDF
    Alert.alert('View Report', `Showing report for ${item.vehicle} inspection on ${item.date}.\n\nStatus: ${item.status}`);
  };

  const handleDownloadReport = async (item: HistoryItem) => {
    if (item.status === 'Pending') {
      Alert.alert('Download Not Available', 'The inspection is still pending. No report is available for download yet.');
      return;
    }
    
    if (item.status === 'Cancelled') {
      Alert.alert('Download Not Available', 'This inspection was cancelled. No report is available for download.');
      return;
    }
    
    try {
      // In a real app, this would download the PDF report
      // For now, we'll just show a success message and simulate sharing
      await Share.share({
        title: `${item.vehicle} Inspection Report`,
        message: `VICS Inspection Report for ${item.vehicle} on ${item.date}. Status: ${item.status}.`,
        url: item.reportUrl
      });
      
      Alert.alert('Download Started', 'Your report download has started.');
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Download Failed', 'There was an error downloading the report. Please try again later.');
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getFilterChipColor = (key: string, selected: boolean) => {
    if (selected) {
      switch (key) {
        case 'passed':
          return Colors.status.success.main;
        case 'failed':
          return Colors.status.error.main;
        case 'pending':
          return Colors.status.pending.main;
        case 'retry':
          return Colors.status.warning.main;
        case 'cancelled':
          return Colors.status.error.dark;
        default:
          return Colors.primary.main;
      }
    }
    return '#f5f5f5';
  };

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => {
    const statusColors = getStatusColors(item.status);
    const isExpanded = expandedId === item.id;
    
    const getStatusIconSmall = () => {
      switch(item.status) {
        case 'Passed':
          return <MaterialCommunityIcons name="check-circle" size={16} color={statusColors.indicator} />;
        case 'Failed':
          return <MaterialCommunityIcons name="close-circle" size={16} color={statusColors.indicator} />;
        case 'Pending':
          return <MaterialCommunityIcons name="clock-outline" size={16} color={statusColors.indicator} />;
        case 'Retry':
          return <MaterialCommunityIcons name="refresh" size={16} color={statusColors.indicator} />;
        case 'Cancelled':
          return <MaterialCommunityIcons name="cancel" size={16} color={statusColors.indicator} />;
        default:
          return <MaterialCommunityIcons name="help-circle" size={16} color={statusColors.indicator} />;
      }
    };
    
    return (
      <Card style={styles.historyCard} mode="elevated">
        <LinearGradient
          colors={['rgba(0, 150, 136, 0.15)', 'rgba(0, 150, 136, 0.05)']}
          style={styles.cardGradient}
        >
          <View style={[styles.accentBar, { backgroundColor: statusColors.indicator }]} />

          <Card.Content style={styles.cardContent}>
            <View
              style={styles.cardHeader}
            >
              <View style={styles.headerLeft}>
                <Text style={styles.vehicleTitle}>{item.vehicle}</Text>
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar" size={14} color={Colors.light.text.tertiary} />
                    <Text style={styles.metaText}>{item.date}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.headerRight}>
                <View style={[styles.statusChip, { backgroundColor: statusColors.chip }] }>
                  {getStatusIconSmall()}
                  <Text style={[styles.statusChipText, { color: statusColors.text }]}>{item.status}</Text>
                </View>
              </View>
            </View>

            {isExpanded && (
              <>
                <Divider style={styles.divider} />

                <View style={styles.detailsContainer}>
                  <View style={styles.detailRow}>
                    <View style={styles.detailIconContainer}>
                      <MaterialCommunityIcons name="map-marker" size={20} color={Colors.primary.main} />
                    </View>
                    <View style={styles.detailTextContainer}>
                      <Text style={styles.detailLabel}>Station</Text>
                      <Text style={styles.detailValue}>{item.carStation}</Text>
                    </View>
                  </View>
                  <View style={styles.detailRow}>
                    <View style={styles.detailIconContainer}>
                      <MaterialCommunityIcons name="account" size={20} color={Colors.primary.main} />
                    </View>
                    <View style={styles.detailTextContainer}>
                      <Text style={styles.detailLabel}>Inspector</Text>
                      <Text style={styles.detailValue}>{item.inspector}</Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <View style={styles.detailIconContainer}>
                      <MaterialCommunityIcons name="cash" size={20} color={Colors.primary.main} />
                    </View>
                    <View style={styles.detailTextContainer}>
                      <Text style={styles.detailLabel}>Fee</Text>
                      <Text style={styles.detailValue}>{item.price}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.actionButtonsContainer}>
                  <Button
                    mode="contained"
                    icon="file-document-outline"
                    style={[styles.actionButton, styles.viewReportButton]}
                    onPress={() => handleShowReport(item)}
                    disabled={item.status === 'Pending' || item.status === 'Cancelled'}
                  >
                    View Report
                  </Button>
                  <Button
                    mode="outlined"
                    icon="download"
                    style={[styles.actionButton, styles.downloadButton]}
                    onPress={() => handleDownloadReport(item)}
                    disabled={item.status === 'Pending' || item.status === 'Cancelled'}
                  >
                    Download
                  </Button>
                </View>
              </>
            )}

            <View style={styles.showMoreRow}
            >
              <TouchableOpacity
                onPress={() => toggleExpand(item.id)}
                activeOpacity={0.8}
                style={styles.showMoreButton}
              >
                <Text style={styles.showMoreText}>{isExpanded ? 'Show less' : 'Show more'}</Text>
                <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.primary.main} />
              </TouchableOpacity>
            </View>
          </Card.Content>
        </LinearGradient>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <LinearGradient
        colors={[Colors.primary.main, Colors.primary.light]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.headerGradient}
      >
        <Text style={styles.headerTitle}>Inspection History</Text>
      </LinearGradient>
      {
        // Filter chips with scroll hint bar and edge arrows
      }
      <View
        style={styles.filterBar}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        <Animated.ScrollView
          ref={horizontalScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterBarContent}
          scrollEventThrottle={16}
          onContentSizeChange={(w) => setContentWidth(w)}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            {
              useNativeDriver: false,
              listener: (evt: NativeSyntheticEvent<NativeScrollEvent>) =>
                setScrollOffset(evt.nativeEvent.contentOffset.x),
            }
          )}
        >
          {[
            { key: 'all', label: 'All', icon: 'filter' },
            { key: 'passed', label: 'Passed', icon: 'check-circle' },
            { key: 'failed', label: 'Failed', icon: 'close-circle' },
            { key: 'pending', label: 'Pending', icon: 'clock-outline' },
            { key: 'retry', label: 'Retry', icon: 'refresh' },
            { key: 'cancelled', label: 'Cancelled', icon: 'minus-circle' },
          ].map(f => (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.filterChip,
                { backgroundColor: getFilterChipColor(f.key, statusFilter === f.key) }
              ]}
              onPress={() => setStatusFilter(f.key as FilterStatus)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name={f.icon as any}
                size={18}
                color={statusFilter === f.key ? '#fff' : Colors.primary.main}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.filterChipText,
                  statusFilter === f.key && styles.selectedFilterChipText
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.ScrollView>

        {
          // Progress bar indicating more chips
        }
        <View style={styles.filterProgressTrack}>
          {(() => {
            const visibleRatio = Math.min(1, containerWidth / Math.max(1, contentWidth));
            const indicatorWidth = Math.max(24, containerWidth * visibleRatio);
            const maxScroll = Math.max(1, contentWidth - containerWidth);
            const maxTranslate = Math.max(0, containerWidth - indicatorWidth);
            const translateX = scrollX.interpolate({
              inputRange: [0, maxScroll],
              outputRange: [0, maxTranslate],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                style={[
                  styles.filterProgressThumb,
                  { width: indicatorWidth, transform: [{ translateX }] },
                ]}
              />
            );
          })()}
        </View>

        {
          // Edge arrows with subtle gradients
        }
        {scrollOffset > 2 && (
          <TouchableOpacity
            // onPress={() => {
            //   const nextX = Math.max(0, scrollOffset - containerWidth * 0.6);
            //   horizontalScrollRef.current?.scrollTo({ x: nextX, animated: true });
            // }}
          >
            {/* <LinearGradient
              colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0)']}
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <MaterialCommunityIcons name="chevron-left" size={22} color={Colors.primary.main} /> */}
          </TouchableOpacity>
        )}
        {contentWidth - containerWidth - scrollOffset > 2 && (
          <TouchableOpacity
            // onPress={() => {
            //   const nextX = Math.min(contentWidth - containerWidth, scrollOffset + containerWidth * 0.6);
            //   horizontalScrollRef.current?.scrollTo({ x: nextX, animated: true });
            // }}
          >
            {/* <LinearGradient
              colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <MaterialCommunityIcons name="chevron-right" size={22} color={Colors.primary.main} /> */}
          </TouchableOpacity>
        )}
      </View>

          <FlatList
            data={filteredData}
            renderItem={renderHistoryItem}
            keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
          />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
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
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'left',
  },
  filterBar: {
    backgroundColor: '#fff',
    borderRadius: 18,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: -32,
    marginBottom: 12,
    position: 'relative',
  },
  filterBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    
  },
  filterProgressTrack: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 8,
    top: 3,
    height: 3,
    backgroundColor: '#eaeaea',
    borderRadius: 2,
    overflow: 'hidden',
  },
  filterProgressThumb: {
    height: 3,
    backgroundColor: Colors.primary.main,
    borderRadius: 2,
  },
  // edgeOverlay: {
  //   position: 'absolute',
  //   top: 0,
  //   bottom: 0,
  //   width: 32,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },
  // leftOverlay: {
  //   left: 0,
  // },
  // rightOverlay: {
  //   right: 0,
  // },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginHorizontal: 6,
    minHeight: 40,
    minWidth: 90,
  },
  selectedFilterChip: {
    backgroundColor: Colors.primary.main,
  },
  filterChipText: {
    fontWeight: 'bold',
    color: Colors.text.primary,
    fontSize: 15,
    flexShrink: 1,
    textAlign: 'center',
  },
  selectedFilterChipText: {
    color: '#fff',
  },
  listContainer: {
    padding: Spacing.m,
  },
  historyCard: {
    marginBottom: Spacing.m,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: Colors.common.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  cardGradient: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  iconContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 150, 136, 0.2)',
  },
  accentBar: {
    height: 4,
    width: '100%',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.common.black,
    marginTop: 4,
  },
  cardContent: {
    padding: Spacing.m,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
    paddingRight: Spacing.s,
  },
  vehicleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.common.black,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  metaText: {
    fontSize: 12,
    color: Colors.light.text.secondary,
    marginLeft: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 8,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  historyHeader: {
    flexDirection: 'column',
    marginBottom: 4,
  },
  // Deprecated in favor of cardHeader/meta rows
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dateIcon: {
    marginRight: 4,
  },
  historyDate: {
    fontSize: 14,
    color: Colors.light.text.secondary,
  },
  vehicleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehicleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.common.black,
  },
  expandIcon: {
    marginLeft: 8,
  },
  divider: {
    marginVertical: Spacing.s,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  detailsContainer: {
    marginVertical: Spacing.s,
  },
  detailRow: {
    flexDirection: 'row',
    marginVertical: 8,
    alignItems: 'center',
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 150, 136, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.light.text.secondary,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.common.black,
    fontWeight: '500',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.m,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
  },
  viewReportButton: {
    marginRight: Spacing.xs,
    backgroundColor: Colors.primary.main,
  },
  downloadButton: {
    marginLeft: Spacing.xs,
    borderColor: Colors.primary.main,
    borderWidth: 1,
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
    alignSelf: 'center',
  },
  showMoreText: {
    color: Colors.primary.main,
    fontWeight: 'bold',
    marginRight: 6,
    fontSize: 13,
  },
}); 