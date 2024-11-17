import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Slider from "@react-native-community/slider";

type FilterPopupProps = {
  visible: boolean;
  onClose: () => void;
  onApplyFilter: (filterCriteria: {
    length?: number;
    width?: number;
    distance?: number;
    minPrice?: number;
    maxPrice?: number;
  }) => void;
};

const FilterPopup: React.FC<FilterPopupProps> = ({
  visible,
  onClose,
  onApplyFilter,
}) => {
  const [length, setLength] = useState<number>();
  const [width, setWidth] = useState<number>();
  const [distance, setDistance] = useState<number>(5); // Default 5 km
  const [minPrice, setMinPrice] = useState<number>(0); // Minimum price in default
  const [maxPrice, setMaxPrice] = useState<number>(50); // Maximum price in default

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filter Parking Spots</Text>

          <TextInput
            style={styles.input}
            placeholder="Length (m)"
            keyboardType="numeric"
            value={length ? length.toString() : ''}
            onChangeText={(text) => setLength(parseFloat(text) || undefined)}
          />

          <TextInput
            style={styles.input}
            placeholder="Width (m)"
            keyboardType="numeric"
            value={width ? width.toString() : ''}
            onChangeText={(text) => setWidth(parseFloat(text) || undefined)}
          />

          <Text style={styles.label}>Distance (km): {distance.toFixed(1)}</Text>
          <Slider
            style={{ width: 200, height: 40 }}
            minimumValue={1}
            maximumValue={20}
            step={0.5}
            value={distance}
            onValueChange={setDistance}
          />

          <Text style={styles.label}>Price per Hour (€):</Text>
          <Text style={styles.priceRange}>
            Min: {minPrice} - Max: {maxPrice}
          </Text>
          <Slider
            style={{ width: 200, height: 40 }}
            minimumValue={0}
            maximumValue={100}
            step={1}
            value={minPrice}
            onValueChange={setMinPrice}
          />
          <Slider
            style={{ width: 200, height: 40 }}
            minimumValue={minPrice}
            maximumValue={100}
            step={1}
            value={maxPrice}
            onValueChange={setMaxPrice}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() =>
                onApplyFilter({ length, width, distance, minPrice, maxPrice })
              }
            >
              <Text style={styles.buttonText}>APPLY FILTER</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.buttonText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FilterPopup;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 300,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#333",
  },
  priceRange: {
    fontSize: 16,
    marginBottom: 10,
    color: "#555",
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  applyButton: {
    flex: 1,
    backgroundColor: "#82DFF1",
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 10,
    alignItems: "center",
  },
  closeButton: {
    flex: 1,
    backgroundColor: "#82DFF1",
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
