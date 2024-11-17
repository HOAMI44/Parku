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
import { Swipeable } from "react-native-gesture-handler";
import BottomSheet from "react-native-gesture-bottom-sheet";
import GestureRecognizer from "react-native-swipe-gestures";
import { Marker as RNMarker } from 'react-native-maps';
import { useRouter } from "expo-router";
import { GestureHandlerRootView, RectButton } from 'react-native-gesture-handler';
import Animated from 'react-native';

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
}

interface MarkerRefs {
  [key: number]: RNMarker | null;
}

const INITIAL_REGION = {
  latitude: 47.41375,
  longitude: 9.74151,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius der Erde in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const deg2rad = (deg: number) => {
  return deg * (Math.PI / 180);
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
          .select(
            "id, address, latitude, longitude, price_per_hour, availability_start, availability_end, is_available, description, width, length, image_url"
          );

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
    if (searchText.trim() === '') {
      setFilteredParkingData(parkingData);
    } else {
      const filtered = parkingData.filter(spot => 
        spot.address.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredParkingData(filtered);
    }
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
    mapRef.current?.animateToRegion({
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
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

    // Scroll to the top of the view to focus on the selected card
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  const handleMarkerPress = (cardId: number, latitude: number, longitude: number): void => {
    setHighlightedCardId(cardId);
    mapRef.current?.animateToRegion({
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
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

    // Scroll to the top of the view to focus on the selected card
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

  const renderCard = (card: ParkingSpace, distance: string) => {
    const renderRightActions = (_, dragX: any) => (
      <TouchableOpacity 
        style={styles.deleteAction}
        onPress={() => handleRemoveCard(card.id)}
      >
        <View style={styles.actionContent}>
          <Icon name="trash" size={24} color="white" />
          <Text style={styles.actionText}>Remove</Text>
        </View>
      </TouchableOpacity>
    );

    const renderLeftActions = (_, dragX: any) => (
      <TouchableOpacity 
        style={styles.detailsAction}
        onPress={() => handleNavigateToDetails(card.id)}
      >
        <View style={styles.actionContent}>
          <Icon name="info-circle" size={24} color="white" />
          <Text style={styles.actionText}>Details</Text>
        </View>
      </TouchableOpacity>
    );

    return (
      <GestureHandlerRootView key={card.id} style={styles.cardContainer}>
        <Swipeable
          renderRightActions={renderRightActions}
          renderLeftActions={renderLeftActions}
          overshootRight={false}
          overshootLeft={false}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => handleCardFocus(card.id, card.latitude, card.longitude)}
          >
            <View style={styles.card}>
              <Image
                source={{ uri: card.image_url }}
                style={styles.cardImage}
                resizeMode="cover"
              />
              <View style={styles.cardContent}>
                <Text style={styles.distance}>({distance} km)</Text>
                <Text style={styles.address} numberOfLines={1}>{card.address}</Text>
                <Text style={styles.price}>€{card.price_per_hour}/hour</Text>
                <View style={styles.detailsRow}>
                  <Text style={styles.details}>
                    {card.width}m × {card.length}m
                  </Text>
                  <Text style={styles.details}>
                    {card.availability_start} - {card.availability_end}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Swipeable>
      </GestureHandlerRootView>
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
              style={styles.searchBar}
              placeholder="Search location"
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText !== "" && (
              <TouchableOpacity 
                style={styles.clearButton} 
                onPress={resetSearch}
              >
                <Icon name="times" size={20} color="#999" />
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
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredParkingData.map((card) => {
              const distance = location
                ? calculateDistance(
                    location.coords.latitude,
                    location.coords.longitude,
                    card.latitude,
                    card.longitude
                  ).toFixed(2)
                : "N/A";
              return renderCard(card, distance);
            })}
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
                ).toFixed(2)
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
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  searchBar: {
    flex: 1,
    height: 40,
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    marginRight: 10,
  },
  clearButton: {
    position: 'absolute',
    right: 10,
    padding: 5,
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
    backgroundColor: "#f8f8f8",
    paddingVertical: 10,
    alignItems: "center",
    zIndex: 10,
  },
  cardContainer: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f0f0f0',
  },
  cardContent: {
    padding: 12,
  },
  distance: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  address: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2196F3',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  details: {
    fontSize: 13,
    color: '#666',
  },
  deleteAction: {
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    height: '100%',
  },
  detailsAction: {
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    height: '100%',
  },
  actionContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: 'white',
    fontSize: 11,
    marginTop: 4,
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
