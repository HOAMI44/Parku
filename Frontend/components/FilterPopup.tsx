import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import Slider from "@react-native-community/slider";
import MultiSlider from '@ptomasroos/react-native-multi-slider';

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
  const [distance, setDistance] = useState<number>(5);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50]);

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filter Parking Spots</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Dimensions</Text>
            <View style={styles.dimensionsContainer}>
              <View style={styles.dimensionInput}>
                <TextInput
                  style={styles.input}
                  placeholder="Length (m)"
                  keyboardType="numeric"
                  value={length ? length.toString() : ''}
                  onChangeText={(text) => setLength(parseFloat(text) || undefined)}
                />
              </View>
              <View style={styles.dimensionInput}>
                <TextInput
                  style={styles.input}
                  placeholder="Width (m)"
                  keyboardType="numeric"
                  value={width ? width.toString() : ''}
                  onChangeText={(text) => setWidth(parseFloat(text) || undefined)}
                />
              </View>
            </View>
          </View>

          <View style={styles.sliderGroup}>
            <Text style={styles.inputLabel}>Distance Range</Text>
            <Text style={styles.sliderValue}>{distance.toFixed(1)} km</Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={20}
              step={0.5}
              value={distance}
              onValueChange={setDistance}
              minimumTrackTintColor="#82DFF1"
              maximumTrackTintColor="#E0E0E0"
              thumbTintColor="#82DFF1"
            />
          </View>

          <View style={styles.sliderGroup}>
            <Text style={styles.inputLabel}>Price Range</Text>
            <Text style={styles.sliderValue}>€{priceRange[0]} - €{priceRange[1]}</Text>
            <MultiSlider
              values={[priceRange[0], priceRange[1]]}
              min={0}
              max={100}
              step={1}
              sliderLength={Dimensions.get('window').width * 0.8 - 48}
              onValuesChange={handlePriceRangeChange}
              selectedStyle={{
                backgroundColor: '#82DFF1',
              }}
              unselectedStyle={{
                backgroundColor: '#E0E0E0',
              }}
              containerStyle={{
                height: 40,
                marginHorizontal: -10,
              }}
              trackStyle={{
                height: 4,
                borderRadius: 2,
              }}
              markerStyle={{
                height: 24,
                width: 24,
                borderRadius: 12,
                backgroundColor: '#82DFF1',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.closeButton]} 
              onPress={onClose}
            >
              <Text style={[styles.buttonText, styles.closeButtonText]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.applyButton]}
              onPress={() => onApplyFilter({ 
                length, 
                width, 
                distance, 
                minPrice: priceRange[0], 
                maxPrice: priceRange[1] 
              })}
            >
              <Text style={styles.buttonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: Dimensions.get('window').width * 0.9,
    maxWidth: 400,
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#333",
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 24,
    width: "100%",
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  dimensionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  dimensionInput: {
    flex: 1,
  },
  input: {
    height: 48,
    borderColor: "#E0E0E0",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#F8F8F8",
  },
  sliderGroup: {
    marginBottom: 24,
    width: "100%",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderValue: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  applyButton: {
    backgroundColor: "#82DFF1",
  },
  closeButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#82DFF1",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  closeButtonText: {
    color: "#82DFF1",
  },
});

export default FilterPopup;
