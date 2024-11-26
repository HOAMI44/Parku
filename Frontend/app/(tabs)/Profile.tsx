import { StyleSheet, Text, View, Image, ActivityIndicator, TouchableOpacity } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { FontAwesome } from "@expo/vector-icons";
import ParkingSpaceList from "@/components/ParkingSpaceList";
import {
  useGetAverageReviewScoreByUserId,
  useGetParkingSpacesWithNameByUserId,
  useGetUserById,
  useGetCompanyById,
} from "@/hooks/database/queries";
import React from "react";
import { router } from "expo-router";
import { Stack } from "expo-router";

const ProfileScreen = () => {
  const { session } = useAuth();
  const { data: user, loading: userLoading } = useGetUserById(session?.user?.id ?? "");
  const { data: company, loading: companyLoading } = useGetCompanyById(user?.company_id ?? "");
  const { data: parkingSpaces, loading: parkingSpacesLoading } = useGetParkingSpacesWithNameByUserId(
    session?.user?.id ?? ""
  );
  const { data: rating, loading: ratingLoading } = useGetAverageReviewScoreByUserId(session?.user?.id ?? "");
  const isLoading = userLoading || parkingSpacesLoading || ratingLoading || companyLoading;

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

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#82DFF1" />
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{
          title: "Profile",
          headerShown: false,
        }} 
      />
      <View style={styles.container}>
        <Text style={styles.header}>Profile</Text>
        <View style={styles.profileInfo}>
          <Image source={{ uri: user?.image_url }} style={styles.profileImage} />
          <Text style={styles.name}>{`${user?.first_name} ${user?.last_name}`}</Text>
          
          {!!user?.company_id && company && (
            <TouchableOpacity
              onPress={() => router.push({
                pathname: "/CompanyDetails",
                params: { companyId: company.id }
              })}
              style={styles.companyButton}
            >
              <Text style={styles.companyName}>{company.name}</Text>
              <Text style={styles.companySubtext}>View company profile →</Text>
            </TouchableOpacity>
          )}

          <View style={styles.starsContainer}>{renderStars(rating ?? 0)}</View>
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
  container: {
    flex: 1,
    justifyContent: "flex-start",
    paddingTop: 0,
  },
  header: {
    fontSize: 26,
    textAlign: "center",
    fontWeight: "bold",
    marginVertical: 20,
  },
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
  companyButton: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  companyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E8B57',
  },
  companySubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 5,
    marginVertical: 5,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
