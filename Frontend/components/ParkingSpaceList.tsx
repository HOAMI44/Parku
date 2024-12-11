import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { ParkingSpaceWithName } from '@/types/types';
import ParkingSpaceCard from './ParkingSpaceCard';

export type ParkingSpaceListProps = {
  parkingSpaces: (ParkingSpaceWithName & { distance?: string })[];
  noResultsText: string;
  onCardPress?: (parkingSpace: ParkingSpaceWithName) => void;
};

const ParkingSpaceList: React.FC<ParkingSpaceListProps> = ({
  parkingSpaces,
  noResultsText,
  onCardPress
}) => {
  if (!parkingSpaces.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{noResultsText}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={parkingSpaces}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity 
          onPress={() => onCardPress?.(item)}
          activeOpacity={0.7}
        >
          <ParkingSpaceCard parkingSpace={item} />
        </TouchableOpacity>
      )}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default ParkingSpaceList;
