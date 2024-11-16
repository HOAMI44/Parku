import React, { useState } from "react";
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  Image,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Stack } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const CreateSpot: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [length, setLength] = useState<string>("");
  const [width, setWidth] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [image, setImage] = useState<string>("");

  const pickImage = async () => {
    let result: ImagePicker.ImagePickerResult =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 1,
      });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const createSpot = () => {
    console.log("Creating spot with:", { name, length, width, price, image });
  };

  return (
    <>
      <Stack.Screen options={{ headerTitle: "Create Spot" }} />
      <View style={styles.container}>
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

        <View style={styles.inputContainer}>
          <Ionicons
            name="mail-outline"
            size={20}
            color="gray"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.dimensionsContainer}>
          <View style={[styles.inputContainer, { flex: 1 }]}>
            <MaterialIcons
              name="straighten"
              size={20}
              color="gray"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Width"
              value={width}
              onChangeText={setWidth}
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.inputContainer, { flex: 1 }]}>
            <MaterialIcons
              name="straighten"
              size={20}
              color="gray"
              style={[styles.icon, { transform: [{ rotate: "90deg" }] }]}
            />
            <TextInput
              style={styles.input}
              placeholder="Length"
              value={length}
              onChangeText={setLength}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Ionicons
            name="pricetag-outline"
            size={20}
            color="gray"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Price per minute"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity style={styles.createButton} onPress={createSpot}>
          <LinearGradient
            colors={["#ff9d00", "#ffb347"]}
            style={styles.gradient}
          >
            <Text style={styles.buttonText}>Create Spot</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default CreateSpot;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
    backgroundColor: "#f8f8f8",
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
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
});
