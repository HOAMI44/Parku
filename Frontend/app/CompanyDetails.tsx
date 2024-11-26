import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useGetCompanyById, useGetParkingSpacesByCompanyId } from "@/hooks/database/queries";
import ParkingSpaceList from "@/components/ParkingSpaceList";
import { Stack } from "expo-router";

const CompanyDetails = () => {
  const { companyId } = useLocalSearchParams();
  const { data: company, loading: companyLoading } = useGetCompanyById(companyId as string);
  const { data: parkingSpaces, loading: spacesLoading } = useGetParkingSpacesByCompanyId(companyId as string);
  
  const isLoading = companyLoading || spacesLoading;

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#82DFF1" />
        <Text>Loading company details...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{
          title: company?.name || "Company Details",
          headerShown: true,
          headerBackTitle: "Back",
        }} 
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.companyName}>{company?.name}</Text>
          <Text style={styles.contactInfo}>{company?.contact_email}</Text>
          <Text style={styles.contactInfo}>{company?.phone_number}</Text>
          <Text style={styles.address}>{company?.address}</Text>
        </View>

        <View style={styles.spacesSection}>
          <Text style={styles.sectionTitle}>Available Parking Spaces</Text>
          <ParkingSpaceList
            parkingSpaces={parkingSpaces}
            noResultsText="This company has no parking spaces listed"
          />
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  contactInfo: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  address: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  spacesSection: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
});

export default CompanyDetails; 