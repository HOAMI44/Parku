import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  TextInput,
} from "react-native";
import React, { useState, useEffect, useMemo } from "react";
import MapView, { PROVIDER_DEFAULT } from "react-native-maps";
import * as Location from "expo-location";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import { Stack } from "expo-router";
import BottomSheet from "@gorhom/bottom-sheet";
import CardMap from "@/components/CardMap";

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
      <View style={styles.bottomSheet}>
        <ScrollView
          style={{
            width: "100%",
            height: 280,
            backgroundColor: "white",
            borderRadius: 35,
          }}
          horizontal={true}
        >
         <CardMap
       id={1}
       name="Hotel"
       time="5:00"
       type="Hotel"
       width={100}
       length={100}
       rating={5}
       price={100}
       />
        </ScrollView>
      </View>
    </>
  );
};

export default ExploreScreen;

const styles = StyleSheet.create({
  topControls: {
    position: "absolute",
    top: 20, // Position near the top of the screen
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
    elevation: 3, // For Android shadow
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
  bottomSheet: {
    position: "absolute",
    bottom: 0, // Position near the top of the screen
    left: 0,
    right: 0,
    width: "100%",
    alignItems: "center",
    zIndex: 10,
  },
});
