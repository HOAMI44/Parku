import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import React from "react";
import { ParkingSpaceWithName } from "@/types";

type ParkingSpaceCardProps = {
  parkingSpace: ParkingSpaceWithName;
};

const ParkingSpaceCard = ({ parkingSpace }: ParkingSpaceCardProps) => {
  return (
    <TouchableOpacity style={styles.parkingSpace}>
      <Image
        source={{ uri: parkingSpace.image_url }}
        style={styles.parkingImage}
      />
      <View style={styles.parkingDetails}>
        <Text numberOfLines={1} style={styles.parkingAddress}>
          {parkingSpace.address}
        </Text>
        <Text
          numberOfLines={1}
          style={styles.parkingUserFullName}
        >{`${parkingSpace.users.first_name} ${parkingSpace.users.last_name}`}</Text>
        <Text
          numberOfLines={1}
          style={styles.parkingPricePerHour}
        >{`${parkingSpace.price_per_hour} € / h`}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default ParkingSpaceCard;

const styles = StyleSheet.create({
  parkingSpace: {
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 15,
    backgroundColor: "white",
  },
  parkingImage: {
    width: "100%",
    aspectRatio: 21 / 9,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  parkingDetails: {
    padding: 10,
  },
  parkingAddress: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  parkingUserFullName: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  parkingPricePerHour: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2E8B57",
  },
});
