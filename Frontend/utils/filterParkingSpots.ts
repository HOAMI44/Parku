import { ParkingSpaceWithName } from "@/types/types";

export const filterParkingSpots = (
  parkingData: ParkingSpaceWithName[],
  filterCriteria: {
    length?: number;
    width?: number;
    distance?: number;
    minPrice?: number;
    maxPrice?: number;
    userLocation?: { latitude: number; longitude: number };
  }
) => {
  return parkingData.filter((parking) => {
    let passesLengthFilter = true;
    let passesWidthFilter = true;
    let passesDistanceFilter = true;
    let passesPriceFilter = true;

    // Length filter
    if (filterCriteria.length) {
      passesLengthFilter = (parking.length ?? 0) >= filterCriteria.length;
    }

    // Width filter
    if (filterCriteria.width) {
      passesWidthFilter = (parking.width ?? 0) >= filterCriteria.width;
    }

    // Distance filter
    if (filterCriteria.distance && filterCriteria.userLocation) {
      const distance = calculateDistance(
        parking.latitude,
        parking.longitude,
        filterCriteria.userLocation.latitude,
        filterCriteria.userLocation.longitude
      );
      passesDistanceFilter = distance <= filterCriteria.distance;
    }

    // Price filter
    if (filterCriteria.minPrice !== undefined && filterCriteria.maxPrice !== undefined) {
      passesPriceFilter =
        parking.price_per_hour >= filterCriteria.minPrice &&
        parking.price_per_hour <= filterCriteria.maxPrice;
    }

    return passesLengthFilter && passesWidthFilter && passesDistanceFilter && passesPriceFilter;
  });
};

// Funktion zur Berechnung der Entfernung zwischen zwei Punkten
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371; // Radius der Erde in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lat1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const deg2rad = (deg: number) => {
  return deg * (Math.PI / 180);
};
