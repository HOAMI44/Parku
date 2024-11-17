import { StyleSheet, Text, TouchableOpacity, View, Image, Dimensions } from "react-native";
import React from "react";
import { ParkingSpaceWithName } from "@/types/types";

type ParkingSpaceCardProps = {
  parkingSpace: ParkingSpaceWithName;
  distance?: string;
};

const ParkingSpaceCard = ({ parkingSpace, distance }: ParkingSpaceCardProps) => {
  return (
    <TouchableOpacity style={styles.parkingSpace}>
      <Image
        source={{ uri: parkingSpace.image_url }}
        style={styles.parkingImage}
      />
      <View style={styles.parkingDetails}>
        <View style={styles.headerRow}>
          <Text numberOfLines={1} style={styles.parkingAddress}>
            {parkingSpace.address}
          </Text>
          {distance && (
            <Text style={styles.distance}>{distance} km</Text>
          )}
        </View>
        <Text
          numberOfLines={1}
          style={styles.parkingUserFullName}
        >{`${parkingSpace.users.first_name} ${parkingSpace.users.last_name}`}</Text>
        <View style={styles.numbers}>
          <Text
            numberOfLines={1}
            style={styles.parkingPricePerHour}
          >{`${parkingSpace.price_per_hour} € / h`}</Text>
          <Text
            numberOfLines={1}
            style={styles.dimensions}
          >{`W: ${parkingSpace.width} | L: ${parkingSpace.length}`}</Text>
        </View>
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
    width: '100%',
  },
  parkingImage: {
    width: "100%",
    aspectRatio: 21 / 9, // Making it slightly shorter
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  parkingDetails: {
    padding: 8, // Reduced padding
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  parkingAddress: {
    fontSize: 14, // Slightly smaller
    fontWeight: "bold",
    flex: 1,
  },
  distance: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  parkingUserFullName: {
    fontSize: 13, // Slightly smaller
    color: "#666",
    marginBottom: 2,
  },
  parkingPricePerHour: {
    fontSize: 13, // Slightly smaller
    fontWeight: "500",
    color: "#2E8B57",
  },
  numbers: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dimensions: {
    fontSize: 13, // Slightly smaller
    fontWeight: "500",
  }
});
