import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Avatar, Button, Card, Divider, IconButton, Searchbar, Text, Title } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import vicsData from '../../dataset/vics_dataset.json';
import { Colors, Spacing } from '../theme/theme';
// Note: You'll need to install the following packages:
// npm install expo-linear-gradient

// Define types for inspection centers
interface Coordinates {
  latitude: number;
  longitude: number;
}

interface InspectionCenter {
  id: string;
  name: string;
  address: string;
  city: string;
  coordinates: Coordinates;
  rating?: number;
  open?: string;
  close?: string;
}

// Dynamically generate city list from JSON
const cities = Object.keys(vicsData.station_information);

// Transform vicsData.station_information into InspectionCenter[]
const cityStationData = vicsData.station_information;
let idCounter = 1;
const defaultCoordinates = {
  Lahore: { latitude: 31.5497, longitude: 74.3436 },
  Islamabad: { latitude: 33.6844, longitude: 73.0479 },
  Rawalpindi: { latitude: 33.5651, longitude: 73.0169 },
  Karachi: { latitude: 24.8607, longitude: 67.0011 },
  Peshawar: { latitude: 34.0151, longitude: 71.5249 },
  Quetta: { latitude: 30.1798, longitude: 66.9750 },
  Multan: { latitude: 30.1575, longitude: 71.5249 },
  Faisalabad: { latitude: 31.4181, longitude: 73.0776 },
  Gujranwala: { latitude: 32.1877, longitude: 74.1945 },
  Sialkot: { latitude: 32.4945, longitude: 74.5229 },
  Okara: { latitude: 30.8119, longitude: 73.4415 },
};

const inspectionCenters: InspectionCenter[] = Object.entries(cityStationData).flatMap(([city, stations]) =>
  (stations as any[]).map((station, idx) => ({
    id: `${city}-${idx + 1}`,
    name: station.station_name,
    address: station.area + ', ' + city,
    city,
    coordinates: defaultCoordinates[city as keyof typeof defaultCoordinates] || { latitude: 31.5497, longitude: 74.3436 },
    rating: 4.5 + (idx % 5) * 0.1, // Dummy rating for demo
    open: '09:00 AM', // Could be extended if in JSON
    close: '05:00 PM', // Could be extended if in JSON
  }))
);

export default function LocationScreen() {
  const [selectedCenter, setSelectedCenter] = useState<InspectionCenter | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [filteredCenters, setFilteredCenters] = useState<InspectionCenter[]>(inspectionCenters);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const handleSelectCenter = (center: InspectionCenter) => {
    setSelectedCenter(center);
    setShowDetails(true);
  };

  const handleGetDirections = async (center: InspectionCenter) => {
    setSelectedCenter(center);
    setShowDetails(false);
    setLocationError(null);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Permission to access location was denied');
        setShowMap(true);
        return;
      }
      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setShowMap(true);
    } catch (e) {
      setLocationError('Could not get your location.');
      setShowMap(true);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSelectCity = (city: string) => {
    setSelectedCity(city === selectedCity ? null : city);
    setShowCityDropdown(false);
  };

  const toggleCityDropdown = () => {
    setShowCityDropdown(!showCityDropdown);
  };

  // Filter centers based on search query and selected city
  useEffect(() => {
    let filtered = [...inspectionCenters];
    
    // Filter by city if selected
    if (selectedCity && selectedCity !== 'All') {
      filtered = filtered.filter(center => center.city === selectedCity);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        center => 
          center.name.toLowerCase().includes(query) || 
          center.address.toLowerCase().includes(query) ||
          center.city.toLowerCase().includes(query)
      );
    }
    
    setFilteredCenters(filtered);
  }, [searchQuery, selectedCity]);

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      
      
      <View style={styles.searchAndFilterContainer}>
        <View style={styles.searchRow}>
          <View style={{ flex: 1, position: 'relative' }}>
            <Searchbar
              placeholder="Search centers..."
              onChangeText={handleSearch}
              value={searchQuery}
              style={styles.searchbar}
              // iconColor={Colors.primary.default}
              inputStyle={styles.searchbarInput}
              clearIcon=""
              // clearIcon={false} 
                          />
            <TouchableOpacity
              onPress={toggleCityDropdown}
              style={styles.cityFilterInline}
              activeOpacity={0.7}
            >
              <Text style={styles.cityFilterInlineText} numberOfLines={1}>
                {selectedCity === 'All' || !selectedCity ? 'All' : selectedCity}
              </Text>
              <Ionicons
                name={showCityDropdown ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={Colors.primary.default}
                style={styles.cityFilterInlineIcon}
              />
            </TouchableOpacity>
            {showCityDropdown && (
              <View style={styles.cityDropdownInline}>
                <ScrollView style={styles.scrollView}>
                  <TouchableOpacity
                    key="all"
                    onPress={() => handleSelectCity('All')}
                    style={styles.cityDropdownItem}
                  >
                    <Text style={selectedCity === 'All' || !selectedCity ? styles.selectedCityDropdownText : styles.cityDropdownText}>All</Text>
                  </TouchableOpacity>
                  {cities.map(city => (
                    <TouchableOpacity
                      key={city}
                      onPress={() => handleSelectCity(city)}
                      style={styles.cityDropdownItem}
                    >
                      <Text style={selectedCity === city ? styles.selectedCityDropdownText : styles.cityDropdownText}>{city}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        </View>
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {filteredCenters.length === 0 ? (
          <View style={styles.noResultsContainer}>
            <Ionicons name="location-outline" size={64} color={Colors.text.tertiary} />
            <Text style={styles.noResultsText}>No inspection centers found</Text>
            <Text style={styles.noResultsSubText}>Try adjusting your search or filters</Text>
          </View>
        ) : (
          <View style={styles.centersListContainer}>
            {filteredCenters.map((center) => (
              <Card 
                key={center.id} 
                style={styles.centerListItem}
                onPress={() => handleSelectCenter(center)}
                mode="elevated"
              >
                <View style={styles.cardIndicator} />
                <Card.Content style={styles.centerCardContent}>
                  <View style={styles.centerHeaderRow}>
                    <View style={styles.centerHeaderLeft}>
                      <Avatar.Icon 
                        size={40} 
                        icon="car" 
                        style={styles.centerAvatar} 
                        color="#fff" 
                      />
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Title style={styles.centerTitle} numberOfLines={1} ellipsizeMode="tail">{center.name}</Title>
                        <View style={styles.ratingAndOpenRow}>
                          <View style={styles.ratingContainer}>
                            <Ionicons name="star" size={16} color="#FFC107" />
                            <Text style={styles.ratingText}>{Number(center.rating).toFixed(1)}</Text>
                          </View>
                          <Text style={styles.openText}>Open</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.centerCardRow}>
                    <Ionicons name="location" size={18} color={Colors.text.tertiary} style={styles.rowIcon} />
                    <Text style={styles.centerAddress} numberOfLines={2} ellipsizeMode="tail">{center.address}</Text>
                  </View>
                  
                  {/* <View style={styles.centerCardRow}>
                    <Ionicons name="business" size={18} color={Colors.text.tertiary} style={styles.rowIcon} />
                    <Text style={styles.centerCity} numberOfLines={1} ellipsizeMode="tail">{center.city}</Text>
                  </View> */}
                  
                  <View style={styles.centerCardRow}>
                    <Ionicons name="time" size={18} color={Colors.text.tertiary} style={styles.rowIcon} />
                    <Text style={styles.centerHours}>
                      {center.open} - {center.close}
                    </Text>
                  </View>
                  
                  <View style={styles.centerActions}>
                    <Button 
                      mode="contained" 
                      style={styles.directionsButton}
                      labelStyle={[styles.buttonLabel, { color: '#fff', fontWeight: 'bold' }]}
                      icon="directions"
                      onPress={() => handleGetDirections(center)}
                      buttonColor={Colors.button.default}
                    >
                      Directions
                    </Button>
                    <Button 
                      mode="outlined"
                      style={styles.moreInfoButton}
                      labelStyle={styles.moreInfoButtonLabel}
                      onPress={() => handleSelectCenter(center)}
                      textColor={Colors.button.default}
                    >
                      More Info
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
      
      {/* Details Modal (More Info) */}
      {selectedCenter && showDetails && !showMap && (
        <View style={styles.detailsModalOverlay}>
          <View style={styles.detailsModalImproved}>
              <View style={styles.detailsCardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailsAddress}>{selectedCenter.address}</Text>
                </View>
                <IconButton 
                  icon="close" 
                  size={24} 
                  onPress={() => { setShowDetails(false); setSelectedCenter(null); }}
                  style={styles.closeButton}
                />
              </View>
              <Divider style={styles.divider} />
              <View style={styles.detailsContent}>
                <View style={styles.detailsRowCompact}>
                  <Ionicons name="business-outline" size={18} color={Colors.text.tertiary} style={styles.detailsIcon} />
                  <Text style={styles.detailsTextCompact}>
                    City: {selectedCenter.city}
                  </Text>
                </View>
                <View style={styles.detailsRowCompact}>
                  <Ionicons name="time-outline" size={18} color={Colors.text.tertiary} style={styles.detailsIcon} />
                  <Text style={styles.detailsTextCompact}>
                    Open Hours: {selectedCenter.open} - {selectedCenter.close}
                  </Text>
                </View>
                <View style={styles.detailsRowCompact}>
                  <Ionicons name="navigate-outline" size={18} color={Colors.text.tertiary} style={styles.detailsIcon} />
                  <Text style={styles.detailsTextCompact}>
                    Coordinates: {selectedCenter.coordinates.latitude.toFixed(4)}, {selectedCenter.coordinates.longitude.toFixed(4)}
                  </Text>
                </View>
                <View style={styles.detailsRowCompact}>
                  <Ionicons name="car-outline" size={18} color={Colors.text.tertiary} style={styles.detailsIcon} />
                  <Text style={styles.detailsTextCompact}>
                    Services: Vehicle inspection, certification, emissions testing
                  </Text>
                </View>
              </View>
              <Button 
                mode="contained" 
                style={styles.bookButtonCompact}
                icon="calendar"
                onPress={() => alert('Book appointment at ' + selectedCenter.name)}
                buttonColor={Colors.button.default}
              >
                Book Appointment
              </Button>
            </View>
        </View>
      )}

      {/* Map Modal */}
      {showMap && selectedCenter && (
        <View style={styles.mapModalOverlay}>
          <View style={styles.mapModal}>
            <View style={styles.mapHeader}>
              <Text style={styles.mapTitle}>Directions to {selectedCenter.name}</Text>
              <IconButton icon="close" onPress={() => setShowMap(false)} />
            </View>
            {locationError ? (
              <Text style={styles.mapError}>{locationError}</Text>
            ) : (
              <MapView
                style={styles.mapView}
                initialRegion={{
                  latitude: userLocation?.latitude || selectedCenter.coordinates.latitude,
                  longitude: userLocation?.longitude || selectedCenter.coordinates.longitude,
                  latitudeDelta: 0.08,
                  longitudeDelta: 0.08,
                }}
                showsUserLocation={true}
                showsMyLocationButton={true}
              >
                {userLocation && (
                  <Marker
                    coordinate={userLocation}
                    title="Your Location"
                    pinColor="blue"
                  />
                )}
                <Marker
                  coordinate={selectedCenter.coordinates}
                  title={selectedCenter.name}
                  description={selectedCenter.address}
                  pinColor="green"
                />
                {userLocation && (
                  <Polyline
                    coordinates={[userLocation, selectedCenter.coordinates]}
                    strokeColor="#2e7d32"
                    strokeWidth={4}
                  />
                )}
              </MapView>
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingVertical: Spacing.l,
    paddingHorizontal: Spacing.m,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: Spacing.xs,
  } as TextStyle,
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  } as TextStyle,
  searchAndFilterContainer: {
    padding: Spacing.s,
    paddingBottom: 0,
    paddingTop: 0,
   
    borderWidth: 0,
    borderColor: 'transparent',
    borderRadius: 0,
    backgroundColor: Colors.background,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  searchbar: {
    elevation: 2,
    backgroundColor: Colors.card.dark,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.divider,
    marginBottom: Spacing.xs,
  },
  searchbarInput: {
    color: Colors.text.primary,
  } as TextStyle,
  cityFilterInline: {
    position: 'absolute',
    right: 4,
    top: 0,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  cityFilterInlineText: {
    fontSize: 15,
    color: Colors.primary.default,
    fontWeight: '500',
    maxWidth: 80,
  },
  cityFilterInlineIcon: {
    marginLeft: 2,
  },
  cityDropdownInline: {
    position: 'absolute',
    right: 0,
    top: '100%',
    backgroundColor: Colors.card.light,
    borderRadius: 8,
    elevation: 4,
    marginTop: 2,
    minWidth: 120,
    zIndex: 10,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: Colors.divider,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  cityDropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  cityDropdownText: {
    fontSize: 15,
    color: Colors.text.primary,
  },
  selectedCityDropdownText: {
    fontSize: 15,
    color: Colors.button.default,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  noResultsContainer: {
    padding: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginTop: Spacing.m,
  } as TextStyle,
  noResultsSubText: {
    fontSize: 14,
    color: Colors.text.tertiary,
    marginTop: Spacing.s,
  } as TextStyle,
  centersListContainer: {
    padding: Spacing.s,
  },
  centerListItem: {
  marginBottom: Spacing.xs,
  borderRadius: 16,
  elevation: 4,
  overflow: 'hidden',
  borderWidth: 0,
  backgroundColor: '#fff',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.08,
  shadowRadius: 6,
  } as ViewStyle,
  cardIndicator: {
    height: 4,
    backgroundColor: Colors.primary.default,
    width: '100%',
  },
  accentBar: {
    height: 4,
    width: '100%',
  },
  centerCardContent: {
  paddingVertical: Spacing.s,
  paddingHorizontal: Spacing.m,
  },
  centerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  centerHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  centerAvatar: {
    backgroundColor: Colors.button.default,
    marginRight: Spacing.xs,
  },
  centerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
  } as TextStyle,
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,
  },
  ratingText: {
    fontSize: 14,
    color: Colors.text.tertiary,
    marginLeft: 4,
    fontWeight: '500',
  } as TextStyle,
  // removed openChip styling - chip removed from markup
  centerCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  rowIcon: {
    marginRight: Spacing.xs,
  },
  centerAddress: {
    fontSize: 14,
    color: Colors.text.secondary,
    flex: 1,
  } as TextStyle,
  centerCity: {
    fontSize: 14,
    color: Colors.text.secondary,
  } as TextStyle,
  centerHours: {
    fontSize: 14,
    color: Colors.text.secondary,
  } as TextStyle,
  centerActions: {
    flexDirection: 'row',
    marginTop: Spacing.s,
  },
  directionsButton: {
    flex: 1,
    marginRight: Spacing.xs,
  },
  buttonLabel: {
    fontSize: 13,
  } as TextStyle,
  moreInfoButton: {
    flex: 1,
    borderColor: Colors.button.default,
  },
  moreInfoButtonLabel: {
    fontSize: 13,
  } as TextStyle,
  detailsModalImproved: {
    width: '92%',
    maxWidth: 400,
    backgroundColor: Colors.card.default,
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 10,
    paddingBottom: 24,
    paddingHorizontal: 24,
    paddingTop: 18,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  detailsCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.s,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  } as TextStyle,
  detailsAddress: {
    fontSize: 14,
    color: Colors.text.tertiary,
    marginTop: 4,
  } as TextStyle,
  closeButton: {
    margin: 0,
    backgroundColor: Colors.card.dark,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: Spacing.s,
  },
  detailsContent: {
    marginBottom: Spacing.l,
  },
  detailsRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.s,
  },
  detailsTextCompact: {
    fontSize: 14,
    color: Colors.text.secondary,
    flex: 1,
  } as TextStyle,
  bookButtonCompact: {
    paddingVertical: Spacing.s,
    marginHorizontal: 12,
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.m,
  },
  detailsIcon: {
    marginRight: Spacing.m,
  },
  detailsText: {
    fontSize: 15,
    color: Colors.text.secondary,
    flex: 1,
  } as TextStyle,
  bookButton: {
    paddingVertical: Spacing.s,
  },
  infoContainer: {
    paddingHorizontal: Spacing.m,
    paddingBottom: Spacing.m,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    color: Colors.text.tertiary,
  } as TextStyle,
  mapModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapModal: {
    width: '95%',
    height: '70%',
    backgroundColor: Colors.card.default,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: Colors.card.light,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    zIndex: 2,
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
    flex: 1,
  },
  mapView: {
    flex: 1,
    width: '100%',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  mapError: {
    color: Colors.status.error.main,
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
  },
  detailsModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingAndOpenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  openText: {
    color: Colors.status.success.main,
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 13,
  } as TextStyle,
}); 