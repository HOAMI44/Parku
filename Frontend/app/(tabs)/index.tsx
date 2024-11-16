import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import FilterPopup from "../../components/FilterPopup"; // Correct import
import { filterParkingSpots } from "../../utils/filterParkingSpots"; // Correct import
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext"; // Add this import (you'll need to create this context if you haven't already)
import { ParkingSpaceWithName } from "../../types/types";
import { router } from "expo-router";
import ParkingSpaceList from "@/components/ParkingSpaceList";
import {
  useGetUserById,
  useGetAllParkingSpacesWithName,
} from "@/hooks/database/queries";
import useUserLocation from "@/hooks/useUserLocation";

type FilterCriteria = {
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  distance?: number;
};

const HomeScreen = (): JSX.Element => {
  const { session } = useAuth();
  const { data: parkingSpaces, loading: parkingSpacesLoading } =
    useGetAllParkingSpacesWithName();
  const { data: user, loading: userLoading } = useGetUserById(
    session?.user?.id ?? ""
  );
  const { location: userLocation, loading: locationLoading } =
    useUserLocation();
  const isLoading = userLoading || parkingSpacesLoading || locationLoading;

  const [filterVisible, setFilterVisible] = useState<boolean>(false);
  const [filteredParkingSpaces, setFilteredParkingSpaces] = useState<
    ParkingSpaceWithName[]
  >([]);

  const applyFilter = (filterCriteria: FilterCriteria): void => {
    console.log("Applying filter with criteria:", filterCriteria);
    console.log(parkingSpaces);
    if (parkingSpaces) {
      if (userLocation) {
        const filtered = filterParkingSpots(parkingSpaces, {
          ...filterCriteria,
          userLocation: {
            latitude: userLocation.coords.latitude,
            longitude: userLocation.coords.longitude,
          },
        });
        console.log("Filtered parking spaces with user location:", filtered);
        setFilteredParkingSpaces(filtered);
      } else if (parkingSpaces) {
        const filtered = filterParkingSpots(parkingSpaces, filterCriteria);
        console.log("Filtered parking spaces without user location:", filtered);
        setFilteredParkingSpaces(filtered);
      }
    }
    setFilterVisible(false);
  };

  useEffect(() => {
    if (userLocation && parkingSpaces) {
      const nearbyParking = filterParkingSpots(parkingSpaces, {
        userLocation: {
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
        },
        distance: 5, // Default distance in km
      });
      setFilteredParkingSpaces(nearbyParking);
    }
  }, [userLocation, parkingSpaces]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading parking spots...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={{ padding: 15, paddingBottom: 0 }}>
        <Text style={styles.greeting}>Hello {user?.first_name}!</Text>
        <TouchableOpacity
          style={styles.exploreButton}
          onPress={() => {
            router.push("/explore");
          }}
        >
          <Text style={styles.exploreButtonText}>Go explore parking lots!</Text>
        </TouchableOpacity>
        <View style={styles.horizontalLine} />
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>In your vicinity:</Text>
          <TouchableOpacity onPress={() => setFilterVisible(true)}>
            <Ionicons name="filter" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>
      <ParkingSpaceList
        parkingSpaces={filteredParkingSpaces}
        noResultsText="No parking spaces match your filter criteria."
      />
      <FilterPopup
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApplyFilter={applyFilter}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  greeting: {
    fontSize: 35,
    fontWeight: "bold",
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: "#82DFF1",
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  exploreButtonText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  horizontalLine: {
    height: 1,
    backgroundColor: "#cccccc",
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 25,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  detailContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 24,
    justifyContent: "flex-start",
  },
  detailTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  detailSection: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#444",
  },
  detailText: {
    fontSize: 18,
    color: "#555",
  },
  backButton: {
    marginTop: 20,
    backgroundColor: "#82DFF1",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: "center",
  },
  backButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
