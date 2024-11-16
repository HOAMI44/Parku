import { StyleSheet, Text, View, Image } from "react-native";
import { Stack } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { FontAwesome } from "@expo/vector-icons";
import ParkingSpaceList from "@/components/ParkingSpaceList";
import {
  useGetParkingSpacesWithNameByUserId,
  useGetUserById,
} from "@/hooks/database/queries";
import React from "react";

const ProfileScreen = () => {
  const { session } = useAuth();
  const { data: user } = useGetUserById(session?.user?.id ?? "");
  const { data: parkingSpaces } = useGetParkingSpacesWithNameByUserId(
    session?.user?.id ?? ""
  );

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FontAwesome
          key={i}
          name={i <= rating ? "star" : "star-o"}
          size={24}
          color="#82DFF1"
        />
      );
    }

    return stars;
  };

  return (
    <>
      <Stack.Screen options={{ headerTitle: "Profile" }} />
      <View>
        <View style={styles.profileInfo}>
          <Image
            source={{ uri: user?.image_url }}
            style={styles.profileImage}
          />
          <Text
            style={styles.name}
          >{`${user?.first_name} ${user?.last_name}`}</Text>
          {!!user?.company_id && (
            <Text style={styles.company}>{user.company_id}</Text>
          )}
          <View style={styles.starsContainer}>{renderStars(5)}</View>
        </View>
        <ParkingSpaceList
          parkingSpaces={parkingSpaces}
          noResultsText="You have no parking spaces listed"
        />
      </View>
    </>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  profileInfo: {
    padding: 15,
    alignItems: "center",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
  },
  company: {
    fontSize: 16,
    color: "gray",
  },
  rating: {
    fontSize: 16,
    marginVertical: 10,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 5,
    marginVertical: 5,
  },
});
