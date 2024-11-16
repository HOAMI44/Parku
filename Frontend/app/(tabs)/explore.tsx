import React, { useState, useEffect, useMemo } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  TextInput,
} from "react-native";
import MapView, { Callout, Marker, PROVIDER_DEFAULT } from "react-native-maps";
import * as Location from "expo-location";
import { ScrollView } from "react-native-gesture-handler";
import { Stack } from "expo-router";
import CardMap from "@/components/CardMap";
import { TamaPopover } from "@/components/TamaPopover";
import { ChevronUp } from "@tamagui/lucide-icons";
import { Button, XStack, YStack } from "tamagui";
import Swiper from "react-native-deck-swiper"; // Import the swiper library

type Props = {};

const INITIAL_REGION = {
  latitude: 47.41375,
  longitude: 9.74151,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

let testMarkers = [
  {
    id: 1,
    name: "Marker 1",
    latitude: 47.40793,
    longitude: 9.74372,
  },
  {
    id: 2,
    name: "Marker 2",
    latitude: 47.40747,
    longitude: 9.74499,
  },
  {
    id: 3,
    name: "Marker 3",
    latitude: 47.40862,
    longitude: 9.74343,
  },
  {
    id: 4,
    name: "Marker 4",
    latitude: 47.42665,
    longitude: 9.7365,
  },
  {
    id: 5,
    name: "Marker 5",
    latitude: 47.41776,
    longitude: 9.73973,
  },
];

const ExploreScreen = () => {
  const [location, setLocation] = useState<any>(null);
  const mapRef = React.useRef<any>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [shouldAdapt, setShouldAdapt] = useState(true);
  const [markers, setMarkers] = useState(testMarkers);
  const [distance, setDistance] = useState(1);
  const [activePopover, setActivePopover] = useState<number | null>(null);

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

    if (!location) {
      console.log("User location not available for distance filtering.");
      return;
    }

    const userLatitude = location.coords.latitude;
    const userLongitude = location.coords.longitude;

    const filteredMarkers = testMarkers.filter((marker) => {
      const markerDistance = getDistanceFromLatLonInMeters(
        userLatitude,
        userLongitude,
        marker.latitude,
        marker.longitude
      );

      return (
        marker.name.toLowerCase().includes(searchText.toLowerCase()) &&
        markerDistance <= distance * 1000 // Convert `distance` to meters for comparison
      );
    });

    setMarkers(filteredMarkers);
  };

  const handleDistance = (value: number) => {
    console.log("Distance:", value);
    setDistance(value);

    if (location) {
      const userLatitude = location.coords.latitude;
      const userLongitude = location.coords.longitude;

      const filteredMarkers = testMarkers.filter((marker) => {
        const markerDistance = getDistanceFromLatLonInMeters(
          userLatitude,
          userLongitude,
          marker.latitude,
          marker.longitude
        );

        return markerDistance <= value * 1000; // Convert `value` to meters
      });

      setMarkers(filteredMarkers);

      // Reset active popover if no marker matches
      if (!filteredMarkers.some((marker) => marker.id === activePopover)) {
        setActivePopover(null);
      }
    } else {
      console.log("Location not available for distance filtering.");
    }
  };

  const getDistanceFromLatLonInMeters = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const deg2rad = (deg: number) => deg * (Math.PI / 180);
    const R = 6371000; // Radius of the earth in meters
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in meters
    return d;
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
          style={StyleSheet.absoluteFill}
          provider={PROVIDER_DEFAULT}
          initialRegion={INITIAL_REGION}
          showsUserLocation
          showsMyLocationButton
          ref={mapRef}
          onMapReady={focusMap}
        >
          {markers.map((imarker) => {
  if (
    !imarker.latitude ||
    !imarker.longitude ||
    typeof imarker.latitude !== "number" ||
    typeof imarker.longitude !== "number"
  ) {
    console.warn("Invalid marker data:", imarker);
    return null; // Skip invalid markers
  }

  return (
    <Marker
      key={imarker.id}
      coordinate={{
        latitude: imarker.latitude,
        longitude: imarker.longitude,
      }}
      title={imarker.name || "Unknown Location"}
      onPress={() => setActivePopover(imarker.id)}
    >
      {activePopover === imarker.id && (
        <Callout>
          <View>
            <Text>{imarker.name}</Text>
          </View>
        </Callout>
      )}
    </Marker>
  );
})}
        </MapView>

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
          <YStack gap="$4">
            <XStack
              gap="$2"
              flex={1}
              justifyContent="center"
              alignItems="center"
            >
              <TamaPopover
                shouldAdapt={shouldAdapt}
                placement="left"
                Icon={ChevronUp}
                Name="left-popover"
                distance={distance}
                handleDistance={handleDistance}
              />
            </XStack>
          </YStack>
          <Button color="aliceblue" variant="outlined" onPress={focusMap}>
            <Text>Focus</Text>
          </Button>
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
