import React, { useEffect, useState } from "react";
import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { createTamagui, TamaguiProvider } from "tamagui";
import defaultConfig from "@tamagui/config/v3";
import { useBookings } from "@/contexts/BookingsContext"; // Adjust path as needed
import { Text, View } from "react-native";
import { supabase } from "@/lib/supabase";
import { ActivityIndicator } from "react-native-paper";
import { useAuth } from "@/contexts/AuthContext";
import { Booking, ParkingSpace } from "@/types/types";

const config = createTamagui(defaultConfig);
type BookingWithSpace = Booking & {
  parking_space: ParkingSpace;
};

export default function TabLayout() {
  
  const router = useRouter();
  const { session } = useAuth();
  const [upcomingBookings, setUpcomingBookings] = useState<BookingWithSpace[]>(
    []
  );
  const [pastBookings, setPastBookings] = useState<BookingWithSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);


  const fetchBookings = async () => {
    if (!session) return;

    try {
      const { data: bookings, error } = await supabase
        .from("bookings")
        .select(
          `
          *,
          parking_space:space_id (*)
        `
        )
        .eq("user_id", session.user.id)
        .order("start_time", { ascending: true });

      if (error) throw error;

      const now = new Date();
      const upcoming: BookingWithSpace[] = [];
      const past: BookingWithSpace[] = [];

      bookings?.forEach((booking: BookingWithSpace) => {
        const endTime = new Date(booking.end_time);
        if (endTime > now) {
          upcoming.push(booking);
        } else {
          past.push(booking);
        }
      });

      setUpcomingBookings(upcoming);
      setPastBookings(past);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  useEffect(() => {
    fetchBookings();
  }, [session]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text>Loading...</Text>
      </View>
    );
  }


  return (
    <TamaguiProvider config={config}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            headerShown: false,
          }}
          sceneContainerStyle={{ marginTop: 35 }}
        >
          <Tabs.Screen
            name="Home"
            options={{
              title: "Home",
              tabBarIcon: ({ color }) => (
                <Ionicons name="home-outline" size={22} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="Explore"
            options={{
              headerTitle: "Map",
              tabBarIcon: ({ color }) => (
                <Ionicons name="search-outline" size={22} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="BookingHistory"
            options={{
              title: "Bookings",
              tabBarIcon: ({ color }) => (
                <View style={{ position: "relative" }}>
                  <Ionicons name="calendar-outline" size={22} color={color} />
                  {upcomingBookings.length > 0 && (
                    <View
                      style={{
                        position: "absolute",
                        top: -5,
                        right: -10,
                        backgroundColor: "red",
                        borderRadius: 8,
                        width: 16,
                        height: 16,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "white",
                          fontSize: 10,
                          fontWeight: "bold",
                        }}
                      >
                        {upcomingBookings.length}
                      </Text>
                    </View>
                  )}
                </View>
              ),
            }}
          />
          <Tabs.Screen
            name="CreateSpace"
            options={{
              title: "Create",
              tabBarIcon: ({ color }) => (
                <Ionicons name="add-circle-outline" size={22} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="Profile"
            options={{
              title: "Profile",
              tabBarIcon: ({ color }) => (
                <Ionicons name="person-outline" size={22} color={color} />
              ),
            }}
          />
        </Tabs>
      </GestureHandlerRootView>
    </TamaguiProvider>
  );
}