import React, { useState, useContext } from "react";
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
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { ParkingSpace } from "../types/types";
import { formatCurrency, formatDate, formatTime } from "../utils/formatters";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

const ParkingDetailsScreen = (): JSX.Element => {
  const router = useRouter();
  const { session } = useAuth();
  const params = useLocalSearchParams<{ parking: string }>();
  const parking: ParkingSpace = JSON.parse(params.parking);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const availabilityStart = new Date(parking.availability_start);
  const availabilityEnd = new Date(parking.availability_end);

  const handleBookButtonPress = () => {
    if (!session) {
      Alert.alert(
        "Login Required",
        "Please login to book a parking space",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Login", 
            onPress: () => router.push("/signIn")
          }
        ]
      );
      return;
    }
    setIsModalVisible(true);
  };

  const validateTimeSelection = async () => {
    if (startTime < availabilityStart || endTime > availabilityEnd) {
      Alert.alert(
        "Invalid Time Selection",
        "Please select times within the parking space's availability window."
      );
      return false;
    }

    if (endTime <= startTime) {
      Alert.alert(
        "Invalid Time Selection",
        "End time must be after start time."
      );
      return false;
    }

    const { data: existingBookings, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('space_id', parking.id)
      .gte('end_time', startTime.toISOString())
      .lte('start_time', endTime.toISOString());

    if (error) {
      console.error('Error checking bookings:', error);
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

      const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      const totalPrice = hours * parking.price_per_hour;

      const { data, error } = await supabase
        .from('bookings')
        .insert([
          {
            user_id: session?.user?.id,
            space_id: parking.id,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            total_price: totalPrice,
            status: 'confirmed'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      Alert.alert(
        "Booking Successful! 🎉",
        `Your parking space has been booked for ${formatDate(startTime.toISOString())} from ${formatTime(startTime.toISOString())} to ${formatTime(endTime.toISOString())}`,
        [
          {
            text: "View My Bookings",
            onPress: () => {
              setIsModalVisible(false);
              router.push("/bookingHistory");
            }
          },
          {
            text: "Continue Browsing",
            onPress: () => {
              setIsModalVisible(false);
              router.push("/explore");
            }
          }
        ]
      );

    } catch (error) {
      console.error('Error creating booking:', error);
      Alert.alert("Error", "Failed to create booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ScrollView style={styles.container}>
        {/* Header Image or Placeholder */}
        <View style={styles.imageContainer}>
          {parking.image_url ? (
            <Image
              source={{ uri: parking.image_url }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="car" size={60} color="#ffffff" />
            </View>
          )}
        </View>

        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back-circle" size={40} color="#ffffff" />
        </TouchableOpacity>

        {/* Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{parking.address}</Text>
          
          <View style={styles.priceTag}>
            <Text style={styles.price}>
              €{parking.price_per_hour}
              <Text style={styles.priceUnit}>/hour</Text>
            </Text>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={24} color="#666" />
              <Text style={styles.infoText}>
                Available: {formatDate(parking.availability_start)} - {formatDate(parking.availability_end)}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="resize" size={24} color="#666" />
              <Text style={styles.infoText}>
                Size: {parking.length}m x {parking.width}m
              </Text>
            </View>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{parking.description || "No description available"}</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.bookButton,
              !session && styles.bookButtonDisabled
            ]}
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
                Rate: {formatCurrency(parking.price_per_hour)}/hour
              </Text>
            </View>
            
            <View style={styles.timePickerContainer}>
              <Text style={styles.timeLabel}>Start Time:</Text>
              <DateTimePicker
                value={startTime}
                mode="datetime"
                minimumDate={availabilityStart}
                maximumDate={availabilityEnd}
                onChange={(event, selectedDate) => {
                  if (selectedDate) setStartTime(selectedDate);
                }}
              />
            </View>

            <View style={styles.timePickerContainer}>
              <Text style={styles.timeLabel}>End Time:</Text>
              <DateTimePicker
                value={endTime}
                mode="datetime"
                minimumDate={startTime}
                maximumDate={availabilityEnd}
                onChange={(event, selectedDate) => {
                  if (selectedDate) setEndTime(selectedDate);
                }}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  styles.confirmButton,
                  loading && styles.buttonDisabled
                ]}
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
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  timePickerContainer: {
    marginBottom: 20,
  },
  timeLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: "#666",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#ff4444",
  },
  confirmButton: {
    backgroundColor: "#82DFF1",
  },
  modalButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  bookButtonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButton: {
    padding: 5,
  },
  priceInfo: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  priceInfoText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default ParkingDetailsScreen; 