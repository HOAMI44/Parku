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
import MapView, { PROVIDER_DEFAULT, Marker } from "react-native-maps";
import * as Location from "expo-location";
import { supabase } from "../../lib/supabase";
import CardMap from "@/components/CardMap";
import Icon from "react-native-vector-icons/FontAwesome";
import { Swipeable } from "react-native-gesture-handler";
import BottomSheet from "react-native-gesture-bottom-sheet";
import GestureRecognizer from 'react-native-swipe-gestures';

const INITIAL_REGION = {
  latitude: 47.41375,
  longitude: 9.74151,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
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

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

const ExploreScreen = () => {
  const [location, setLocation] = useState(null);
  const mapRef = useRef(null);
  const bottomSheet = useRef(null);
  const markerRefs = useMemo(() => ({}), []);
  const [searchText, setSearchText] = useState("");
  const [parkingData, setParkingData] = useState([]);
  const [filteredParkingData, setFilteredParkingData] = useState([]);
  const [highlightedCardId, setHighlightedCardId] = useState(null);
  const scrollViewRef = useRef(null);

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
          .select("id, address, latitude, longitude, price_per_hour, availability_start, availability_end, is_available, description, width, length, image_url");

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

  const handleRemoveCard = (cardId) => {
    const updatedData = filteredParkingData.filter((item) => item.id !== cardId);
    setFilteredParkingData(updatedData);
    if (highlightedCardId === cardId) {
      setHighlightedCardId(null);
    }
  };

  const handleCardFocus = (cardId, latitude, longitude) => {
    setHighlightedCardId(cardId);
    mapRef.current.animateToRegion({
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

  const handleMarkerPress = (cardId, latitude, longitude) => {
    setHighlightedCardId(cardId);
    mapRef.current.animateToRegion({
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
      mapRef.current.animateToRegion(currentLocation);
    } else {
      console.log("Location not available");
    }
  };

  const resetSearch = () => {
    setSearchText("");
    setMarkers(parkingSpaces);
  };

  const onSwipeUp = () => {
    if (bottomSheet.current) {
      bottomSheet.current.show();
    }
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
              onPress={() => handleMarkerPress(parking.id, parking.latitude, parking.longitude)}
              ref={(ref) => {
                if (ref) {
                  markerRefs[parking.id] = ref;
                }
              }}
            />
          ))}
        </MapView>
        <View style={styles.topControls}>
          <TextInput
            style={styles.searchBar}
            placeholder="Search location"
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
          <Pressable onPress={focusMap} style={styles.focusButton}>
            <Text style={styles.buttonText}>Focus</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.cardListContainer}>
        {filteredParkingData.length > 0 ? (
          <ScrollView ref={scrollViewRef} contentContainerStyle={{ alignItems: 'center' }}>
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
                <Swipeable
                  key={card.id}
                  renderRightActions={() => (
                    <TouchableOpacity
                      style={styles.noButton}
                      onPress={() => handleRemoveCard(card.id)}
                    >
                      <Icon name="times-circle" size={30} color="white" />
                    </TouchableOpacity>
                  )}
                  renderLeftActions={() => (
                    <TouchableOpacity
                      style={styles.yesButton}
                      onPress={() => handleCardFocus(card.id, card.latitude, card.longitude)}
                    >
                      <Icon name="check-circle" size={30} color="white" />
                    </TouchableOpacity>
                  )}
                  onSwipeableRightOpen={() => handleRemoveCard(card.id)}
                  friction={2}
                >
                  <TouchableOpacity onPress={() => handleCardFocus(card.id, card.latitude, card.longitude)}>
                    <View style={styles.cardWide}>
                      <Image
                        source={{ uri: card.image_url }}
                        style={styles.cardImage}
                        resizeMode="cover"
                        onError={(e) => console.error("Error loading image: ", e.nativeEvent.error)}
                      />
                      <View style={styles.cardContentOverlay}>
                        <Text style={{ fontSize: 10, color: "#fff" }}>({distance} km)</Text>
                        <Text style={styles.cardAddress}>{card.address}</Text>
                        <Text style={styles.cardDetail}>
                          Price per hour: €{card.price_per_hour || "N/A"}
                        </Text>
                        <Text style={styles.cardDetail}>
                          Availability: {`${card.availability_start || ""} - ${
                            card.availability_end || ""
                          }`}
                        </Text>
                        <Text style={styles.cardDetail}>Width: {card.width || "N/A"} m</Text>
                        <Text style={styles.cardDetail}>Length: {card.length || "N/A"} m</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Swipeable>
              );
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
        height={700}
        onOpen={() => {
          setHighlightedCardId(null);
        }}
      >
        <ScrollView contentContainerStyle={{ padding: 10, alignItems: 'center' }}>
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
              <TouchableOpacity key={card.id} onPress={() => handleCardFocus(card.id, card.latitude, card.longitude)}>
                <View style={[styles.cardWide, { marginBottom: 10 }]}>
                  <Image
                    source={{ uri: card.image_url }}
                    style={styles.cardImage}
                    resizeMode="cover"
                    onError={(e) => console.error("Error loading image: ", e.nativeEvent.error)}
                  />
                  <View style={styles.cardContentOverlay}>
                    <Text style={{ fontSize: 10, color: "#fff" }}>({distance} km)</Text>
                    <Text style={styles.cardAddress}>{card.address}</Text>
                    <Text style={styles.cardDetail}>
                      Price per hour: €{card.price_per_hour || "N/A"}
                    </Text>
                    <Text style={styles.cardDetail}>
                      Availability: {`${card.availability_start || ""} - ${
                        card.availability_end || ""
                      }`}
                    </Text>
                    <Text style={styles.cardDetail}>Width: {card.width || "N/A"} m</Text>
                    <Text style={styles.cardDetail}>Length: {card.length || "N/A"} m</Text>
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
  cardWide: {
    width: 350,
    height: 250,
    borderRadius: 20,
    padding: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 20,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },
  cardContentOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: 15,
    justifyContent: "flex-end",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  cardAddress: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  cardDetail: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 3,
  },
  noButton: {
    backgroundColor: "#ff6b6b",
    padding: 15,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  yesButton: {
    backgroundColor: "#4caf50",
    padding: 15,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
