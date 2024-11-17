import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
  Dimensions,
  Platform,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from 'react-native-paper';
import { ParkingSpace } from "../types/types";
import { formatCurrency, formatDate, formatTime } from "../utils/formatters";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import DateTimePicker from '@react-native-community/datetimepicker';

const ParkingDetails = (): JSX.Element => {
  const router = useRouter();
  const { session } = useAuth();
  const params = useLocalSearchParams<{parkingSpace: string}>();
  const parkingSpace: ParkingSpace = JSON.parse(params.parkingSpace);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showStartDate, setShowStartDate] = useState(false);
  const [showStartTime, setShowStartTime] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [showEndTime, setShowEndTime] = useState(false);

  const availabilityStart = new Date(parkingSpace.availability_start);
const availabilityEnd = new Date(parkingSpace.availability_end);

if (isNaN(availabilityStart.getTime()) || isNaN(availabilityEnd.getTime())) {
    console.error("Invalid availability dates");
  }

  const handleBookButtonPress = () => {
    if (!session) {
      Alert.alert("Login Required", "Please login to book a parking space", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Login",
          onPress: () => router.push("/Login"),
        },
      ]);
      return;
    }
    setIsModalVisible(true);
  };

  const validateTimeSelection = async () => {
    if (startTime.getTime() < availabilityStart.getTime() || endTime.getTime() > availabilityEnd.getTime()) {
      Alert.alert(
        "Invalid Time Selection",
        "Please select times within the parking space's availability window."
      );
      return false;
    }

    if (endTime.getTime() <= startTime.getTime()) {
      Alert.alert(
        "Invalid Time Selection",
        "End time must be after start time."
      );
      return false;
    }

    const { data: existingBookings, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("space_id", parkingSpace.id)
      .gte("end_time", startTime.toISOString())
      .lte("start_time", endTime.toISOString());

    if (error) {
      console.error("Error checking bookings:", error);
      return false;
    }

    if (existingBookings && existingBookings.length > 0) {
      Alert.alert(
        "Booking Conflict",
        "This time slot is already booked. Please select different times."
      );
      return false;
    }

    return true;
  };

  const handleBooking = async () => {
    if (!session) {
      Alert.alert("Error", "Please login to book a parking space");
      return;
    }

    setLoading(true);

    try {
      const isValid = await validateTimeSelection();
      if (!isValid) {
        setLoading(false);
        return;
      }

      const hours =
        (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      const totalPrice = hours * parkingSpace.price_per_hour;

      const { data, error } = await supabase
        .from("bookings")
        .insert([
          {
            user_id: session?.user?.id,
            space_id: parkingSpace.id,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            total_price: totalPrice,
            status: "completed",
          },
        ])
        .select()
        .single();

      if (error) throw error;

      Alert.alert(
        "Booking Successful! 🎉",
        `Your parking space has been booked for ${formatDate(
          startTime.toISOString()
        )} from ${formatTime(startTime.toISOString())} to ${formatTime(
          endTime.toISOString()
        )}`,
        [
          {
            text: "View My Bookings",
            onPress: () => {
              setIsModalVisible(false);
              router.push("/BookingHistory");
            },
          },
          {
            text: "Continue Browsing",
            onPress: () => {
              setIsModalVisible(false);
              router.push("/Explore");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error creating booking:", error);
      Alert.alert("Error", "Failed to create booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // iOS specific component
  const IOSTimePicker = ({ startTime, endTime, handleStartChange, handleEndChange }) => (
    <>
      <View style={styles.timeSection}>
        <Text style={styles.timeSectionTitle}>Start Time</Text>
        <DateTimePicker
          value={startTime}
          mode="datetime"
          minimumDate={new Date(availabilityStart)}
          maximumDate={new Date(availabilityEnd)}
          onChange={handleStartChange}
          display="compact"
          style={styles.dateTimePicker}
        />
      </View>

      <View style={styles.timeSection}>
        <Text style={styles.timeSectionTitle}>End Time</Text>
        <DateTimePicker
          value={endTime}
          mode="datetime"
          minimumDate={startTime}
          maximumDate={new Date(availabilityEnd)}
          onChange={handleEndChange}
          display="compact"
          style={styles.dateTimePicker}
        />
      </View>
    </>
  );

  // Android/other platforms component
  const DefaultTimePicker = ({ startTime, endTime, setShowStartDate, setShowStartTime, setShowEndDate, setShowEndTime }) => (
    <>
      <View style={styles.timeSection}>
        <Text style={styles.timeSectionTitle}>Start Time</Text>
        <View style={styles.dateTimeContainer}>
          <TouchableOpacity 
            style={styles.dateTimeButton}
            onPress={() => setShowStartDate(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <Text style={styles.dateTimeText}>
              {startTime.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.dateTimeButton}
            onPress={() => setShowStartTime(true)}
          >
            <Ionicons name="time-outline" size={20} color="#666" />
            <Text style={styles.dateTimeText}>
              {startTime.toLocaleTimeString().slice(0, 5)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.timeSection}>
        <Text style={styles.timeSectionTitle}>End Time</Text>
        <View style={styles.dateTimeContainer}>
          <TouchableOpacity 
            style={styles.dateTimeButton}
            onPress={() => setShowEndDate(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <Text style={styles.dateTimeText}>
              {endTime.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.dateTimeButton}
            onPress={() => setShowEndTime(true)}
          >
            <Ionicons name="time-outline" size={20} color="#666" />
            <Text style={styles.dateTimeText}>
              {endTime.toLocaleTimeString().slice(0, 5)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );

  // In your main component, use Platform.select
  const TimePicker = Platform.select({
    ios: IOSTimePicker,
    default: DefaultTimePicker,
  });

  // Add this function to calculate hours between two dates
  const calculateHours = (start: Date, end: Date) => {
    const diffInMs = end.getTime() - start.getTime();
    return diffInMs / (1000 * 60 * 60); // Convert ms to hours
  };

  return (
    <>
      <Stack.Screen 
        options={{
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#007AFF" />
            </TouchableOpacity>
          ),
          headerTitle: "Details"
        }} 
      />
      
      <ScrollView style={styles.container}>
        {/* Header Image or Placeholder */}
        <View style={styles.imageContainer}>
          {parkingSpace.image_url ? (
            <Image
              source={{ uri: parkingSpace.image_url }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="car" size={60} color="#ffffff" />
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{parkingSpace.address}</Text>
          <View style={styles.priceTag}>
            <Text style={styles.price}>
              €{parkingSpace.price_per_hour}
              <Text style={styles.priceUnit}>/hour</Text>
            </Text>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={24} color="#666" />
              <Text style={styles.infoText}>
                Available: {formatDate(parkingSpace.availability_start)} -{" "}
                {formatDate(parkingSpace.availability_end)}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="resize" size={24} color="#666" />
              <Text style={styles.infoText}>
                Size: {parkingSpace.length}m x {parkingSpace.width}m
              </Text>
            </View>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>
              {parkingSpace.description || "No description available"}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.bookButton, !session && styles.bookButtonDisabled]}
            onPress={handleBookButtonPress}
          >
            <Text style={styles.bookButtonText}>
              {session ? "Book Now" : "Login to Book"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book Parking Space</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.priceInfo}>
              <Text style={styles.priceInfoText}>
                Rate: {formatCurrency(parkingSpace.price_per_hour)}/hour
              </Text>
            </View>

            <TimePicker
              startTime={startTime}
              endTime={endTime}
              handleStartChange={(event, date) => {
                if (date) setStartTime(date);
              }}
              handleEndChange={(event, date) => {
                if (date) setEndTime(date);
              }}
              setShowStartDate={setShowStartDate}
              setShowStartTime={setShowStartTime}
              setShowEndDate={setShowEndDate}
              setShowEndTime={setShowEndTime}
            />

            {/* For Android, keep the hidden DateTimePickers */}
            {Platform.OS === 'android' && (
              <>
                {showStartDate && (
                  <DateTimePicker
                    value={startTime}
                    mode="date"
                    minimumDate={new Date(availabilityStart)}
                    maximumDate={new Date(availabilityEnd)}
                    onChange={(event, selectedDate) => {
                      setShowStartDate(false);
                      if (selectedDate) {
                        const newDate = new Date(selectedDate);
                        newDate.setHours(startTime.getHours(), startTime.getMinutes());
                        setStartTime(newDate);
                      }
                    }}
                  />
                )}
                {/* ... other Android DateTimePickers ... */}
              </>
            )}

            <View style={styles.totalPriceContainer}>
              <Text style={styles.totalPriceLabel}>Total Price:</Text>
              <Text style={styles.totalPriceAmount}>
                {formatCurrency(calculateHours(startTime, endTime) * parkingSpace.price_per_hour)}
              </Text>
              <Text style={styles.totalPriceDetails}>
                for {Math.ceil(calculateHours(startTime, endTime))} hours
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleBooking}
                disabled={loading}
              >
                <Text style={styles.modalButtonText}>
                  {loading ? "Booking..." : "Confirm Booking"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  imageContainer: {
    width: "100%",
    height: 300,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#82DFF1",
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 1,
  },
  contentContainer: {
    padding: 24,
    marginTop: -40,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  priceTag: {
    backgroundColor: "#82DFF1",
    alignSelf: "flex-start",
    padding: 10,
    borderRadius: 12,
    marginBottom: 20,
  },
  price: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  priceUnit: {
    fontSize: 16,
    fontWeight: "normal",
  },
  infoSection: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: "#666",
    marginLeft: 12,
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  bookButton: {
    backgroundColor: "#82DFF1",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  bookButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  priceInfo: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  priceInfoText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  timeSection: {
    marginBottom: 24,
  },
  timeSectionTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  timeDisplay: {
    fontSize: 20,
    color: '#333',
    fontWeight: '600',
    paddingVertical: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ff4444',
  },
  confirmButton: {
    backgroundColor: '#82DFF1',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bookButtonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  dateTimeButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  dateTimeText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  dateTimePicker: {
    height: 40,
    marginTop: 8,
  },
  totalPriceContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  totalPriceLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  totalPriceAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  totalPriceDetails: {
    fontSize: 14,
    color: '#666',
  },
});

export default ParkingDetails;
