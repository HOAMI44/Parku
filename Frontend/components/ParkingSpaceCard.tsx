import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ParkingSpaceWithName } from '@/types/types';
import { formatCurrency } from '@/utils/formatters';

type ParkingSpaceCardProps = {
  parkingSpace: ParkingSpaceWithName & { distance?: string };
};

const ParkingSpaceCard: React.FC<ParkingSpaceCardProps> = ({ parkingSpace }) => {
  return (
    <View style={styles.card}>
      <Image
        source={{ uri: parkingSpace.image_url }}
        style={styles.image}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.price}>
            {formatCurrency(parkingSpace.price_per_hour)}/h
          </Text>
          {parkingSpace.distance && (
            <Text style={styles.distance}>{parkingSpace.distance} km</Text>
          )}
        </View>
        <Text style={styles.address} numberOfLines={2}>
          {parkingSpace.address}
        </Text>
        <View style={styles.footer}>
          <View style={styles.dimensions}>
            <Ionicons name="resize" size={16} color="#666" />
            <Text style={styles.dimensionsText}>
              {parkingSpace.width}m × {parkingSpace.length}m
            </Text>
          </View>
          <Text style={styles.owner}>
            {parkingSpace.users.first_name} {parkingSpace.users.last_name}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: '#f0f0f0',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2196F3',
  },
  distance: {
    fontSize: 14,
    color: '#666',
  },
  address: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dimensions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dimensionsText: {
    fontSize: 14,
    color: '#666',
  },
  owner: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default ParkingSpaceCard;
