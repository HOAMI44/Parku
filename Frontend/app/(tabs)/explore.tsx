import React, { useState, useEffect, useMemo } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  TextInput,
} from "react-native";
import MapView, { PROVIDER_DEFAULT } from "react-native-maps";
import * as Location from "expo-location";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import { Stack } from "expo-router";
import BottomSheet from "@gorhom/bottom-sheet";
import CardMap from "@/components/CardMap";
import Swiper from "react-native-deck-swiper"; // Import the swiper library

type Props = {};

const INITIAL_REGION = {
  latitude: 47.41375,
  longitude: 9.74151,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const ExploreScreen = (props: Props) => {
  const [location, setLocation] = useState<any>(null);
  const mapRef = React.useRef<any>(null);
  const [searchText, setSearchText] = useState<string>("");

  // Data for parking spots (dummy data for demonstration)
  const [parkingSpots, setParkingSpots] = useState([
    { id: 1, name: "Hotel 1", time: "5:00", type: "Hotel", width: 100, length: 100, rating: 5, price: 100 },
    { id: 2, name: "Parking Lot 2", time: "6:00", type: "Parking", width: 120, length: 110, rating: 4, price: 80 },
    { id: 3, name: "Garage 3", time: "7:00", type: "Garage", width: 150, length: 120, rating: 3, price: 90 },
  ]);

  const snapPoints = useMemo(() => ["25%", "50%", "70%"], []);

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

  const handleSearch = () => {
    console.log("Search:", searchText);
    // Implement the search logic here
  };

  // Handle swipe actions
  const onSwipeLeft = (cardIndex: number) => {
    console.log("Swiped left on card index:", cardIndex);
    // Remove the card from the array
    const newParkingSpots = parkingSpots.filter((_, index) => index !== cardIndex);
    setParkingSpots(newParkingSpots);
  };

  const onSwipeRight = (cardIndex: number) => {
    console.log("Swiped right on card index:", cardIndex);
    // You can implement logic for a "yes" swipe here (e.g., adding to favorites)
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Map",
        }}
      />

      <View style={{ flex: 1 }}>
        {/* Map Component */}
        <MapView
          style={StyleSheet.absoluteFill} // Fills the entire view
          provider={PROVIDER_DEFAULT}
          initialRegion={INITIAL_REGION}
          showsUserLocation
          showsMyLocationButton
          ref={mapRef}
        />
        {/* Search Bar and Focus Button */}
        <View style={styles.topControls}>
          <TextInput
            style={styles.searchBar}
            placeholder="Search location"
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
          />
          <Pressable onPress={focusMap} style={styles.focusButton}>
            <Text style={styles.buttonText}>Focus</Text>
          </Pressable>
        </View>
      </View>

      {/* Swiper Component for Parking Spots */}
      <View style={styles.swiperContainer}>
        <Swiper
          cards={parkingSpots}
          renderCard={(card) => {
            return (
              <View style={styles.card}>
                <CardMap
                  id={card.id}
                  name={card.name}
                  time={card.time}
                  type={card.type}
                  width={card.width}
                  length={card.length}
                  rating={card.rating}
                  price={card.price}
                />
              </View>
            );
          }}
          onSwipedLeft={(cardIndex) => onSwipeLeft(cardIndex)}
          onSwipedRight={(cardIndex) => onSwipeRight(cardIndex)}
          cardIndex={0}
          backgroundColor={"#f0f0f0"}
          stackSize={3}
        />
      </View>
    </>
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
  swiperContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
  },
  card: {
    width: 300,
    height: 400,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    backgroundColor: "white",
  },
});
