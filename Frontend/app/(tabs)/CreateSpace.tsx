import 'react-native-get-random-values';
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Stack } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, FlatList } from "react-native-gesture-handler";
import { supabase } from "../../lib/supabase";
import type { ParkingSpace } from "../../types/types";
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { GOOGLE_MAPS_API_KEY } from '@env';
import { v4 as uuidv4 } from 'uuid';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRouter } from "expo-router";

const CreateSpace: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [length, setLength] = useState<string>("");
  const [width, setWidth] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [image, setImage] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);
  const [availabilityStart, setAvailabilityStart] = useState<string>("");
  const [availabilityEnd, setAvailabilityEnd] = useState<string>("");
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const router = useRouter();

  useEffect(() => {
    console.log("key: " + GOOGLE_MAPS_API_KEY);
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.05,
      base64: false,
      exif: false,
    });

    if (!result.canceled) {
      console.log('Image picked:', {
        uri: result.assets[0].uri,
        width: result.assets[0].width,
        height: result.assets[0].height,
      });
      setImage(result.assets[0].uri);
    }
  };

  const createSpace = async () => {
    try {
      // Helper function for number formatting
      const cleanNumber = (value: string) => {
        return value
          .trim()
          .replace(/,/g, '.') // Replace all commas with periods
          .replace(/[^\d.]/g, ''); // Remove any non-digit characters except period
      };

      const cleanPrice = cleanNumber(price);
      const cleanLength = cleanNumber(length);
      const cleanWidth = cleanNumber(width);

      if (!cleanPrice || isNaN(parseFloat(cleanPrice))) {
        alert('Please enter a valid price per hour');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      let imageUrl = "";
      
      if (image) {
        try {
          const formData = new FormData();
          const uriParts = image.split('.');
          const fileType = uriParts[uriParts.length - 1];

          const imageFile = {
            uri: image,
            name: `${uuidv4()}.${fileType}`,
            type: `image/${fileType}`
          };

          formData.append('file', imageFile as any);

          const fileName = `${user.id}/${uuidv4()}.${fileType}`;

          console.log('Uploading file:', {
            fileName,
            type: imageFile.type,
            uri: imageFile.uri
          });

          const { data, error } = await supabase.storage
            .from('parking_spaces')
            .upload(fileName, formData, {
              contentType: 'multipart/form-data'
            });

          if (error) {
            console.error('Storage error:', error);
            throw error;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('parking_spaces')
            .getPublicUrl(fileName);
              
          imageUrl = publicUrl;
          console.log('Upload successful, public URL:', imageUrl);

        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          throw uploadError;
        }
      }

      // Format the dates correctly for PostgreSQL
      const formatTimeForDB = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { 
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      };

      // Modify the newParkingSpace object to ensure price is explicitly converted
      const newParkingSpace: Partial<ParkingSpace> = {
        user_id: user.id,
        address,
        latitude,
        longitude,
        price_per_hour: parseFloat(cleanPrice),
        availability_start: formatTimeForDB(availabilityStart),
        availability_end: formatTimeForDB(availabilityEnd),
        is_available: true,
        description,
        length: cleanLength ? parseFloat(cleanLength) : undefined,
        width: cleanWidth ? parseFloat(cleanWidth) : undefined,
        image_url: imageUrl,
      };

      console.log('Final price value:', newParkingSpace.price_per_hour);
      console.log('Sending to database:', newParkingSpace);

      const { data, error } = await supabase
        .from('parking_spaces')
        .insert(newParkingSpace)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log("Parking space created:", data);
      alert('Parking space created successfully!');
      router.push('/profile');
      
      
    } catch (error) {
      console.error("Error creating spot:", error);
      alert('Failed to create parking space. Please try again.');
    }
  };

  const formatDateTime = (date: Date | null) => {
    if (!date) return '';
    return `${date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: '2-digit'
    })} ${date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })}`;
  };

  const handleStartChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === "set" && selectedDate) {
      if (pickerMode === 'date') {
        // Only update the date portion, keep the existing time if any
        const newDate = new Date(selectedDate);
        if (startTime) {
          newDate.setHours(startTime.getHours(), startTime.getMinutes());
        }
        setStartTime(newDate);
        setAvailabilityStart(newDate.toISOString());
      } else {
        // Update just the time portion while keeping the existing date
        const newDate = new Date(startTime || selectedDate);
        newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
        setStartTime(newDate);
        setAvailabilityStart(newDate.toISOString());
      }
    }
  };

  const handleEndChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === "set" && selectedDate) {
      if (pickerMode === 'date') {
        // Only update the date portion, keep the existing time if any
        const newDate = new Date(selectedDate);
        if (endTime) {
          newDate.setHours(endTime.getHours(), endTime.getMinutes());
        }
        setEndTime(newDate);
        setAvailabilityEnd(newDate.toISOString());
      } else {
        // Update just the time portion while keeping the existing date
        const newDate = new Date(endTime || selectedDate);
        newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
        setEndTime(newDate);
        setAvailabilityEnd(newDate.toISOString());
      }
    }
  };

  // Create an array of render items
  const renderItems = [
    { key: 'image', component: (
      <TouchableOpacity onPress={pickImage}>
        {image ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.image} />
          </View>
        ) : (
          <View style={styles.buttonContainer}>
            <Text style={styles.btnText}>Upload Image</Text>
          </View>
        )}
      </TouchableOpacity>
    )},
    { key: 'dimensions', component: (
      <View style={styles.dimensionsContainer}>
        <View style={[styles.inputContainer, { flex: 1 }]}>
          <MaterialIcons 
            name="straighten" 
            size={20} 
            color="gray" 
            style={[styles.icon, { transform: [{ rotate: '90deg' }], marginRight: 10 }]}
          />
          <TextInput
            style={styles.input}
            placeholder="Length (m)"
            value={length}
            onChangeText={setLength}
            keyboardType="numeric"
          />
        </View>
        <View style={[styles.inputContainer, { flex: 1 }]}>
          <MaterialIcons 
            name="straighten" 
            size={20} 
            color="gray" 
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Width (m)"
            value={width}
            onChangeText={setWidth}
            keyboardType="numeric"
          />
        </View>
      </View>
    )},
    { key: 'description', component: (
      <View style={styles.inputContainer}>
        <MaterialIcons name="description" size={20} color="gray" style={styles.icon} />
        <TextInput
          style={[styles.input, { height: 30 }]}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline={true}
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>
    )},
    { key: 'price', component: (
      <View style={styles.inputContainer}>
        <MaterialIcons name="attach-money" size={20} color="gray" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Price per hour"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />
      </View>
    )},
    { key: 'availability', component: (
      <View>
        <Text style={styles.sectionTitle}>Availability Period</Text>
        <View style={styles.dimensionsContainer}>
          <View style={[styles.inputContainer, { flex: 1 }]}>
            <TouchableOpacity 
              style={styles.timeButton} 
              onPress={() => {
                setShowStartPicker(true);
                setPickerMode('date');
              }}
            >
              <MaterialIcons name="event" size={20} color="gray" style={styles.icon} />
              <Text style={styles.timeText}>
                {startTime ? formatDateTime(startTime) : 'Start Date & Time'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.inputContainer, { flex: 1 }]}>
            <TouchableOpacity 
              style={styles.timeButton} 
              onPress={() => {
                setShowEndPicker(true);
                setPickerMode('date');
              }}
            >
              <MaterialIcons name="event" size={20} color="gray" style={styles.icon} />
              <Text style={styles.timeText}>
                {endTime ? formatDateTime(endTime) : 'End Date & Time'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {(showStartPicker || showEndPicker) && (
          <Modal
            visible={showStartPicker || showEndPicker}
            transparent={true}
            animationType="slide"
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    Select {showStartPicker ? 'Start' : 'End'} {pickerMode === 'date' ? 'Date' : 'Time'}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => {
                      setShowStartPicker(false);
                      setShowEndPicker(false);
                    }}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={24} color="black" />
                  </TouchableOpacity>
                </View>

                <DateTimePicker
                  value={showStartPicker ? (startTime || new Date()) : (endTime || new Date())}
                  mode={pickerMode}
                  display="spinner"
                  onChange={showStartPicker ? handleStartChange : handleEndChange}
                  style={styles.picker}
                />

                <View style={styles.pickerButtons}>
                  {pickerMode === 'date' ? (
                    <TouchableOpacity
                      style={styles.nextButton}
                      onPress={() => setPickerMode('time')}
                    >
                      <Text style={styles.nextButtonText}>Next</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.doneButton}
                      onPress={() => {
                        setShowStartPicker(false);
                        setShowEndPicker(false);
                        setPickerMode('date');
                      }}
                    >
                      <Text style={styles.doneButtonText}>Done</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </Modal>
        )}
      </View>
    )},
    { key: 'address', component: (
      <View>
        <TouchableOpacity 
          style={styles.addressButton} 
          onPress={() => setAddressModalVisible(true)}
        >
          <Ionicons name="location-outline" size={20} color="gray" style={styles.icon} />
          <Text style={styles.addressButtonText}>
            {address || "Enter address"}
          </Text>
        </TouchableOpacity>

        <Modal
          visible={addressModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setAddressModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Enter Address</Text>
                <TouchableOpacity 
                  onPress={() => setAddressModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="black" />
                </TouchableOpacity>
              </View>

              <GooglePlacesAutocomplete
                placeholder='Search for address'
                fetchDetails={true}
                onPress={(data, details = null) => {
                  if (details) {
                    // Check if address has a street number
                    const hasStreetNumber = details.address_components.some(
                      component => component.types.includes('street_number')
                    );

                    if (!hasStreetNumber) {
                      alert('Please enter a complete address with a street number');
                      return;
                    }

                    setAddress(data.description);
                    setLatitude(details.geometry.location.lat);
                    setLongitude(details.geometry.location.lng);
                    setAddressModalVisible(false);
                  }
                }}
                query={{
                  key: GOOGLE_MAPS_API_KEY,
                  language: 'en',
                }}
                styles={{
                  container: {
                    flex: 0,
                  },
                  textInput: {
                    height: 45,
                    fontSize: 16,
                    backgroundColor: '#f0f0f0',
                    borderRadius: 8,
                    paddingHorizontal: 12,
                  },
                  listView: {
                    backgroundColor: 'white',
                    borderRadius: 8,
                    marginTop: 5,
                  },
                  row: {
                    padding: 13,
                    height: 44,
                    flexDirection: 'row',
                  },
                  separator: {
                    height: 1,
                    backgroundColor: '#e0e0e0',
                  },
                  description: {
                    fontSize: 15,
                  },
                }}
                enablePoweredByContainer={false}
              />
            </View>
          </View>
        </Modal>
      </View>
    )},
    { key: 'coordinates', component: (
      <View style={styles.coordinatesDisplay}>
        <Text style={styles.coordsText}>
          Lat: {latitude.toFixed(6)}, Long: {longitude.toFixed(6)}
        </Text>
      </View>
    )},
    { key: 'submit', component: (
      <TouchableOpacity style={styles.createButton} onPress={createSpace}>
        <LinearGradient
          colors={["#ff9d00", "#ffb347"]}
          style={styles.gradient}
        >
          <Text style={styles.buttonText}>Create Spot</Text>
        </LinearGradient>
      </TouchableOpacity>
    )},
  ];

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerTitle: "Create Spot" }} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <FlatList
          data={renderItems}
          renderItem={({ item }) => item.component}
          keyExtractor={item => item.key}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        />
      </KeyboardAvoidingView>
    </View>
  );
};

export default CreateSpace;

const styles = StyleSheet.create({
  container: {
    padding: 30,
    paddingBottom: 100,
    backgroundColor: "#f8f8f8",
    minHeight: '100%',
  },
  buttonContainer: {
    width: "100%",
    marginBottom: 15,
    borderRadius: 15,
  },
  imageContainer: {
    width: "100%",
    marginBottom: 15,
    borderRadius: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 15,
    backgroundColor: "white",
  },
  image: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 15,
    borderColor: "lightgray",
    borderWidth: 1,
  },
  btnText: {
    width: "100%",
    aspectRatio: 16 / 9,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 14,
    fontWeight: "600",
    color: "black",
    borderColor: "gray",
    borderWidth: 2,
    borderRadius: 15,
    borderStyle: "dashed",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 5,
  },
  dimensionsContainer: {
    flexDirection: "row",
    gap: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    height: 45,
    paddingHorizontal: 10,
    zIndex: 1,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 25,
  },
  createButton: {
    marginTop: 20,
  },
  coordinatesDisplay: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  coordsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  addressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    height: 45,
  },
  addressButtonText: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  picker: {
    height: 200,
    marginBottom: 20,
  },
  pickerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  doneButton: {
    backgroundColor: '#ff9d00',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#ff9d00',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});