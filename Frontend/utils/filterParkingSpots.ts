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
  console.log("Starting filtering with:", {
    totalSpots: parkingData.length,
    criteria: filterCriteria,
  });

  return parkingData.filter((parking) => {
    const { length, width, distance, userLocation, minPrice, maxPrice } =
      filterCriteria;

    const filters = [
      () => length === undefined || parking.length >= length,
      () => width === undefined || parking.width >= width,
      () => {
        if (distance === undefined || userLocation === undefined) return true;
        return (
          calculateDistance(
            parking.latitude,
            parking.longitude,
            userLocation.latitude,
            userLocation.longitude
          ) <= distance
        );
      },
      () => {
        if (minPrice === undefined || maxPrice === undefined) return true;
        return (
          parking.price_per_hour >= minPrice &&
          parking.price_per_hour <= maxPrice
        );
      },
    ];

    return filters.every((filter) => filter());
  });
};

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371; // Earth's radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  console.log("Distance calculation details:", {
    from: { lat: lat1, lon: lon1 },
    to: { lat: lat2, lon: lon2 },
    distance,
  });

  return distance;
};

const deg2rad = (deg: number) => {
  return deg * (Math.PI / 180);
};
