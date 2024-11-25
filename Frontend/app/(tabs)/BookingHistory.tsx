import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { Booking, ParkingSpace } from "../../types/types";
import { formatDate, formatTime, formatCurrency } from "../../utils/formatters";
import { checkBookingOverlap } from "@/utils/bookingValidation";

type BookingWithSpace = Booking & {
  parking_space: ParkingSpace;
};

const BookingHistory = () => {
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

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const renderBookingItem = ({ item }: { item: BookingWithSpace }) => (
    <TouchableOpacity
      style={styles.bookingCard}
      onPress={() => {
        router.push({
          pathname: "/ParkingDetails",
          params: { parkingSpace: JSON.stringify(item.parking_space) },
        });
      }}
    >
      <View style={styles.bookingHeader}>
        <Ionicons name="location" size={24} color="#82DFF1" />
        <Text style={styles.address} numberOfLines={1}>
          {item.parking_space.address}
        </Text>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            From: {formatDate(item.start_time)} - To: {formatDate(item.end_time)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            {formatTime(item.start_time)} - {formatTime(item.end_time)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="cash-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            {formatCurrency(item.total_price)}
          </Text>
        </View>

        <View style={[styles.detailRow, styles.statusContainer]}>
          <Text
            style={[
              styles.status,
              { color: item.status === "confirmed" ? "#4CAF50" : "#FFA000" },
            ]}
          >
            {item.status?.toUpperCase() || "CONFIRMED"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSectionHeader = (title: string, count: number) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.bookingCount}>{count} bookings</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#82DFF1" />
        <Text>Loading bookings...</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={[
        { type: "upcomingHeader" },
        ...upcomingBookings,
        { type: "pastHeader" },
        ...pastBookings,
      ]}
      renderItem={({ item }) => {
        if ("type" in item && item.type === "upcomingHeader") {
          return renderSectionHeader(
            "Upcoming Bookings",
            upcomingBookings.length
          );
        }
        if ("type" in item && item.type === "pastHeader") {
          return renderSectionHeader("Past Bookings", pastBookings.length);
        }
        return renderBookingItem({ item: item as BookingWithSpace });
      }}
      keyExtractor={(item) => {
        if ("type" in item) return item.type;
        return item.id;
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#82DFF1"]}
        />
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No bookings found</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  bookingCount: {
    fontSize: 14,
    color: "#666",
  },
  bookingCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  address: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
    flex: 1,
  },
  bookingDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
  },
  statusContainer: {
    justifyContent: "flex-end",
    marginTop: 4,
  },
  status: {
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: "#f5f5f5",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
  },
});

export default BookingHistory;
