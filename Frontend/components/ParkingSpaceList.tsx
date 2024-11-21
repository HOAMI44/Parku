import { FlatList, StyleSheet, Text, View } from "react-native";
import React from "react";
import { ParkingSpaceWithName } from "@/types/types";
import ParkingSpaceCard from "./ParkingSpaceCard";

type ParkingSpaceListProps = {
  parkingSpaces: (ParkingSpaceWithName & { distance?: string })[] | null;
  noResultsText?: string;
};

const ParkingSpaceList = ({
  parkingSpaces,
  noResultsText,
}: ParkingSpaceListProps) => {
  return (
    <>
      {!parkingSpaces || parkingSpaces.length === 0 ? (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>
            {noResultsText ?? "No parking spaces found"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={parkingSpaces}
          renderItem={({ item }) => (
            <ParkingSpaceCard 
              parkingSpace={item} 
              distance={item.distance}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listStyle}
        />
      )}
    </>
  );
};

export default ParkingSpaceList;

const styles = StyleSheet.create({
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  noResultsText: {
    fontSize: 20,
    color: "#666",
    fontWeight: "bold",
    textAlign: "center",
  },
  listStyle: {
    display: "flex",
    gap: 15,
    padding: 15,
    paddingTop: 0,
  },
});
