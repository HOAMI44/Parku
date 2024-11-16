import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import FilterPopup from "../../components/FilterPopup"; // Correct import
import { filterParkingSpots } from "../../utils/filterParkingSpots"; // Correct import
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext"; // Add this import (you'll need to create this context if you haven't already)
import { supabase } from "../../lib/supabase"; // Adjust import path as needed
import { ParkingSpace } from "../../types/types";
import { useRouter } from "expo-router";

type FilterCriteria = {
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  distance?: number;
};

type Props = {};

// HomeScreen Component
const HomeScreen = (props: Props): JSX.Element => {
  const navigation = useNavigation();
  const { session } = useAuth();
  const [parkingData, setParkingData] = useState<ParkingSpace[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("Guest");
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [filterVisible, setFilterVisible] = useState<boolean>(false);
  const [filteredParkingData, setFilteredParkingData] = useState<ParkingSpace[]>(
    []
  );

  const dummyParkingData: ParkingSpace[] = [
    {
      id: "1",
      address: "Haus 1",
      user_id: "1",
      company_id: "1",
      availability_start: "2024-01-01",
      availability_end: "2024-01-01",
      is_available: true,
      created_at: "2024-01-01",
      latitude: 47.42665,
      longitude: 9.7365,
      description: "Ein schöner Parkplatz in der Nähe der Innenstadt",
      length: 5,
      width: 2,
      price_per_hour: 10,
    },

  ];

  // Fetch User Location
  const fetchUserLocation = async (): Promise<void> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission denied. Using dummy data.");
        setParkingData(dummyParkingData);
        setFilteredParkingData(dummyParkingData);
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setUserLocation(currentLocation.coords);

      const nearbyParking = filterParkingSpots(dummyParkingData, {
        userLocation: currentLocation.coords,
        distance: 5, // Default distance in km
      });
      setFilteredParkingData(nearbyParking);
    } catch (error) {
      console.error("Error fetching location:", error);
      setError("Failed to fetch user location");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserLocation();
  }, []);

  // Add this function to fetch user profile using Supabase's built-in profile management
  const fetchUserProfile = async () => {
    if (!session?.user?.id) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('first_name')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;

      if (data?.first_name) {
        setUserName(data.first_name);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserProfile();
    }
  }, [session]); // Re-fetch when session changes

  const applyFilter = (filterCriteria: FilterCriteria): void => {
    if (userLocation) {
      const filtered = filterParkingSpots(dummyParkingData, {
        ...filterCriteria,
        userLocation,
      });
      setFilteredParkingData(filtered);
    } else {
      const filtered = filterParkingSpots(dummyParkingData, filterCriteria);
      setFilteredParkingData(filtered);
    }
    setFilterVisible(false);
  };

  const router = useRouter();

  const renderParkingItem = ({ item }: { item: ParkingSpace }): JSX.Element => (
    <TouchableOpacity 
      onPress={() => {
        router.push({
          pathname: "/parking-details",
          params: { parking: JSON.stringify(item) }
        });
      }}
    >
      <View style={styles.parkingItem}>
        <View style={styles.parkingIconContainer}>
          <Text style={styles.parkingIcon}>{item.address.charAt(0)}</Text>
        </View>
        <View style={styles.parkingDetails}>
          <Text style={styles.parkingName}>{item.address}</Text>
          <Text style={styles.parkingPrice}>€{item.price_per_hour}/hour</Text>
        </View>
        <View style={styles.parkingActions}>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading parking spots...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Hello {userName}!</Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => {
          //@ts-ignore
          navigation.navigate("explore")
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
      {filteredParkingData.length === 0 ? (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>
            No parking spots match your filter criteria.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredParkingData}
          renderItem={renderParkingItem}
          keyExtractor={(item) => item.id.toString()}
        />
      )}
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
    backgroundColor: "#ffffff",
    padding: 24,
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
  parkingItem: {
    backgroundColor: "#f9f9f9",
    padding: 28,
    borderRadius: 16,
    marginBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },
  parkingIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#82DFF1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
  },
  parkingIcon: {
    fontSize: 26,
    color: "#ffffff",
    fontWeight: "bold",
  },
  parkingDetails: {
    flex: 1,
  },
  parkingName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 6,
  },
  parkingPrice: {
    fontSize: 16,
    color: "#666",
  },
  parkingActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noResultsText: {
    fontSize: 20,
    color: "#666",
    fontWeight: "bold",
    textAlign: "center",
  },
});
