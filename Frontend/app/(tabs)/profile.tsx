import { StyleSheet, Text, View, Image, FlatList } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'
import { useAuth } from '../../contexts/AuthContext';

type Props = {}

const ProfileScreen = (props: Props) => {
  const { session } = useAuth();

  const profile = {
    name: "John Doe",
    company: "Tech Co.",
    rating: 4.5,
    imageUrl: 'https://example.com/profile.jpg',
    parkingSpots: [
      { id: '1', location: 'Spot 1' },
      { id: '2', location: 'Spot 2' },
      // Add more spots as needed
    ]
  };

  return (
    <>
      <Stack.Screen options={{ headerTitle: "Profile" }} />
      <View style={styles.container}>
        <Image source={{ uri: profile.imageUrl }} style={styles.profileImage} />
        <Text style={styles.name}>{profile.name}</Text>
        {profile.company && <Text style={styles.company}>{profile.company}</Text>}
        <Text style={styles.rating}>Rating: {profile.rating} / 5</Text>
        <FlatList
          data={profile.parkingSpots}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Text style={styles.parkingSpot}>{item.location}</Text>}
        />
      </View>
    </>
  )
}

export default ProfileScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  company: {
    fontSize: 16,
    color: 'gray'
  },
  rating: {
    fontSize: 16,
    marginVertical: 10
  },
  parkingSpot: {
    fontSize: 16,
    marginVertical: 5
  }
})