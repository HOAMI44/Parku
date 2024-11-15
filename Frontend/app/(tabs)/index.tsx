import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';

type Props = {}

const HomeScreen = (props: Props) => {
  const navigation = useNavigation();
  const [parkingData, setParkingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedParking, setSelectedParking] = useState(null);
  const [userName, setUserName] = useState<string>(); 

  const dummyParkingData = [
    { id: '1', name: 'Haus 1', owner: 'Peter Meter', description: 'Ein schöner Parkplatz in der Nähe der Innenstadt' },
    { id: '2', name: 'Garage 1', owner: 'Gewerbe b', description: 'Garage in einem ruhigen Gewerbegebiet' },
    { id: '3', name: 'Garten', owner: 'Rolf Schmolff', description: 'Ein Parkplatz direkt neben einem wunderschönen Garten' },
  ];

  // Funktion zum Abrufen der Parkplatzdaten
  const fetchParkingData = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://example.com/api/parkingspots'); // Platzhalter-URL
      if (!response.ok) {
        throw new Error('Fehler beim Abrufen der Parkplatzdaten');
      }
      const data = await response.json();
      setParkingData(data);
    } catch (err: any) {
      console.log('Backend nicht erreichbar, benutze Dummy-Daten.');
      setParkingData(dummyParkingData);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  // Funktion zum Abrufen der Nutzerdaten (einschließlich Benutzername)
  const fetchUserData = async () => {
    try {
      const response = await fetch('https://example.com/api/user'); // Platzhalter-URL für Nutzerdaten
      if (!response.ok) {
        throw new Error('Fehler beim Abrufen der Nutzerdaten');
      }
      const userData = await response.json();
      setUserName(userData.name);
    } catch (err: any) {
      console.log('Backend nicht erreichbar, benutze Dummy-Daten für den Nutzernamen.');
      setUserName("Amogus"); 
    }
  };

  useEffect(() => {
    fetchParkingData();
    fetchUserData(); 
  }, []);

  const renderParkingItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => setSelectedParking(item)}
    >
      <View style={styles.parkingItem}>
        <View style={styles.parkingIconContainer}>
          <Text style={styles.parkingIcon}>{item.name.charAt(0)}</Text>
        </View>
        <View style={styles.parkingDetails}>
          <Text style={styles.parkingName}>{item.name}</Text>
          <Text style={styles.parkingOwner}>{item.owner}</Text>
        </View>
        <View style={styles.parkingActions}>
          <Text>...</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading parking spots...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  if (selectedParking) {
    return (
      <View style={styles.detailContainer}>
        <Text style={styles.detailTitle}>{selectedParking.name}</Text>
        <Text style={styles.detailOwner}>Owner: {selectedParking.owner}</Text>
        <Text style={styles.detailDescription}>{selectedParking.description}</Text>
        
        {/* Button zum Zurückkehren zur Liste */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setSelectedParking(null)}
        >
          <Text style={styles.backButtonText}>Back to list</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Hello {userName}!</Text>

      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => navigation.navigate('explore')}
      >
        <Text style={styles.exploreButtonText}>Go explore parking lots!</Text>
      </TouchableOpacity>

      {/* Horizontale Linie */}
      <View style={styles.horizontalLine} />

      <Text style={styles.sectionTitle}>In your vicinity:</Text>
      <FlatList
        data={parkingData}
        renderItem={renderParkingItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 24,
  },
  greeting: {
    fontSize: 35,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: "#ff9d00",
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  exploreButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center', // Text innerhalb des Buttons zentrieren
  },
  horizontalLine: {
    height: 1,
    backgroundColor: '#cccccc',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  parkingItem: {
    backgroundColor: '#f9f9f9',
    padding: 28,
    borderRadius: 16,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  parkingIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ff9d00",
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  parkingIcon: {
    fontSize: 26,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  parkingDetails: {
    flex: 1,
  },
  parkingName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  parkingOwner: {
    fontSize: 16,
    color: '#666',
  },
  parkingActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  detailContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  detailTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailOwner: {
    fontSize: 20,
    marginBottom: 8,
  },
  detailDescription: {
    fontSize: 18,
    color: '#666',
    marginBottom: 16,
  },
  backButton: {
    marginTop: 20,
    backgroundColor: "#ff9d00",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
