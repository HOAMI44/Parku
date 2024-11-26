import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import MapView, { PROVIDER_DEFAULT, Marker, Region } from "react-native-maps";
import * as Location from "expo-location";
import { supabase } from "../../lib/supabase";
import CardMap from "@/components/CardMap";
import Icon from "react-native-vector-icons/FontAwesome";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet from "react-native-gesture-bottom-sheet";
import GestureRecognizer from "react-native-swipe-gestures";
import { Marker as RNMarker } from 'react-native-maps';
import { useRouter } from "expo-router";
import SwipeableCard from '@/components/SwipeableCard';
import { calculateDistance } from "../../utils/calculateDistance";

interface ParkingSpace {
  id: number;
  address: string;
  latitude: number;
  longitude: number;
  price_per_hour: number;
  availability_start: string;
  availability_end: string;
  is_available: boolean;
  description: string;
  width: number;
  length: number;
  image_url: string;
  users: {
    first_name: string;
    last_name: string;
  };
}

interface MarkerRefs {
  [key: number]: typeof RNMarker | null;
}

const INITIAL_REGION = {
  latitude: 47.41375,
  longitude: 9.74151,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const ExploreScreen = () => {
  const router = useRouter();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const mapRef = useRef<MapView>(null);
  const bottomSheet = useRef<BottomSheet>(null);
  const markerRefs = useMemo<MarkerRefs>(() => ({}), []);
  const [searchText, setSearchText] = useState("");
  const [parkingData, setParkingData] = useState<ParkingSpace[]>([]);
  const [filteredParkingData, setFilteredParkingData] = useState<ParkingSpace[]>([]);
  const [highlightedCardId, setHighlightedCardId] = useState<number | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  useEffect(() => {
    const requestLocationPermission = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      console.log("Location:", currentLocation);
    };
    requestLocationPermission();
  }, []);

  useEffect(() => {
    const fetchParkingSpots = async () => {
      try {
        const { data, error } = await supabase
          .from("parking_spaces")
          .select(`
            *,
            users:user_id (
              first_name,
              last_name
            )
          `);

        if (error) {
          console.error("Error fetching parking spots:", error);
        } else {
          console.log("Fetched parking spots data:", data);
          setParkingData(data);
          setFilteredParkingData(data);
        }
      } catch (err) {
        console.error("Error:", err);
      }
    };

    fetchParkingSpots();
  }, []);

  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (searchText.trim() === '') {
        setFilteredParkingData(parkingData);
        return;
      }

      try {
        // Search for location using geocoding
        const geocodedLocations = await Location.geocodeAsync(searchText);
        
        if (geocodedLocations && geocodedLocations.length > 0) {
          const searchLocation = geocodedLocations[0];
          
          // Filter parking spots within 5km radius of the searched location
          const filtered = parkingData.filter(spot => {
            const distance = calculateDistance(
              searchLocation.latitude,
              searchLocation.longitude,
              spot.latitude,
              spot.longitude
            );
            return distance <= 5; // 5km radius
          });

          setFilteredParkingData(filtered);

          // Animate map to the searched location
          mapRef.current?.animateToRegion({
            latitude: searchLocation.latitude,
            longitude: searchLocation.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        } else {
          // Fallback to address search if no location found
          const filtered = parkingData.filter(spot => 
            spot.address.toLowerCase().includes(searchText.toLowerCase())
          );
          setFilteredParkingData(filtered);

          if (filtered.length > 0) {
            const firstResult = filtered[0];
            mapRef.current?.animateToRegion({
              latitude: firstResult.latitude,
              longitude: firstResult.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
          }
        }
      } catch (error) {
        console.error('Geocoding error:', error);
        // Fallback to simple address filtering on error
        const filtered = parkingData.filter(spot => 
          spot.address.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredParkingData(filtered);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(searchTimer);
  }, [searchText, parkingData]);

  const handleRemoveCard = (cardId: number) => {
    const updatedData = filteredParkingData.filter(
      (item) => item.id !== cardId
    );
    setFilteredParkingData(updatedData);
    if (highlightedCardId === cardId) {
      setHighlightedCardId(null);
    }
  };

  const handleCardFocus = (cardId: number, latitude: number, longitude: number): void => {
    setHighlightedCardId(cardId);
    
    // Adjust the region to center the marker with some padding
    mapRef.current?.animateToRegion({
      latitude: latitude - 0.002, // Offset latitude to account for the bottom card list
      longitude: longitude,
      latitudeDelta: 0.008,      // Slightly zoomed in view
      longitudeDelta: 0.008,
    });

    const marker = markerRefs[cardId];
    if (marker) {
      marker.showCallout();
    }
    if (bottomSheet.current) {
      bottomSheet.current.close();
    }
    
    setFilteredParkingData((prevData) => {
      const selectedCard = parkingData.find((item) => item.id === cardId);
      if (selectedCard) {
        const otherCards = prevData.filter((item) => item.id !== cardId);
        return [selectedCard, ...otherCards];
      }
      return prevData;
    });

    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  const handleMarkerPress = (cardId: number, latitude: number, longitude: number): void => {
    setHighlightedCardId(cardId);
    
    // Use the same centering logic as handleCardFocus
    mapRef.current?.animateToRegion({
      latitude: latitude - 0.002,
      longitude: longitude,
      latitudeDelta: 0.008,
      longitudeDelta: 0.008,
    });

    setFilteredParkingData((prevData) => {
      const selectedCard = parkingData.find((item) => item.id === cardId);
      if (selectedCard) {
        const otherCards = prevData.filter((item) => item.id !== cardId);
        return [selectedCard, ...otherCards];
      }
      return prevData;
    });

    if (bottomSheet.current) {
      bottomSheet.current.close();
    }

    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  const focusMap = () => {
    if (location) {
      const currentLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      mapRef.current?.animateToRegion(currentLocation);
    } else {
      console.log("Location not available");
    }
  };

  const resetSearch = () => {
    setSearchText("");
    setFilteredParkingData(parkingData);
  };

  const onSwipeUp = () => {
    if (bottomSheet.current) {
      bottomSheet.current.show();
    }
  };

  const handleNavigateToDetails = (cardId: number) => {
    router.push({
      pathname: '/ParkingDetails',
      params: { parkingSpace: JSON.stringify(parkingData.find(spot => spot.id === cardId)) }
    });
  };

  const handleSwipeLeft = (cardId: number) => {
    // Move to next card
    setActiveCardIndex(prevIndex => {
      if (prevIndex < filteredParkingData.length - 1) {
        return prevIndex + 1;
      }
      // If we're at the last card, stay there
      return prevIndex;
    });
  };

  const handleSwipeRight = (cardId: number) => {
    // Don't change the active card index when booking
    router.push({
      pathname: '/ParkingDetails',
      params: { 
        parkingSpace: JSON.stringify(parkingData.find(spot => spot.id === cardId)) 
      }
    });
  };

  const renderCard = (card: ParkingSpace) => {
    const distance = location
      ? calculateDistance(
          location.coords.latitude,
          location.coords.longitude,
          card.latitude,
          card.longitude
        ).toFixed(1)
      : undefined;

    return (
      <SwipeableCard
        key={card.id}
        parkingSpace={card}
        distance={distance}
        onSwipeLeft={() => handleSwipeLeft(card.id)}
        onSwipeRight={() => handleSwipeRight(card.id)}
        onSwipeUp={onSwipeUp}
      />
    );
  };

  return (
    <GestureRecognizer onSwipeUp={onSwipeUp} style={{ flex: 1 }}>
      <View style={{ flex: 2 / 3 }}>
        <MapView
          style={StyleSheet.absoluteFill}
          provider={PROVIDER_DEFAULT}
          initialRegion={INITIAL_REGION}
          showsUserLocation
          showsMyLocationButton
          ref={mapRef}
        >
          {parkingData.map((parking) => (
            <Marker
              key={parking.id}
              coordinate={{
                latitude: parking.latitude,
                longitude: parking.longitude,
              }}
              title={parking.address}
              description={parking.description}
              pinColor={highlightedCardId === parking.id ? "yellow" : "red"}
              tracksViewChanges={highlightedCardId === parking.id}
              onPress={() =>
                handleMarkerPress(
                  parking.id,
                  parking.latitude,
                  parking.longitude
                )
              }
              ref={(ref) => {
                if (ref) {
                  markerRefs[parking.id] = ref;
                }
              }}
            />
          ))}
        </MapView>
        <View style={styles.topControls}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search cities, addresses, or places"
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={() => {
                // This will trigger the useEffect with searchText
              }}
            />
            {searchText.length > 0 && (
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={() => {
                  setSearchText('');
                  setFilteredParkingData(parkingData);
                }}
              >
                <Icon name="times" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
          <Pressable onPress={focusMap} style={styles.focusButton}>
            <Text style={styles.buttonText}>Focus</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.cardListContainer}>
        {filteredParkingData.length > 0 ? (
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            scrollEnabled={false} // Disable manual scrolling
            showsHorizontalScrollIndicator={false}
            style={{ width: '100%' }}
            contentContainerStyle={styles.scrollContent}
          >
            {renderCard(filteredParkingData[activeCardIndex])}
          </ScrollView>
        ) : (
          <Text style={{ textAlign: "center", marginTop: 20, fontSize: 18 }}>
            No parking spots available
          </Text>
        )}
      </View>

      {/* Bottom Sheet for Viewing All Cards */}
      <BottomSheet
        hasDraggableIcon
        ref={bottomSheet}
        height={600}
        draggableIconStyle={styles.bottomSheetIcon}
      >
        <View style={styles.bottomSheetHeader}>
          <Text style={styles.bottomSheetTitle}>Available Parking Spots</Text>
          <Text style={styles.bottomSheetSubtitle}>
            {filteredParkingData.length} spots found
          </Text>
        </View>
        
        <ScrollView
          contentContainerStyle={styles.bottomSheetContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredParkingData.map((card) => {
            const distance = location
              ? calculateDistance(
                  location.coords.latitude,
                  location.coords.longitude,
                  card.latitude,
                  card.longitude
                ).toFixed(1)
              : "N/A";
            return (
              <TouchableOpacity
                key={card.id}
                style={styles.bottomSheetCard}
                onPress={() => handleCardFocus(card.id, card.latitude, card.longitude)}
                activeOpacity={0.7}
              >
                <Image
                  source={{ uri: card.image_url }}
                  style={styles.bottomSheetCardImage}
                  resizeMode="cover"
                />
                <View style={styles.bottomSheetCardContent}>
                  <View style={styles.bottomSheetCardHeader}>
                    <Text style={styles.bottomSheetCardDistance}>
                      {distance} km
                    </Text>
                    <Text style={styles.bottomSheetCardPrice}>
                      €{card.price_per_hour}/h
                    </Text>
                  </View>
                  <Text style={styles.bottomSheetCardAddress} numberOfLines={1}>
                    {card.address}
                  </Text>
                  <View style={styles.bottomSheetCardDetails}>
                    <Text style={styles.bottomSheetCardDetail}>
                      {card.width}m × {card.length}m
                    </Text>
                    <Text style={styles.bottomSheetCardDetail}>
                      {card.availability_start} - {card.availability_end}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </BottomSheet>
    </GestureRecognizer>
  );
};

export default ExploreScreen;

const styles = StyleSheet.create({
  topControls: {
    position: "absolute",
    top: 20,
    left: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
  },
  searchContainer: {
    flex: 1,
    marginRight: 10,
    position: 'relative',
  },
  searchInput: {
    height: 40,
    backgroundColor: 'white',
    paddingHorizontal: 15,
    borderRadius: 20,
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  clearButton: {
    position: 'absolute',
    right: 15,
    top: 10,
    zIndex: 2,
  },
  focusButton: {
    height: 40,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  cardListContainer: {
    flex: 1 / 3,
    width: "100%",
    backgroundColor: "#f8f8f8",
    paddingVertical: 10,
    alignItems: "center",
    zIndex: 10,
  },
  cardContainer: {
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    width: "auto",
  },
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 90,
    height: '100%',
  },
  deleteAction: {
    backgroundColor: '#FF3B30',
  },
  detailsAction: {
    backgroundColor: '#007AFF',
  },
  actionContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  scrollContent: {
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  bottomSheetIcon: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D1D6',
    borderRadius: 2,
    marginTop: 8,
  },
  bottomSheetHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  bottomSheetSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  bottomSheetContent: {
    padding: 16,
  },
  bottomSheetCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    height: 100,
  },
  bottomSheetCardImage: {
    width: 100,
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  bottomSheetCardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  bottomSheetCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  bottomSheetCardDistance: {
    fontSize: 12,
    color: '#666',
  },
  bottomSheetCardPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
  },
  bottomSheetCardAddress: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  bottomSheetCardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bottomSheetCardDetail: {
    fontSize: 12,
    color: '#666',
  },
});
